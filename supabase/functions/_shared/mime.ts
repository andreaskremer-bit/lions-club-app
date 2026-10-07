// MIME-Body-Codierung für den SMTP-Versand – bewusst selbst gebaut, siehe `mailer.ts`.
//
// denomailer 1.6.0 codiert Text/HTML als Quoted-Printable mit Soft-Umbruch alle 74
// Zeichen, macht aber KEIN SMTP-Dot-Stuffing (RFC 5321, 4.5.2): Beginnt eine Zeile mit
// einem Punkt, entfernt der empfangende Server ihn. Landete der Umbruch vor „.png“,
// wurde aus `lions-emblem.png` die Adresse `lions-emblempng` (Emblem fehlte,
// gefunden 2026-10-07). Base64 kennt keinen Punkt – das Problem kann nicht auftreten.

/** UTF-8-Text als Base64 in Zeilen zu 76 Zeichen (RFC 2045), getrennt durch CRLF. */
export function base64Body(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return (btoa(bin).match(/.{1,76}/g) ?? []).join('\r\n');
}

/** Inhaltsteile für denomailers `mimeContent` – reicht es unverändert durch. */
export function mimeParts(text: string, html: string) {
	return [
		{
			mimeType: 'text/plain; charset="utf-8"',
			content: base64Body(text),
			transferEncoding: 'base64'
		},
		{
			mimeType: 'text/html; charset="utf-8"',
			content: base64Body(html),
			transferEncoding: 'base64'
		}
	];
}
