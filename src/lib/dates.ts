// Reine, testbare Hilfsfunktionen (keine SvelteKit-/DOM-Abhängigkeiten).

export type EventType = 'clubabend' | 'versammlung' | 'reise' | 'gesellig' | 'lions_termin';

/** Begleitperson erlaubt? (Spiegelt die generierte Spalte event.companion_allowed, Spec §4.2.) */
export const companionAllowed = (t: EventType): boolean =>
	t === 'clubabend' || t === 'reise' || t === 'gesellig';

/** Spendenpflichtig? (Spiegelt event.donation_required, Spec §4.2.) */
export const donationRequired = (t: EventType): boolean => t === 'clubabend' || t === 'versammlung';

/** Lions-Jahr läuft 1. Juli – 30. Juni; liefert das Startjahr zu einem Datum. */
export function lionsStartYear(d: Date): number {
	return d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
}

export type BirthdayInfo = { date: Date; days: number; turning: number; today: boolean };

/**
 * Nächster Geburtstag ab `from` (tagesgenau) + Alter, das dann erreicht wird.
 * Parst „YYYY-MM-DD" zeitzonensicher aus den Bestandteilen.
 */
export function nextBirthdayInfo(birthdayISO: string, from: Date = new Date()): BirthdayInfo {
	const [by, bm, bd] = birthdayISO.slice(0, 10).split('-').map(Number);
	const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	let date = new Date(today.getFullYear(), bm - 1, bd);
	if (date < today) date = new Date(today.getFullYear() + 1, bm - 1, bd);
	const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
	return { date, days, turning: date.getFullYear() - by, today: days === 0 };
}
