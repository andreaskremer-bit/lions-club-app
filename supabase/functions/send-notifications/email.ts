// E-Mail-Template für die Benachrichtigungen (Edge Function `send-notifications`).
//
// Warum eigene Datei: `index.ts` kümmert sich um Outbox/Kanäle/Zustellung, hier
// steht ausschließlich, wie eine Benachrichtigung als E-Mail aussieht.
//
// E-Mail-HTML ist NICHT Web-HTML:
//   - Layout über <table>, kein Flex/Grid (Outlook rendert mit der Word-Engine).
//   - Alle Styles inline; <style>-Blöcke werden von Gmail teils entfernt.
//   - Feste Hex-Werte statt CSS-Variablen (Tokens aus `tokens/colors.css` hier
//     bewusst dupliziert — Mail-Clients kennen `var()` nicht).
//   - Das Emblem wird als URL von der eigenen Domain geladen, NICHT als
//     data:-URI: Gmail zeigt base64-Bilder in <img> nicht an. Blockiert ein
//     Client Bilder, trägt das Text-Lockup daneben die Marke.

const APP_URL = (Deno.env.get('APP_BASE_URL') ?? 'https://app.lions-bonn-rheinaue.de').replace(
	/\/$/,
	''
);

const C = {
	cream: '#F6F1E7',
	card: '#FCFAF4',
	hairline: '#E4DCCB',
	ink: '#211E18',
	body: '#4A4438',
	muted: '#6E675A',
	blue: '#1E4FA3',
	gold: '#856010',
	onPrimary: '#FBF8F1'
};

export type Kind = 'event_reminder' | 'birthday' | 'attendance_due' | 'document' | 'news';

export type MailNotification = {
	kind: Kind;
	title: string;
	body: string | null;
	event_id: string | null;
	document_id: string | null;
	news_post_id: string | null;
};

/** Ziel-Pfad in der App — geteilt mit dem Push-Payload, damit beide Kanäle gleich landen. */
export function pathFor(n: MailNotification): string {
	switch (n.kind) {
		case 'event_reminder':
			return n.event_id ? `/termine/${n.event_id}` : '/termine';
		case 'attendance_due':
			return n.event_id ? `/termine/${n.event_id}/anwesenheit` : '/termine';
		case 'birthday':
			return '/geburtstage';
		case 'document':
			return n.document_id ? `/dokumente/${n.document_id}` : '/dokumente';
		case 'news':
			return n.news_post_id ? `/news/${n.news_post_id}` : '/news';
		default:
			return '/benachrichtigungen';
	}
}

/**
 * Je Anlass: Kicker über der Überschrift, Beschriftung des Buttons und ein
 * Ersatztext für die Fälle, in denen die Outbox-Zeile keinen `body` hat
 * (Geburtstag, Dokument, Anwesenheit) — sonst stünde dort nur der Betreff nochmal.
 */
const PRESET: Record<Kind, { kicker: string; cta: string; fallback: string }> = {
	event_reminder: {
		kicker: 'Termin',
		cta: 'Zu- oder absagen',
		fallback: 'Bitte sage zu oder ab.'
	},
	birthday: {
		kicker: 'Geburtstag',
		cta: 'Geburtstage ansehen',
		fallback: 'Heute gibt es einen Geburtstag im Club.'
	},
	attendance_due: {
		kicker: 'Anwesenheit',
		cta: 'Anwesenheit erfassen',
		fallback: 'Die Anwesenheit für diese Veranstaltung ist noch nicht erfasst.'
	},
	document: {
		kicker: 'Dokument',
		cta: 'Dokument öffnen',
		fallback: 'In der Ablage liegt ein neues Dokument für dich bereit.'
	},
	news: {
		kicker: 'Neuigkeit',
		cta: 'Beitrag lesen',
		fallback: 'Es gibt eine neue Mitteilung im Club.'
	}
};

/**
 * Betreffzeile MIME-codieren (RFC 2047) — bewusst selbst gebaut.
 *
 * denomailer 1.6.0 codiert Betreffs mit Umlauten über `quotedPrintableEncode`,
 * einen BODY-Encoder: der setzt alle 74 Zeichen einen Soft-Umbruch `=\r\n`.
 * Im Header beendet ein CRLF aber den Header-Block — ab ~75 codierten Zeichen
 * landeten `From:`/`To:`/`Content-Type:` im Body und die Mail war zerstört.
 * (Verifiziert am 2026-07-20; 1.6.0 ist die neueste Version, kein Upstream-Fix.)
 *
 * Trick beim Rückgabewert: das führende Leerzeichen. denomailer codiert nur
 * Strings mit Nicht-ASCII ODER solche, die mit "=?" beginnen. Das Leerzeichen
 * sorgt dafür, dass unser fertiges Encoded-Word beide Bedingungen verfehlt und
 * unangetastet durchgereicht wird. Führender Whitespace nach "Subject:" ist
 * laut RFC 5322 erlaubt und wird von Clients ignoriert.
 */
export function encodeSubject(raw: string): string {
	// CR/LF/TAB raus — die würden den Header ebenfalls zerlegen.
	const clean = raw.replace(/[\r\n\t]+/g, ' ').trim();

	// Reines ASCII braucht kein Encoding; denomailer lässt es dann in Ruhe.
	if (![...clean].some((c) => c.charCodeAt(0) > 127)) return clean;

	const PREFIX = '=?utf-8?Q?';
	const SUFFIX = '?=';
	// RFC 2047: ein Encoded-Word darf höchstens 75 Zeichen lang sein.
	const MAX_PAYLOAD = 75 - PREFIX.length - SUFFIX.length;

	const enc = new TextEncoder();
	const words: string[] = [];
	let current = '';

	// Zeichenweise, damit kein Mehrbyte-Zeichen zwischen zwei Wörtern zerreißt.
	for (const ch of clean) {
		let piece: string;
		if (ch === ' ') {
			piece = '_'; // im Q-Encoding steht "_" für das Leerzeichen
		} else if (/[A-Za-z0-9]/.test(ch)) {
			piece = ch;
		} else {
			piece = [...enc.encode(ch)]
				.map((b) => '=' + b.toString(16).toUpperCase().padStart(2, '0'))
				.join('');
		}

		if (current.length + piece.length > MAX_PAYLOAD) {
			words.push(current);
			current = '';
		}
		current += piece;
	}
	if (current) words.push(current);

	// Mehrere Encoded-Words werden per CRLF + Leerzeichen gefaltet (RFC 5322).
	// Das ist eine gültige Fortsetzungszeile — anders als der Umbruch mitten im Wort.
	return ' ' + words.map((w) => PREFIX + w + SUFFIX).join('\r\n ');
}

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function renderEmail(n: MailNotification): {
	subject: string;
	html: string;
	text: string;
} {
	const preset = PRESET[n.kind] ?? PRESET.news;
	const link = `${APP_URL}${pathFor(n)}`;
	const bodyText = n.body?.trim() ? n.body.trim() : preset.fallback;

	const title = esc(n.title);
	const body = esc(bodyText);
	const kicker = esc(preset.kicker);
	const cta = esc(preset.cta);

	// Preheader: die Zeile, die Mail-Apps neben dem Betreff in der Liste zeigen.
	// Wird im Body versteckt, damit sie nicht doppelt sichtbar ist.
	const preheader = esc(bodyText.slice(0, 120));

	const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${title}</title>
</head>
<body style="margin:0; padding:0; background-color:${C.cream}; -webkit-text-size-adjust:100%;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; font-size:1px; line-height:1px;">${preheader}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.cream};">
<tr><td align="center" style="padding:24px 12px 32px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

    <!-- Kopf: Emblem + Text-Lockup. Bei blockierten Bildern trägt der Text. -->
    <tr><td align="center" style="padding:8px 8px 20px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:10px; vertical-align:middle;">
          <img src="${APP_URL}/icons/lions-emblem.png" width="36" height="36" alt=""
               style="display:block; width:36px; height:36px; border:0;">
        </td>
        <td style="vertical-align:middle; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:15px; font-weight:600; letter-spacing:0.02em; color:${C.blue};">
          Lions Club Bonn-Rheinaue
        </td>
      </tr></table>
    </td></tr>

    <!-- Karte -->
    <tr><td style="background-color:${C.card}; border:1px solid ${C.hairline}; border-radius:14px; padding:28px 24px;">

      <p style="margin:0 0 10px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${C.gold};">${kicker}</p>

      <h1 style="margin:0 0 14px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:21px; line-height:1.35; font-weight:700; color:${C.ink};">${title}</h1>

      <p style="margin:0 0 26px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:17px; line-height:1.55; color:${C.body};">${body}</p>

      <!-- Button: Tabelle statt gestyltem <a>, damit Outlook die Fläche rendert -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" bgcolor="${C.blue}" style="border-radius:10px;">
          <a href="${link}"
             style="display:inline-block; min-height:24px; padding:14px 26px; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:17px; font-weight:600; line-height:1.2; color:${C.onPrimary}; text-decoration:none; border-radius:10px;">${cta}</a>
        </td></tr>
      </table>

      <p style="margin:22px 0 0 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; line-height:1.5; color:${C.muted};">
        Falls der Button nicht funktioniert:<br>
        <a href="${link}" style="color:${C.blue}; text-decoration:underline; word-break:break-all;">${esc(link)}</a>
      </p>

    </td></tr>

    <!-- Fuß -->
    <tr><td style="padding:20px 24px 0 24px;">
      <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; font-size:13px; line-height:1.6; color:${C.muted};">
        Du bekommst diese E-Mail, weil du in der Club-App Benachrichtigungen per E-Mail eingestellt hast.
        Unter <a href="${APP_URL}/mehr" style="color:${C.blue}; text-decoration:underline;">Mehr &rarr; Benachrichtigungen</a> kannst du den Kanal jederzeit ändern.
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;

	const text = [
		preset.kicker.toUpperCase(),
		'',
		n.title,
		'',
		bodyText,
		'',
		`${preset.cta}: ${link}`,
		'',
		'--',
		'Lions Club Bonn-Rheinaue',
		'Du bekommst diese E-Mail, weil du in der Club-App Benachrichtigungen per',
		`E-Mail eingestellt hast. Kanal ändern: ${APP_URL}/mehr`
	].join('\n');

	// Betreff wire-ready MIME-codiert (siehe encodeSubject) — nicht der Rohtitel.
	return { subject: encodeSubject(n.title), html, text };
}
