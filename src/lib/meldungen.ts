// Meldungen zu einem Termin: Partner(innen) stehen beim Mitglied („Andreas Kremer und
// Petra Kremer“), unter „Gäste“ nur echte Gäste. Gemeinsam genutzt von der Termin-Detailseite,
// dem Meldungen-Sheet der Terminliste und der Teilnehmerliste.

export type CompanionLite = { id: string; name: string; is_partner: boolean };
export type ResponseLite = {
	status: 'zugesagt' | 'abgesagt';
	memberName: string;
	companion: CompanionLite[];
};

export const partnerOf = (r: { companion: CompanionLite[] }): CompanionLite | null =>
	r.companion.find((c) => c.is_partner) ?? null;

export const guestsOf = (r: { companion: CompanionLite[] }): CompanionLite[] =>
	r.companion.filter((c) => !c.is_partner);

export const gaesteWort = (n: number) => (n === 1 ? 'Gast' : 'Gäste');
export const partnerWort = (n: number) => (n === 1 ? 'Partner(in)' : 'Partner(innen)');
export const mitgliederWort = (n: number) => (n === 1 ? 'Mitglied' : 'Mitglieder');

/**
 * Eine Zeile unter „Zugesagt“. Erscheint für zugesagte Mitglieder und für Mitglieder, die
 * selbst abgesagt, aber Begleitung angemeldet haben (dann `null` bei ganz ohne Begleitung).
 */
export function zugesagtZeile(r: ResponseLite): string | null {
	const partner = partnerOf(r);
	const nGaeste = guestsOf(r).length;
	const plus = nGaeste ? `+${nGaeste} ${gaesteWort(nGaeste)}` : '';

	if (r.status === 'zugesagt') {
		const kopf = partner ? `${r.memberName} und ${partner.name}` : r.memberName;
		return plus ? `${kopf} (${plus})` : kopf;
	}
	if (!r.companion.length) return null;
	if (partner) {
		const zusatz = [`${r.memberName} selbst abgesagt`, plus].filter(Boolean).join(', ');
		return `${partner.name} (${zusatz})`;
	}
	return `${r.memberName}: selbst abgesagt, ${plus}`;
}

/** Zeilen unter „Zugesagt“, sortiert nach dem Namen des Mitglieds. */
export function zugesagtZeilen(responses: ResponseLite[]): string[] {
	return responses
		.map((r) => ({ key: r.memberName, text: zugesagtZeile(r) }))
		.filter((z): z is { key: string; text: string } => z.text !== null)
		.sort((a, b) => a.key.localeCompare(b.key, 'de'))
		.map((z) => z.text);
}

export type Zaehlung = { mitglieder: number; partner: number; gaeste: number; personen: number };

/** Begleitung zählt auch, wenn das Mitglied selbst abgesagt hat (Entscheidung 2026-10-04). */
export function zaehlen(responses: ResponseLite[]): Zaehlung {
	let mitglieder = 0;
	let partner = 0;
	let gaeste = 0;
	for (const r of responses) {
		if (r.status === 'zugesagt') mitglieder++;
		for (const c of r.companion) {
			if (c.is_partner) partner++;
			else gaeste++;
		}
	}
	return { mitglieder, partner, gaeste, personen: mitglieder + partner + gaeste };
}

/** „9 Mitglieder, 4 Partner(innen), 1 Gast“ – leere Gruppen fallen weg, Mitglieder bleiben. */
export function aufteilung(z: Zaehlung): string {
	return [
		`${z.mitglieder} ${mitgliederWort(z.mitglieder)}`,
		z.partner ? `${z.partner} ${partnerWort(z.partner)}` : '',
		z.gaeste ? `${z.gaeste} ${gaesteWort(z.gaeste)}` : ''
	]
		.filter(Boolean)
		.join(', ');
}

/** Echte Gäste (ohne Partner(innen)), alphabetisch, jeweils mit dem Mitglied, das sie mitbringt. */
export function gaesteListe(
	responses: ResponseLite[]
): { id: string; name: string; host: string }[] {
	return responses
		.flatMap((r) => guestsOf(r).map((c) => ({ id: c.id, name: c.name, host: r.memberName })))
		.sort((a, b) => a.name.localeCompare(b.name, 'de'));
}

/** Spalte „Typ“ der Teilnehmerliste für eine Begleitung. */
export function begleitungTyp(c: CompanionLite, r: ResponseLite): string {
	const art = c.is_partner ? 'Partner(in)' : 'Gast';
	const zusatz = r.status === 'zugesagt' ? '' : ' (selbst abgesagt)';
	return `${art} von ${r.memberName}${zusatz}`;
}
