// Edge Function `send-notifications` — liest die Outbox `public.notification`
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
	recipient_id: string;
	event_id: string | null;
	document_id: string | null;
	news_post_id: string | null;
	title: string;
	body: string | null;
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
		url: n.event_id
			? `/termine/${n.event_id}`
			: n.document_id
				? '/dokumente'
				: n.news_post_id
					? '/news'
					: '/benachrichtigungen',
		tag: n.id
	});
}

async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
	const host = Deno.env.get('SMTP_HOST');
	const user = Deno.env.get('SMTP_USER');
	const pass = Deno.env.get('SMTP_PASS');
	const from = Deno.env.get('SMTP_FROM') ?? user ?? '';
	if (!host || !user || !pass) {
		console.warn('SMTP nicht konfiguriert — E-Mail-Fallback übersprungen.');
		return false;
	}
	const client = new SMTPClient({
		connection: {
			hostname: host,
			port: Number(Deno.env.get('SMTP_PORT') ?? '465'),
			tls: true,
			auth: { username: user, password: pass }
		}
	});
	try {
		await client.send({ from, to, subject, content: text });
		return true;
	} finally {
		await client.close();
	}
}

Deno.serve(async (req) => {
	// Aufrufschutz: Bearer-Token muss dem Service-Role-Key entsprechen.
	const auth = req.headers.get('Authorization') ?? '';
	if (auth !== `Bearer ${SERVICE_ROLE}`) {
		return new Response('Unauthorized', { status: 401 });
	}

	const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

	const { data: notes, error } = await supabase
		.from('notification')
		.select(
			'id, recipient_id, event_id, document_id, news_post_id, title, body, member:recipient_id(email, notification_channel)'
		)
		.is('sent_at', null)
		.order('created_at', { ascending: true })
		.limit(500);
	if (error) return new Response(`DB-Fehler: ${error.message}`, { status: 500 });

	const pending = (notes ?? []) as unknown as Notification[];

	// Push-Abos je Mitglied vorab laden.
	const recipientIds = [...new Set(pending.map((n) => n.recipient_id))];
	const subsByMember = new Map<string, Subscription[]>();
	if (recipientIds.length) {
		const { data: subs } = await supabase
			.from('push_subscription')
			.select('member_id, endpoint, p256dh, auth')
			.in('member_id', recipientIds);
		for (const s of subs ?? []) {
			const list = subsByMember.get(s.member_id) ?? [];
			list.push({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth });
			subsByMember.set(s.member_id, list);
		}
	}

	const result = { armed: ARMED, total: pending.length, push: 0, email: 0, skipped: 0, sent: 0 };

	for (const n of pending) {
		const email = n.member?.email?.toLowerCase() ?? '';

		// Zweite Sicherungsschicht: Allowlist.
		if (ALLOWLIST.length && !ALLOWLIST.includes(email)) {
			result.skipped++;
			continue;
		}

		const subs = subsByMember.get(n.recipient_id) ?? [];

		// P4 — bevorzugte Kanäle des Empfängers (Default both).
		const channel: Channel = n.member?.notification_channel ?? 'both';
		const wantsPush = channel === 'push' || channel === 'both';
		const wantsEmail = channel === 'email' || channel === 'both';

		if (!ARMED) {
			// Dry-Run: nur protokollieren, nichts senden, sent_at NICHT setzen.
			const plan = [
				wantsPush ? `${subs.length} Push-Abo(s)` : null,
				channel === 'email' ? 'E-Mail' : channel === 'both' ? 'E-Mail-Fallback' : null
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

		// 2) E-Mail: bei Kanal 'email' immer, bei 'both' nur als Fallback (kein Push
		//    zugestellt), bei 'push' nie.
		const emailNow = wantsEmail && email && (channel === 'email' || !delivered);
		if (emailNow) {
			try {
				const ok = await sendEmail(email, n.title, n.body ?? n.title);
				if (ok) {
					delivered = true;
					result.email++;
				}
			} catch (e) {
				console.error(`E-Mail-Fehler an ${email}:`, e);
			}
		}

		// sent_at setzen, sobald mindestens ein Kanal zugestellt hat.
		if (delivered) {
			await supabase
				.from('notification')
				.update({ sent_at: new Date().toISOString() })
				.eq('id', n.id);
			result.sent++;
		}
	}

	return new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' }
	});
});
