// E-Mail-Template für die Benachrichtigungen (Edge Function `send-notifications`).
//
// Warum eigene Datei: `index.ts` kümmert sich um Outbox/Kanäle/Zustellung, hier
// steht ausschließlich, wie eine Benachrichtigung als E-Mail aussieht.
//
// E-Mail-HTML ist NICHT Web-HTML:
//   - Layout über <table>, kein Flex/Grid (Outlook rendert mit der Word-Engine).
//   - Alle Styles inline; <style>-Blöcke werden von Gmail teils entfernt.
//   - Feste Hex-Werte statt CSS-Variablen (Tokens aus `tokens/colors.css` hier
//     bewusst dupliziert – Mail-Clients kennen `var()` nicht).
//   - Das Emblem wird als URL von der eigenen Domain geladen, NICHT als
//     data:-URI: Gmail zeigt base64-Bilder in <img> nicht an. Blockiert ein
//     Client Bilder, trägt das Text-Lockup daneben die Marke.

// Lazy + guarded: `Deno` gibt es unter Vitest (Node) nicht. Ohne den Guard
// würde schon der Import in `email.test.ts` mit einem ReferenceError sterben.
function appUrl(): string {
	const fromEnv = typeof Deno !== 'undefined' ? Deno.env.get('APP_BASE_URL') : undefined;
	return (fromEnv ?? 'https://app.lions-bonn-rheinaue.de').replace(/\/$/, '');
}

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

/**
 * Ziel-Pfad in der App – geteilt mit dem Push-Payload, damit beide Kanäle gleich landen.
 *
 * WICHTIG: Nur Pfade, für die es in `src/routes/` wirklich eine Seite gibt.
 * News und Dokumente haben KEINE Detailseite (`news/[id]`/`dokumente/[id]` enthalten
 * nur `bearbeiten/`) – eine tiefe Verlinkung landete dort auf einer 404-Seite.
 * Beide Anlässe zeigen deshalb auf die Übersicht, genau wie die In-App-Liste
 * unter `/benachrichtigungen`.
 */
export function pathFor(n: MailNotification): string {
	switch (n.kind) {
		case 'event_reminder':
			return n.event_id ? `/termine/${n.event_id}` : '/termine';
		case 'attendance_due':
			return n.event_id ? `/termine/${n.event_id}/anwesenheit` : '/termine';
		case 'birthday':
			return '/geburtstage';
		case 'document':
			return '/dokumente';
		case 'news':
			return '/news';
		default:
			return '/benachrichtigungen';
	}
}

/**
 * Je Anlass: Kicker über der Überschrift, Beschriftung des Buttons und ein
 * Ersatztext für die Fälle, in denen die Outbox-Zeile keinen `body` hat
 * (Geburtstag, Dokument, Anwesenheit) – sonst stünde dort nur der Betreff nochmal.
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
 * Betreffzeile MIME-codieren (RFC 2047) – bewusst selbst gebaut.
 *
 * denomailer 1.6.0 codiert Betreffs mit Umlauten über `quotedPrintableEncode`,
 * einen BODY-Encoder: der setzt alle 74 Zeichen einen Soft-Umbruch `=\r\n`.
 * Im Header beendet ein CRLF aber den Header-Block – ab ~75 codierten Zeichen
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
	// CR/LF/TAB raus – die würden den Header ebenfalls zerlegen.
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
	// Das ist eine gültige Fortsetzungszeile – anders als der Umbruch mitten im Wort.
	return ' ' + words.map((w) => PREFIX + w + SUFFIX).join('\r\n ');
}

function esc(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/**
 * Klartext (News) als HTML-Absatzinhalt: escapen, URLs klickbar machen (Satzzeichen am
 * Ende gehören nicht dazu, wie im App-Feed) und Zeilenumbrüche erhalten. Vorher lief
 * der ganze Text in einen Absatz, Links waren nicht anklickbar.
 */
export function bodyToHtml(text: string, linkColor: string): string {
	return esc(text)
		.replace(/https?:\/\/[^\s<]+/g, (raw) => {
			const url = raw.replace(/[.,;:!?)\]'"“‘»]+$/, '');
			const rest = raw.slice(url.length);
			return `<a href="${url}" style="color:${linkColor}; text-decoration:underline;">${url}</a>${rest}`;
		})
		.replace(/\r?\n/g, '<br>');
}

/** Gemeinsamer Rahmen aller Club-Mails: Kopf mit Emblem, Karte mit Button, Fußzeile. */
type Layout = {
	kicker: string;
	title: string;
	/** Fertiges, bereits escaptes HTML für den Inhalt der Karte (oberhalb des Buttons). */
	bodyHtml: string;
	preheader: string;
	cta: string;
	link: string;
	/** Fertiges HTML für die Fußzeile unter der Karte. */
	footerHtml: string;
};

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

/** Absatz im Stil des Karteninhalts – für Vorlagen mit mehreren Absätzen. */
function para(html: string, marginBottom = 16): string {
	return `<p style="margin:0 0 ${marginBottom}px 0; font-family:${FONT}; font-size:17px; line-height:1.55; color:${C.body};">${html}</p>`;
}

function renderLayout(l: Layout): string {
	const base = appUrl();
	return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(l.title)}</title>
</head>
<body style="margin:0; padding:0; background-color:${C.cream}; -webkit-text-size-adjust:100%;">
<div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent; font-size:1px; line-height:1px;">${esc(l.preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.cream};">
<tr><td align="center" style="padding:24px 12px 32px 12px;">

  <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;">

    <!-- Kopf: Emblem + Text-Lockup. Bei blockierten Bildern trägt der Text. -->
    <tr><td align="center" style="padding:8px 8px 20px 8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="padding-right:10px; vertical-align:middle;">
          <img src="${base}/icons/lions-emblem.png" width="36" height="36" alt=""
               style="display:block; width:36px; height:36px; border:0;">
        </td>
        <td style="vertical-align:middle; font-family:${FONT}; font-size:15px; font-weight:600; letter-spacing:0.02em; color:${C.blue};">
          Lions Club Bonn-Rheinaue
        </td>
      </tr></table>
    </td></tr>

    <!-- Karte -->
    <tr><td style="background-color:${C.card}; border:1px solid ${C.hairline}; border-radius:14px; padding:28px 24px;">

      <p style="margin:0 0 10px 0; font-family:${FONT}; font-size:12px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${C.gold};">${esc(l.kicker)}</p>

      <h1 style="margin:0 0 14px 0; font-family:${FONT}; font-size:21px; line-height:1.35; font-weight:700; color:${C.ink};">${esc(l.title)}</h1>

      ${l.bodyHtml}

      <!-- Button: Tabelle statt gestyltem <a>, damit Outlook die Fläche rendert -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
        <tr><td align="center" bgcolor="${C.blue}" style="border-radius:10px;">
          <a href="${l.link}"
             style="display:inline-block; min-height:24px; padding:14px 26px; font-family:${FONT}; font-size:17px; font-weight:600; line-height:1.2; color:${C.onPrimary}; text-decoration:none; border-radius:10px;">${esc(l.cta)}</a>
        </td></tr>
      </table>

      <p style="margin:22px 0 0 0; font-family:${FONT}; font-size:13px; line-height:1.5; color:${C.muted};">
        Falls der Button nicht funktioniert:<br>
        <a href="${l.link}" style="color:${C.blue}; text-decoration:underline; word-break:break-all;">${esc(l.link)}</a>
      </p>

    </td></tr>

    <!-- Fuß -->
    <tr><td style="padding:20px 24px 0 24px;">
      <p style="margin:0; font-family:${FONT}; font-size:13px; line-height:1.6; color:${C.muted};">
        ${l.footerHtml}
      </p>
    </td></tr>

  </table>

</td></tr>
</table>
</body>
</html>`;
}

export function renderEmail(n: MailNotification): {
	subject: string;
	html: string;
	text: string;
} {
	const preset = PRESET[n.kind] ?? PRESET.news;
	const base = appUrl();
	const link = `${base}${pathFor(n)}`;
	const bodyText = n.body?.trim() ? n.body.trim() : preset.fallback;

	const html = renderLayout({
		kicker: preset.kicker,
		title: n.title,
		bodyHtml: para(bodyToHtml(bodyText, C.blue), 16),
		// Preheader: die Zeile, die Mail-Apps neben dem Betreff in der Liste zeigen.
		// Wird im Body versteckt, damit sie nicht doppelt sichtbar ist.
		preheader: bodyText.slice(0, 120),
		cta: preset.cta,
		link,
		footerHtml: `Du bekommst diese E-Mail, weil du in der Club-App Benachrichtigungen per E-Mail eingestellt hast.
        Unter <a href="${base}/mehr" style="color:${C.blue}; text-decoration:underline;">Mehr &rarr; Benachrichtigungen</a> kannst du den Kanal jederzeit ändern.`
	});

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
		`E-Mail eingestellt hast. Kanal ändern: ${base}/mehr`
	].join('\n');

	// Betreff wire-ready MIME-codiert (siehe encodeSubject) – nicht der Rohtitel.
	return { subject: encodeSubject(n.title), html, text };
}

/**
 * Einladung in die Club-App (Edge Function `send-invite`). Geht an ein Mitglied, für
 * das gerade ein Login-Konto angelegt wurde – das Anlegen selbst verschickt nichts.
 * Kein Passwort, kein Magic-Link: die Mail erklärt nur den Weg zum Anmelde-Code.
 */
export function renderInviteEmail(m: { firstName: string; email: string }): {
	subject: string;
	html: string;
	text: string;
} {
	const base = appUrl();
	const link = `${base}/login`;
	const appHost = base.replace(/^https?:\/\//, '');
	const title = `Willkommen in der Club-App, ${m.firstName}`;
	const intro =
		'für dich ist ab sofort ein Zugang zur App des Lions Club Bonn-Rheinaue eingerichtet. Dort findest du Termine mit Zu- und Absage, das Mitgliederverzeichnis, Neuigkeiten, Dokumente und die Geburtstage im Club.';
	const steps = [
		`Öffne ${appHost} – am einfachsten über den Button unten.`,
		`Gib diese E-Mail-Adresse ein: ${m.email}`,
		'Du bekommst gleich darauf einen 6-stelligen Code per E-Mail. Trag ihn in der App ein – fertig. Ein Passwort brauchst du nicht.'
	];
	const tip =
		'Tipp: Leg die App auf den Home-Bildschirm deines Smartphones. Auf dem iPhone in Safari über „Teilen“ → „Zum Home-Bildschirm“, auf Android in Chrome über das Menü → „App installieren“. Dann öffnet sie sich wie jede andere App.';
	const outro = 'Bei Fragen antworte einfach auf diese E-Mail.';

	const stepsHtml = `<ol style="margin:0 0 16px 0; padding-left:22px; font-family:${FONT}; font-size:17px; line-height:1.55; color:${C.body};">${steps
		.map((s) => `<li style="margin:0 0 6px 0;">${esc(s)}</li>`)
		.join('')}</ol>`;

	const html = renderLayout({
		kicker: 'Einladung',
		title,
		bodyHtml: [
			para(`Hallo ${esc(m.firstName)},`, 12),
			para(esc(intro)),
			para('<strong>So meldest du dich an:</strong>', 8),
			stepsHtml,
			para(esc(tip)),
			para(esc(outro), 16)
		].join('\n      '),
		preheader: 'Dein Zugang zur Club-App ist eingerichtet – so meldest du dich an.',
		cta: 'Zur Club-App',
		link,
		footerHtml:
			'Du bekommst diese E-Mail, weil du als Mitglied des Lions Club Bonn-Rheinaue in der Club-App angelegt wurdest.'
	});

	const text = [
		'EINLADUNG',
		'',
		title,
		'',
		`Hallo ${m.firstName},`,
		'',
		intro,
		'',
		'So meldest du dich an:',
		...steps.map((s, i) => `${i + 1}. ${s}`),
		'',
		tip,
		'',
		outro,
		'',
		`Zur Club-App: ${link}`,
		'',
		'--',
		'Lions Club Bonn-Rheinaue',
		'Du bekommst diese E-Mail, weil du als Mitglied des Lions Club Bonn-Rheinaue',
		'in der Club-App angelegt wurdest.'
	].join('\n');

	return { subject: encodeSubject(title), html, text };
}
