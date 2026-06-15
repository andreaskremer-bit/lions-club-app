// iCalendar (.ics) Erzeugung für den Termin-Export in den eigenen Kalender.

export type IcsEvent = {
	id: string;
	title: string;
	location: string | null;
	description: string | null;
	starts_at: string;
	ends_at: string | null;
};

/** UTC-Zeitstempel im iCal-Format YYYYMMDDTHHMMSSZ. */
function fmtUtc(d: Date): string {
	const p = (n: number) => String(n).padStart(2, '0');
	return (
		`${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
		`T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
	);
}

/** Text für iCal escapen (Backslash, Semikolon, Komma, Zeilenumbruch). */
function esc(s: string): string {
	return s
		.replace(/\\/g, '\\\\')
		.replace(/;/g, '\\;')
		.replace(/,/g, '\\,')
		.replace(/\r?\n/g, '\\n');
}

/**
 * Baut einen vollständigen VCALENDAR-String mit einem VEVENT.
 * DTEND: aus `ends_at`, sonst Beginn + 2 Stunden (sinnvoller Default).
 * Zeilen sind per CRLF getrennt (RFC 5545).
 */
export function buildIcs(ev: IcsEvent, now: Date = new Date()): string {
	const start = new Date(ev.starts_at);
	const end = ev.ends_at ? new Date(ev.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

	const lines = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Lions Club Bonn-Rheinaue//Clubverwaltung//DE',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${ev.id}@lions-bonn-rheinaue.de`,
		`DTSTAMP:${fmtUtc(now)}`,
		`DTSTART:${fmtUtc(start)}`,
		`DTEND:${fmtUtc(end)}`,
		`SUMMARY:${esc(ev.title)}`,
		ev.location ? `LOCATION:${esc(ev.location)}` : null,
		ev.description ? `DESCRIPTION:${esc(ev.description)}` : null,
		'END:VEVENT',
		'END:VCALENDAR'
	].filter((l): l is string => l !== null);

	return lines.join('\r\n');
}

/** Dateinamen-tauglicher Slug aus dem Titel. */
export function icsFilename(title: string): string {
	const slug =
		title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 50) || 'termin';
	return `${slug}.ics`;
}
