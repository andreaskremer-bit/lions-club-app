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

/** Standarddauer, wenn ein Termin kein `ends_at` hat (gleicher Default wie Planung und .ics). */
export const DEFAULT_EVENT_MS = 2 * 60 * 60 * 1000;

type Timed = { starts_at: string; ends_at?: string | null };

/** Ende eines Termins: `ends_at`, sonst Beginn + 2 Stunden. */
export function eventEnd(ev: Timed): Date {
	return ev.ends_at
		? new Date(ev.ends_at)
		: new Date(new Date(ev.starts_at).getTime() + DEFAULT_EVENT_MS);
}

/** Vorbei = Ende erreicht. Bis dahin gilt ein Termin als anstehend (auch während er läuft). */
export function isEventOver(ev: Timed, now: number = Date.now()): boolean {
	return eventEnd(ev).getTime() <= now;
}

/** Läuft gerade = begonnen, aber noch nicht zu Ende. */
export function isEventRunning(ev: Timed, now: number = Date.now()): boolean {
	return new Date(ev.starts_at).getTime() <= now && !isEventOver(ev, now);
}

export type Rhythm = 'weekly' | 'biweekly' | 'monthly';

/** Serientermine ab `start`: wöchentlich/14-täglich/monatlich (gleiches Datum), `count` Termine. */
export function seriesDates(start: Date, rhythm: Rhythm, count: number): Date[] {
	const out: Date[] = [];
	const y = start.getFullYear();
	const mo = start.getMonth();
	const d = start.getDate();
	const h = start.getHours();
	const mi = start.getMinutes();
	for (let i = 0; i < count; i++) {
		if (rhythm === 'monthly') {
			out.push(new Date(y, mo + i, d, h, mi));
		} else {
			const step = rhythm === 'weekly' ? 7 : 14;
			out.push(new Date(y, mo, d + i * step, h, mi));
		}
	}
	return out;
}

export type BirthdayInfo = { date: Date; days: number; turning: number; today: boolean };

/**
 * Nächster Geburtstag ab `from` (tagesgenau) + Alter, das dann erreicht wird.
 * Parst „YYYY-MM-DD“ zeitzonensicher aus den Bestandteilen.
 */
export function nextBirthdayInfo(birthdayISO: string, from: Date = new Date()): BirthdayInfo {
	const [by, bm, bd] = birthdayISO.slice(0, 10).split('-').map(Number);
	const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
	let date = new Date(today.getFullYear(), bm - 1, bd);
	if (date < today) date = new Date(today.getFullYear() + 1, bm - 1, bd);
	const days = Math.round((date.getTime() - today.getTime()) / 86_400_000);
	return { date, days, turning: date.getFullYear() - by, today: days === 0 };
}
