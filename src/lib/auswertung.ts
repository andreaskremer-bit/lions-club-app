// Schatzmeister-Auswertung (Abwesenheitsspenden) – reine, testbare Logik.

export type MemberStatus = 'aktiv' | 'inaktiv' | 'ehrenmitglied';
export type AuswMember = {
	id: string;
	first_name: string;
	last_name: string;
	status: MemberStatus;
};
export type AuswEvent = { id: string; title: string; starts_at: string };
export type AttRow = { event_id: string; member_id: string; present: boolean };

export type AuswRow = {
	id: string;
	name: string;
	status: MemberStatus;
	abwesend: number;
	anwesend: number;
	erfasst: number;
};

/**
 * Zeilen der Auswertung: alle heute aktiven Mitglieder UND alle, für die im Zeitraum
 * Anwesenheit erfasst ist. Bisher nur „heute aktiv“ – wer im Mai inaktiv oder
 * Ehrenmitglied wurde, verschwand dann samt seiner Abwesenheiten aus der Vorjahres-
 * Auswertung, die der Schatzmeister im Juli bis September macht. Der heutige Status
 * steht dabei, die Entscheidung über Befreiungen trifft der Schatzmeister.
 */
export function buildRows(members: AuswMember[], attendance: AttRow[]): AuswRow[] {
	const counts = new Map<string, { abwesend: number; anwesend: number }>();
	for (const a of attendance) {
		const c = counts.get(a.member_id) ?? { abwesend: 0, anwesend: 0 };
		if (a.present) c.anwesend++;
		else c.abwesend++;
		counts.set(a.member_id, c);
	}
	return members
		.filter((m) => m.status === 'aktiv' || counts.has(m.id))
		.map((m) => {
			const c = counts.get(m.id) ?? { abwesend: 0, anwesend: 0 };
			return {
				id: m.id,
				name: `${m.last_name}, ${m.first_name}`,
				status: m.status,
				abwesend: c.abwesend,
				anwesend: c.anwesend,
				erfasst: c.abwesend + c.anwesend
			};
		});
}

/** Vergangene spendenpflichtige Termine, für die noch niemand Anwesenheit erfasst hat. */
export function unrecordedEvents(
	events: AuswEvent[],
	attendance: AttRow[],
	now: Date = new Date()
): AuswEvent[] {
	const recorded = new Set(attendance.map((a) => a.event_id));
	return events.filter((e) => new Date(e.starts_at) < now && !recorded.has(e.id));
}

export const statusLabel: Record<MemberStatus, string> = {
	aktiv: 'aktiv',
	inaktiv: 'inaktiv',
	ehrenmitglied: 'Ehrenmitglied'
};
