import { describe, expect, it } from 'vitest';
import { encodeSubject, pathFor, renderEmail, type MailNotification } from './email.ts';

/**
 * Regressionstest zum denomailer-Bug vom 2026-07-20: Betreffs mit Umlauten
 * wurden mit einem BODY-Encoder codiert, der alle 74 Zeichen `=\r\n` einfügt.
 * Im Header beendet CRLF den Header-Block -> `From:`/`Content-Type:` landeten
 * im Body und die Mail war zerstört. Betreffs OHNE Umlaute blieben zufällig
 * heil — deshalb prüft hier jeder Fall ausdrücklich auch die Umlaut-Variante.
 */

/** Der Betreff, der es in Produktion tatsächlich zerlegt hat (75 codierte Zeichen). */
const REGRESSION = 'Rückmeldung fehlt: Diskussionsabend zur Lions-Demokratieerklärung';

/** Minimal-Decoder für die Gegenprobe: macht aus Encoded-Words wieder Klartext. */
function decodeSubject(encoded: string): string {
	const bytes: number[] = [];
	// Faltung (CRLF + Leerzeichen) und das führende Leerzeichen entfernen.
	const unfolded = encoded.replace(/\r\n /g, '').replace(/^ /, '');

	const parts = unfolded.split(/(=\?utf-8\?Q\?[^?]*\?=)/);
	for (const part of parts) {
		const m = part.match(/^=\?utf-8\?Q\?([^?]*)\?=$/);
		if (!m) {
			for (const b of new TextEncoder().encode(part)) bytes.push(b);
			continue;
		}
		let i = 0;
		const payload = m[1];
		while (i < payload.length) {
			if (payload[i] === '=') {
				bytes.push(parseInt(payload.slice(i + 1, i + 3), 16));
				i += 3;
			} else if (payload[i] === '_') {
				bytes.push(0x20);
				i += 1;
			} else {
				bytes.push(payload.charCodeAt(i));
				i += 1;
			}
		}
	}
	return new TextDecoder().decode(new Uint8Array(bytes));
}

/** Die Regeln, an denen die kaputte Version gescheitert wäre. */
function assertHeaderSafe(encoded: string) {
	// 1) Reines ASCII — sonst ist der Header ohne Encoding nicht transportierbar.
	expect([...encoded].every((c) => c.charCodeAt(0) <= 127)).toBe(true);

	const lines = encoded.split('\r\n');

	// 2) Jede Fortsetzungszeile MUSS mit Whitespace beginnen. Genau das war der
	//    Bug: `=\r\n` gefolgt von `g?=` in Spalte 0 beendete den Header-Block.
	for (const line of lines.slice(1)) {
		expect(line.startsWith(' ')).toBe(true);
	}

	// 3) Kein Encoded-Word über 75 Zeichen (RFC 2047).
	for (const line of lines) {
		expect(line.trim().length).toBeLessThanOrEqual(75);
	}

	// 4) Keine Nutzlast darf mit einem angefangenen `=XX` enden — genau so sah
	//    der abgeschnittene Betreff in Produktion aus (`...erkl=C3=A4run=`).
	//    Geprüft wird die Nutzlast OHNE `=?utf-8?Q?`/`?=`, denn das Wort selbst
	//    endet naturgemäß auf `=`.
	for (const line of lines) {
		const payload = line
			.trim()
			.replace(/^=\?utf-8\?Q\?/, '')
			.replace(/\?=$/, '');
		expect(payload).not.toMatch(/=[0-9A-F]?$/);
	}
}

describe('encodeSubject', () => {
	it('codiert den Betreff, der Produktion zerlegt hat, header-sicher', () => {
		const encoded = encodeSubject(REGRESSION);
		assertHeaderSafe(encoded);
		expect(decodeSubject(encoded)).toBe(REGRESSION);
	});

	it('lässt reines ASCII unangetastet', () => {
		expect(encodeSubject('Willkommen in der neuen Club-App')).toBe(
			'Willkommen in der neuen Club-App'
		);
	});

	it('beginnt bei codierten Betreffs mit einem Leerzeichen', () => {
		// Sonst würde denomailer das fertige Encoded-Word ein zweites Mal verpacken.
		const encoded = encodeSubject('Grüße');
		expect(encoded.startsWith(' =?utf-8?Q?')).toBe(true);
	});

	it('faltet lange Umlaut-Betreffs über mehrere Encoded-Words', () => {
		const lang =
			'Grüße zum Geburtstag: Übermäßig langer Betreff für Faltung über mehrere Zeilen hinweg';
		const encoded = encodeSubject(lang);
		expect(encoded.split('\r\n').length).toBeGreaterThan(1);
		assertHeaderSafe(encoded);
		expect(decodeSubject(encoded)).toBe(lang);
	});

	it('bleibt über wachsende Längen hinweg header-sicher und verlustfrei', () => {
		// Deckt die Umbruchgrenze ab, statt eine einzelne Länge zu raten.
		for (let n = 1; n <= 120; n++) {
			const subject = 'ä'.repeat(n) + ' Test für Länge ' + n;
			const encoded = encodeSubject(subject);
			assertHeaderSafe(encoded);
			expect(decodeSubject(encoded)).toBe(subject);
		}
	});

	it('entfernt CR/LF aus dem Rohtitel', () => {
		// Ein Titel mit Zeilenumbruch dürfte den Header sonst direkt beenden.
		const encoded = encodeSubject('Neues Dokument:\r\nProtokoll\tvom Mai');
		expect(decodeSubject(encoded)).toBe('Neues Dokument: Protokoll vom Mai');
		assertHeaderSafe(encoded);
	});
});

describe('pathFor', () => {
	const base: MailNotification = {
		kind: 'news',
		title: 't',
		body: null,
		event_id: null,
		document_id: null,
		news_post_id: null
	};

	it('verlinkt tief, wenn eine ID vorliegt', () => {
		expect(pathFor({ ...base, kind: 'event_reminder', event_id: 'e1' })).toBe('/termine/e1');
		expect(pathFor({ ...base, kind: 'attendance_due', event_id: 'e1' })).toBe(
			'/termine/e1/anwesenheit'
		);
		expect(pathFor({ ...base, kind: 'document', document_id: 'd1' })).toBe('/dokumente/d1');
		expect(pathFor({ ...base, kind: 'news', news_post_id: 'n1' })).toBe('/news/n1');
		expect(pathFor({ ...base, kind: 'birthday' })).toBe('/geburtstage');
	});

	it('fällt ohne ID auf die Übersichtsseite zurück', () => {
		expect(pathFor({ ...base, kind: 'event_reminder' })).toBe('/termine');
		expect(pathFor({ ...base, kind: 'document' })).toBe('/dokumente');
	});
});

describe('renderEmail', () => {
	const n: MailNotification = {
		kind: 'birthday',
		title: 'Geburtstag: Dr. Maria Mustermann',
		body: null,
		event_id: null,
		document_id: null,
		news_post_id: null
	};

	it('setzt bei leerem body den Ersatztext statt den Betreff zu wiederholen', () => {
		const { html, text } = renderEmail(n);
		expect(html).toContain('Heute gibt es einen Geburtstag im Club.');
		expect(text).toContain('Heute gibt es einen Geburtstag im Club.');
	});

	it('escaped HTML-Sonderzeichen aus Titel und Text', () => {
		const { html } = renderEmail({
			...n,
			kind: 'news',
			title: 'Helfer & Helferinnen',
			body: '<script>alert(1)</script>'
		});
		expect(html).toContain('Helfer &amp; Helferinnen');
		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;');
	});

	it('enthält denselben Link in HTML und Klartext', () => {
		const { html, text } = renderEmail({ ...n, kind: 'news', news_post_id: 'n1' });
		const link = 'https://app.lions-bonn-rheinaue.de/news/n1';
		expect(html).toContain(link);
		expect(text).toContain(link);
	});
});
