// SMTP-Versand über den Club-SMTP – geteilt von `send-notifications` und `send-invite`.
// Secrets: SMTP_HOST/PORT/USER/PASS/FROM (Port 465 = TLS, sonst STARTTLS);
// SMTP_ALLOW_INSECURE=true nur für lokale Tests gegen Mailpit.

import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';
import { mimeParts } from './mime.ts';

/**
 * Ein SMTP-Client je Lauf statt einer neuen Verbindung (TLS-Handshake + AUTH) pro Mail:
 * Bei einer News an alle Mitglieder wären das sonst Dutzende Verbindungen nacheinander –
 * zu langsam für das Zeitlimit der Function und riskant bei Gmails Verbindungslimits.
 */
export class Mailer {
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
		// Text + HTML -> multipart/alternative; Clients ohne HTML sehen den Text.
		// Selbst Base64-codiert statt über `content`/`html`: denomailers Quoted-Printable
		// verschluckt Punkte am Zeilenanfang (kein Dot-Stuffing, siehe `mime.ts`).
		await this.#client.send({ from: this.#from, to, subject, mimeContent: mimeParts(text, html) });
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
