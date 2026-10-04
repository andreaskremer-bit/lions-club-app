// Edge Function `send-notifications` – liest die Outbox `public.notification`
// (sent_at is null) und stellt sie per Web-Push zu, mit E-Mail-Fallback (Club-SMTP).
//
// SICHERUNG (Geheim-Phase):
//   - REMINDERS_ARMED !== 'true'  -> Dry-Run: loggt nur, sendet NICHT, setzt sent_at NICHT.
//   - REMINDERS_ALLOWLIST (kommasepariert) -> wenn gesetzt, werden NUR diese
//     Empfänger-Adressen bedient; alle anderen werden übersprungen.
// Das ist die zweite Schicht; die erste ist das Empfänger-Gate beim Erzeugen
// (member.notifications_enabled in enqueue_due_reminders).
//
// Aufrufschutz: verify_jwt = false (config.toml) -> Zugriff über Bearer-Token
// (Service-Role-Key) im Authorization-Header. Wird von pg_cron/pg_net bzw. der
// Admin-Trigger-Route mit dem Service-Key aufgerufen.

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import { type Kind, pathFor, renderEmail } from './email.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ARMED = Deno.env.get('REMINDERS_ARMED') === 'true';
const ALLOWLIST = (Deno.env.get('REMINDERS_ALLOWLIST') ?? '')
	.split(',')
	.map((s) => s.trim().toLowerCase())
	.filter(Boolean);

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC_KEY') ?? '';
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE_KEY') ?? '';
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:vorstand@lions-bonn-rheinaue.de';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

type Channel = 'push' | 'email' | 'both';

type Notification = {
	id: string;
	kind: Kind;
	recipient_id: string;
	event_id: string | null;
	document_id: string | null;
	news_post_id: string | null;
	title: string;
	body: string | null;
	attempts?: number;
	member: { email: string; notification_channel: Channel } | null;
};

type Subscription = {
	endpoint: string;
	p256dh: string;
	auth: string;
};

function buildPayload(n: Notification) {
	return JSON.stringify({
		title: n.title,
		body: n.body ?? '',
		// Ziel-Pfad kommt aus `email.ts`, damit Push und E-Mail dieselbe Stelle öffnen.
		url: pathFor(n),
		tag: n.id
	});
}

/**
 * Ein SMTP-Client je Lauf statt einer neuen Verbindung (TLS-Handshake + AUTH) pro Mail:
 * Bei einer News an alle Mitglieder wären das sonst Dutzende Verbindungen nacheinander –
 * zu langsam für das Zeitlimit der Function und riskant bei Gmails Verbindungslimits.
 */
class Mailer {
	#client: SMTPClient | null = null;
	readonly configured: boolean;
	readonly #from: string;
	readonly #host: string;
	readonly #user: string;
	readonly #pass: string;
	readonly #port: number;
	readonly #insecure: boolean;

	constructor() {
		this.#host = Deno.env.get('SMTP_HOST') ?? '';
		this.#user = Deno.env.get('SMTP_USER') ?? '';
		this.#pass = Deno.env.get('SMTP_PASS') ?? '';
		this.#port = Number(Deno.env.get('SMTP_PORT') ?? '465');
		this.#from = Deno.env.get('SMTP_FROM') ?? this.#user;
		// Nur für lokale Tests gegen Mailpit (kein TLS, kein AUTH). In Produktion NIE setzen.
		this.#insecure = Deno.env.get('SMTP_ALLOW_INSECURE') === 'true';
		this.configured = !!(this.#host && ((this.#user && this.#pass) || this.#insecure));
	}

	async send(to: string, subject: string, text: string, html: string): Promise<boolean> {
		if (!this.configured) return false;
		// Verbindung erst bei der ersten Mail öffnen – die meisten Läufe senden nichts.
		this.#client ??= new SMTPClient({
			connection: {
				hostname: this.#host,
				port: this.#port,
				// 465 = implizites TLS; andere Ports (587) starten unverschlüsselt und
				// wechseln per STARTTLS – mit tls: true schlüge dort jede Mail fehl.
				tls: this.#port === 465,
				auth: this.#user ? { username: this.#user, password: this.#pass } : undefined
			},
			debug: { allowUnsecure: this.#insecure }
		});
		// content + html -> multipart/alternative; Clients ohne HTML sehen den Text.
		await this.#client.send({ from: this.#from, to, subject, content: text, html });
		return true;
	}

	async close() {
		// Nach einem Verbindungsfehler wirft denomailer beim Schließen selbst – das darf
		// den Lauf nicht mit 500 beenden, der Versandzustand ist da längst gespeichert.
		try {
			await this.#client?.close();
		} catch (e) {
			console.warn('SMTP-Verbindung ließ sich nicht sauber schließen:', e);
		}
	}
}

Deno.serve(async (req) => {
	// Aufrufschutz: Bearer-Token muss dem Service-Role-Key entsprechen.
	const auth = req.headers.get('Authorization') ?? '';
	if (auth !== `Bearer ${SERVICE_ROLE}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
	const SELECT =
		'id, kind, recipient_id, event_id, document_id, news_post_id, title, body, attempts, member:recipient_id(email, notification_channel)';

	// Scharf: Zeilen atomar reservieren (claim_notifications), damit zwei gleichzeitige
	// Läufe nichts doppelt senden und unzustellbare Zeilen nach 5 Versuchen ruhen.
	// Dry-Run: nur lesen, nichts reservieren.
	let ids: string[] | null = null;
	if (ARMED) {
		const { data: claimed, error: claimErr } = await supabase.rpc('claim_notifications', {
			p_limit: 200
		});
		if (claimErr) return new Response(`DB-Fehler: ${claimErr.message}`, { status: 500 });
		ids = (claimed ?? []) as string[];
	}

	let query = supabase.from('notification').select(SELECT).order('created_at', { ascending: true });
	query = ids
		? query.in('id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
		: query.is('sent_at', null).limit(200);
	const { data: notes, error } = await query;
	if (error) return new Response(`DB-Fehler: ${error.message}`, { status: 500 });

	const pending = (notes ?? []) as unknown as Notification[];

	// Push-Abos je Mitglied vorab laden. Scheitert das, abbrechen statt alle Empfänger
	// als „ohne Push-Abo“ zu behandeln (sonst ginge an alle eine E-Mail statt Push).
	const recipientIds = [...new Set(pending.map((n) => n.recipient_id))];
	const subsByMember = new Map<string, Subscription[]>();
	if (recipientIds.length) {
		const { data: subs, error: subsErr } = await supabase
			.from('push_subscription')
			.select('member_id, endpoint, p256dh, auth')
			.in('member_id', recipientIds);
		if (subsErr) {
			if (ids?.length) {
				await supabase.from('notification').update({ claimed_at: null }).in('id', ids);
			}
			return new Response(`DB-Fehler (Push-Abos): ${subsErr.message}`, { status: 500 });
		}
		for (const s of subs ?? []) {
			const list = subsByMember.get(s.member_id) ?? [];
			list.push({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth });
			subsByMember.set(s.member_id, list);
		}
	}

	const result = {
		armed: ARMED,
		total: pending.length,
		push: 0,
		email: 0,
		skipped: 0,
		sent: 0,
		failed: 0
	};
	const mailer = new Mailer();
	if (ARMED && !mailer.configured)
		console.warn('SMTP nicht konfiguriert – E-Mail-Fallback übersprungen.');

	try {
		for (const n of pending) {
			const email = n.member?.email?.toLowerCase() ?? '';

			// Zweite Sicherungsschicht: Allowlist. Übersprungene Zeilen nur freigeben,
			// nicht als Fehlversuch zählen.
			if (ALLOWLIST.length && !ALLOWLIST.includes(email)) {
				result.skipped++;
				if (ARMED) await supabase.from('notification').update({ claimed_at: null }).eq('id', n.id);
				continue;
			}

			const subs = subsByMember.get(n.recipient_id) ?? [];

			// P4 – bevorzugte Kanäle des Empfängers (Default both).
			const channel: Channel = n.member?.notification_channel ?? 'both';
			const wantsPush = channel === 'push' || channel === 'both';

			if (!ARMED) {
				// Dry-Run: nur protokollieren, nichts senden, sent_at NICHT setzen.
				const plan = [
					wantsPush ? `${subs.length} Push-Abo(s)` : null,
					channel === 'email' ? 'E-Mail' : 'E-Mail-Fallback'
				]
					.filter(Boolean)
					.join(' + ');
				console.log(
					`[DRY-RUN] würde senden an ${email || n.recipient_id} [${channel}]: "${n.title}" (${plan})`
				);
				continue;
			}

			let delivered = false;

			// 1) Web-Push an alle Abos des Empfängers (außer Kanal = nur E-Mail).
			if (wantsPush) {
				for (const s of subs) {
					try {
						await webpush.sendNotification(
							{ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
							buildPayload(n)
						);
						delivered = true;
						result.push++;
					} catch (e) {
						const status = (e as { statusCode?: number }).statusCode;
						// Abo ungültig geworden -> entfernen.
						if (status === 404 || status === 410) {
							await supabase.from('push_subscription').delete().eq('endpoint', s.endpoint);
						} else {
							console.error(`Push-Fehler an ${email}:`, e);
						}
					}
				}
			}

			// 2) E-Mail: bei Kanal 'email' immer, sonst als Fallback, wenn kein Push
			//    angekommen ist – auch bei 'push' (es gibt kein Voll-Opt-out; ohne aktives
			//    Push-Abo bekäme das Mitglied sonst gar nichts außerhalb der App).
			const emailNow = email && (channel === 'email' || !delivered);
			if (emailNow) {
				try {
					const mail = renderEmail(n);
					if (await mailer.send(email, mail.subject, mail.text, mail.html)) {
						delivered = true;
						result.email++;
					}
				} catch (e) {
					console.error(`E-Mail-Fehler an ${email}:`, e);
				}
			}

			// Zugestellt -> sent_at; sonst Fehlversuch zählen (Wartezeit wächst, nach
			// 5 Versuchen ruht die Zeile). Die Reservierung wird in beiden Fällen gelöst.
			if (delivered) {
				await supabase
					.from('notification')
					.update({ sent_at: new Date().toISOString(), claimed_at: null })
					.eq('id', n.id);
				result.sent++;
			} else {
				await supabase
					.from('notification')
					.update({
						attempts: (n.attempts ?? 0) + 1,
						last_attempt_at: new Date().toISOString(),
						claimed_at: null
					})
					.eq('id', n.id);
				result.failed++;
			}
		}
	} finally {
		await mailer.close();
	}

	return new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' }
	});
});
