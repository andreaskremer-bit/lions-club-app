import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';
import { renderInviteEmail } from '../send-notifications/email.ts';
import { base64Body, mimeParts } from './mime.ts';

/**
 * Regressionstest zum Dot-Stuffing-Bug vom 2026-10-07: denomailer schickte
 * Quoted-Printable ohne Punkt-Verdopplung, der SMTP-Server entfernte Punkte am
 * Zeilenanfang – das Emblem `lions-emblem.png` wurde zu `lions-emblempng`.
 */
describe('base64Body', () => {
	it('liefert nach dem Decodieren exakt den Ausgangstext, auch mit Umlauten', () => {
		const s = 'Grüße – „Club“ … lions-emblem.png\nZeile 2';
		expect(Buffer.from(base64Body(s).replace(/\r\n/g, ''), 'base64').toString('utf8')).toBe(s);
	});

	it('bricht nach höchstens 76 Zeichen mit CRLF um', () => {
		const lines = base64Body('x'.repeat(500)).split('\r\n');
		expect(lines.length).toBeGreaterThan(1);
		for (const l of lines) expect(l.length).toBeLessThanOrEqual(76);
	});

	it('erzeugt keine Zeile, die mit einem Punkt beginnt – für eine echte Mail', () => {
		const { text, html } = renderInviteEmail({ firstName: 'Mark', email: 'm.test@example.org' });
		for (const part of mimeParts(text, html)) {
			expect(part.transferEncoding).toBe('base64');
			expect(part.content.split('\r\n').some((l) => l.startsWith('.'))).toBe(false);
			const decoded = Buffer.from(part.content.replace(/\r\n/g, ''), 'base64').toString('utf8');
			expect(decoded).toBe(part.mimeType.includes('html') ? html : text);
		}
	});
});
