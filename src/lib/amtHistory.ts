/** „2013/14“ – Lions-Jahr zum Startjahr. */
export function lionsYearLabel(startYear: number): string {
	return `${startYear}/${String((startYear + 1) % 100).padStart(2, '0')}`;
}

type AmtYear = { lions_year: number; amt: { label: string; sort_order: number } | null };

export type AmtSpan = { label: string; from: number; to: number; text: string };

/**
 * Ämter eines Mitglieds über alle Lions-Jahre: aufeinanderfolgende Jahre desselben
 * Amts werden zu einem Zeitraum („2014/15 – 2015/16“), neueste zuerst; bei gleichem
 * Endjahr entscheidet die Reihenfolge der Ämter (Präsident vor Beauftragten).
 */
export function amtSpans(rows: AmtYear[]): AmtSpan[] {
	const byAmt = new Map<string, { sort: number; years: number[] }>();
	for (const r of rows) {
		if (!r.amt) continue;
		const e = byAmt.get(r.amt.label) ?? { sort: r.amt.sort_order, years: [] };
		e.years.push(r.lions_year);
		byAmt.set(r.amt.label, e);
	}

	const spans: (AmtSpan & { sort: number })[] = [];
	for (const [label, { sort, years }] of byAmt) {
		const ys = [...new Set(years)].sort((a, b) => a - b);
		let from = ys[0];
		for (let i = 1; i <= ys.length; i++) {
			if (i < ys.length && ys[i] === ys[i - 1] + 1) continue;
			const to = ys[i - 1];
			const text =
				from === to ? lionsYearLabel(from) : `${lionsYearLabel(from)} – ${lionsYearLabel(to)}`;
			spans.push({ label, from, to, text, sort });
			from = ys[i];
		}
	}

	return spans
		.sort((a, b) => b.to - a.to || b.from - a.from || a.sort - b.sort)
		.map(({ label, from, to, text }) => ({ label, from, to, text }));
}

export type PresidentEntry = {
	year: number;
	name: string;
	/** Im Amt bzw. als aktives Mitglied verstorben (Kreuz hinter dem Namen). */
	deceased: boolean;
};

/**
 * Präsidenten-Chronik: Mitglieder aus member_amt, Ehemalige aus praesident_chronik.
 * Hat ein Jahr beides, gewinnt das Mitglied. Neueste zuerst.
 */
export function presidentChronicle(
	members: { lions_year: number; member: { first_name: string; last_name: string } | null }[],
	former: { lions_year: number; name: string; deceased: boolean }[]
): PresidentEntry[] {
	const byYear = new Map<number, PresidentEntry>();
	for (const f of former)
		byYear.set(f.lions_year, { year: f.lions_year, name: f.name, deceased: f.deceased });
	for (const r of members) {
		if (!r.member) continue;
		byYear.set(r.lions_year, {
			year: r.lions_year,
			name: `${r.member.first_name} ${r.member.last_name}`,
			deceased: false
		});
	}
	return [...byYear.values()].sort((a, b) => b.year - a.year);
}
