// Texte für Termin-Benachrichtigungen (neu, geändert, abgesagt) – reine, testbare Logik.

const WHEN = new Intl.DateTimeFormat('de-DE', {
	timeZone: 'Europe/Berlin',
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit'
});
const DAY = new Intl.DateTimeFormat('de-DE', {
	timeZone: 'Europe/Berlin',
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	year: 'numeric'
});

/** „Mittwoch, 4. November 2026 um 19:30 Uhr“ */
export const formatWhen = (iso: string): string => `${WHEN.format(new Date(iso))} Uhr`;

type Where = { starts_at: string; location: string | null };

/**
 * Was hat sich für Teilnehmende Relevantes geändert (Beginn, Ort)? Liefert den Text
 * der Benachrichtigung oder null, wenn nichts davon geändert wurde – Titel, Beschreibung
 * oder Referent lösen bewusst keine Benachrichtigung aus.
 */
export function changeSummary(before: Where, after: Where): string | null {
	const parts: string[] = [];
	// Minutengenau: Das Formular kennt keine Sekunden, ein gespeicherter Beginn kann welche haben.
	const minute = (iso: string) => Math.floor(new Date(iso).getTime() / 60_000);
	if (minute(before.starts_at) !== minute(after.starts_at))
		parts.push(`Neuer Beginn: ${formatWhen(after.starts_at)}`);
	const b = before.location?.trim() || null;
	const a = after.location?.trim() || null;
	if (b !== a) parts.push(a ? `Neuer Ort: ${a}` : 'Der Ort ist noch offen.');
	return parts.length ? parts.join('. ') + (parts.at(-1)!.endsWith('.') ? '' : '.') : null;
}

export const cancelText = (startsAt: string): string =>
	`Der Termin am ${DAY.format(new Date(startsAt))} fällt aus.`;

export const newEventText = (startsAt: string, location: string | null): string =>
	`${formatWhen(startsAt)}${location?.trim() ? `, ${location.trim()}` : ''}.`;
