// Zählregeln für Rückmeldungen zu Terminen – an einer Stelle, damit Startseite,
// Terminliste, Meldungen-Sheet und Termin-Detail dieselben Zahlen zeigen.

export type RsvpStatus = 'zugesagt' | 'abgesagt';

type CountableResponse = {
	member_id: string;
	status: RsvpStatus;
	companion: readonly unknown[];
};

export type RsvpCounts = {
	/** Angemeldete Personen: zugesagte Mitglieder + alle Begleitpersonen. */
	zu: number;
	/** Mitglieder, die abgesagt haben. */
	ab: number;
	/** Aktive Mitglieder ohne Rückmeldung. */
	offen: number;
	/** Begleitpersonen insgesamt (auch von Mitgliedern, die selbst abgesagt haben). */
	gaeste: number;
};

/**
 * Begleitpersonen zählen unabhängig vom Status des Mitglieds: Wer selbst absagt, kann
 * trotzdem Partner oder Gast anmelden (Entscheidung 2026-10-04).
 * „Offen“ zählt nur aktive Mitglieder ohne Rückmeldung – Rückmeldungen von inaktiven
 * oder Ehrenmitgliedern verringern die Zahl nicht.
 */
export function rsvpCounts(
	responses: readonly CountableResponse[],
	activeMemberIds: ReadonlySet<string>
): RsvpCounts {
	const zuMembers = responses.filter((r) => r.status === 'zugesagt').length;
	const ab = responses.filter((r) => r.status === 'abgesagt').length;
	const gaeste = responses.reduce((n, r) => n + r.companion.length, 0);
	const responded = new Set(responses.map((r) => r.member_id));
	let offen = 0;
	for (const id of activeMemberIds) if (!responded.has(id)) offen++;
	return { zu: zuMembers + gaeste, ab, offen, gaeste };
}
