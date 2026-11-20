import { describe, expect, it } from 'vitest';
import {
	aufteilung,
	begleitungTyp,
	gaesteListe,
	zaehlen,
	zugesagtZeile,
	zugesagtZeilen,
	type ResponseLite
} from './meldungen';

const p = (name: string, id = name) => ({ id, name, is_partner: true });
const g = (name: string, id = name) => ({ id, name, is_partner: false });
const r = (
	memberName: string,
	status: 'zugesagt' | 'abgesagt',
	companion: ResponseLite['companion'] = []
): ResponseLite => ({ memberName, status, companion });

describe('zugesagtZeile', () => {
	it('nennt die Partner(in) beim Mitglied, in langer Form', () => {
		expect(zugesagtZeile(r('Andreas Kremer', 'zugesagt', [p('Petra Kremer')]))).toBe(
			'Andreas Kremer und Petra Kremer'
		);
	});

	it('zählt weitere Gäste dahinter', () => {
		expect(zugesagtZeile(r('Hans Müller', 'zugesagt', [g('Gerda Gast')]))).toBe(
			'Hans Müller (+1 Gast)'
		);
		expect(
			zugesagtZeile(r('Andreas Kremer', 'zugesagt', [p('Petra Kremer'), g('A'), g('B')]))
		).toBe('Andreas Kremer und Petra Kremer (+2 Gäste)');
	});

	it('Mitglied ohne Begleitung steht allein', () => {
		expect(zugesagtZeile(r('Anna Aktiv', 'zugesagt'))).toBe('Anna Aktiv');
	});

	it('Mitglied abgesagt, Partner(in) kommt: Partner(in) vorn', () => {
		expect(zugesagtZeile(r('Andreas Kremer', 'abgesagt', [p('Petra Kremer')]))).toBe(
			'Petra Kremer (Andreas Kremer selbst abgesagt)'
		);
		expect(zugesagtZeile(r('Andreas Kremer', 'abgesagt', [p('Petra Kremer'), g('X')]))).toBe(
			'Petra Kremer (Andreas Kremer selbst abgesagt, +1 Gast)'
		);
	});

	it('Mitglied abgesagt, nur Gäste kommen', () => {
		expect(zugesagtZeile(r('Hans Müller', 'abgesagt', [g('X'), g('Y')]))).toBe(
			'Hans Müller: selbst abgesagt, +2 Gäste'
		);
	});

	it('Absage ohne Begleitung erscheint nicht unter Zugesagt', () => {
		expect(zugesagtZeile(r('Hans Müller', 'abgesagt'))).toBeNull();
	});
});

describe('zugesagtZeilen', () => {
	it('sortiert nach dem Mitglied, auch wenn die Partner(in) vorn steht', () => {
		expect(
			zugesagtZeilen([
				r('Zora Zett', 'zugesagt'),
				r('Bert Beispiel', 'abgesagt', [p('Yvonne Beispiel')]),
				r('Carl Abgesagt', 'abgesagt')
			])
		).toEqual(['Yvonne Beispiel (Bert Beispiel selbst abgesagt)', 'Zora Zett']);
	});
});

describe('zaehlen + aufteilung', () => {
	const rs = [
		r('A', 'zugesagt', [p('PA'), g('G1')]),
		r('B', 'zugesagt'),
		r('C', 'abgesagt', [p('PC')]),
		r('D', 'abgesagt')
	];

	it('zählt Mitglieder, Partner(innen) und Gäste getrennt', () => {
		expect(zaehlen(rs)).toEqual({ mitglieder: 2, partner: 2, gaeste: 1, personen: 5 });
	});

	it('beschriftet mit Einzahl/Mehrzahl und lässt leere Gruppen weg', () => {
		expect(aufteilung(zaehlen(rs))).toBe('2 Mitglieder, 2 Partner(innen), 1 Gast');
		expect(aufteilung({ mitglieder: 1, partner: 1, gaeste: 0, personen: 2 })).toBe(
			'1 Mitglied, 1 Partner(in)'
		);
	});
});

describe('gaesteListe', () => {
	it('enthält nur echte Gäste, immer mit Gastgeber', () => {
		expect(
			gaesteListe([
				r('Andreas Kremer', 'zugesagt', [p('Petra Kremer'), g('Zeno Gast', 'z')]),
				r('Hans Müller', 'abgesagt', [g('Anton Gast', 'a')])
			])
		).toEqual([
			{ id: 'a', name: 'Anton Gast', host: 'Hans Müller' },
			{ id: 'z', name: 'Zeno Gast', host: 'Andreas Kremer' }
		]);
	});
});

describe('begleitungTyp', () => {
	it('beschreibt Art und Bezug', () => {
		const zu = r('Andreas Kremer', 'zugesagt');
		const ab = r('Andreas Kremer', 'abgesagt');
		expect(begleitungTyp(p('Petra Kremer'), zu)).toBe('Partner(in) von Andreas Kremer');
		expect(begleitungTyp(g('Gerda Gast'), ab)).toBe('Gast von Andreas Kremer (selbst abgesagt)');
	});
});
