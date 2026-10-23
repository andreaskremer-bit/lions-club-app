import { describe, it, expect } from 'vitest';
import { amtSpans, lionsYearLabel, presidentChronicle } from './amtHistory';

const P = { label: 'Präsident(in)', sort_order: 10 };
const VP = { label: 'Vizepräsident(in)', sort_order: 20 };
const PR = { label: 'Presse', sort_order: 90 };

describe('lionsYearLabel', () => {
	it('formatiert Startjahr als Lions-Jahr', () => {
		expect(lionsYearLabel(2013)).toBe('2013/14');
		expect(lionsYearLabel(1999)).toBe('1999/00');
	});
});

describe('amtSpans', () => {
	it('fasst aufeinanderfolgende Jahre zusammen und trennt Lücken', () => {
		const spans = amtSpans([
			{ lions_year: 2014, amt: PR },
			{ lions_year: 2015, amt: PR },
			{ lions_year: 2016, amt: PR },
			{ lions_year: 2020, amt: PR }
		]);
		expect(spans.map((s) => s.text)).toEqual(['2020/21', '2014/15 – 2016/17']);
	});

	it('sortiert neueste zuerst, bei gleichem Ende nach Amt', () => {
		const spans = amtSpans([
			{ lions_year: 2026, amt: PR },
			{ lions_year: 2026, amt: VP },
			{ lions_year: 2017, amt: P }
		]);
		expect(spans.map((s) => s.label)).toEqual(['Vizepräsident(in)', 'Presse', 'Präsident(in)']);
	});

	it('ignoriert doppelte Jahre und fehlende Ämter', () => {
		const spans = amtSpans([
			{ lions_year: 2010, amt: P },
			{ lions_year: 2010, amt: P },
			{ lions_year: 2011, amt: null }
		]);
		expect(spans).toEqual([{ label: 'Präsident(in)', from: 2010, to: 2010, text: '2010/11' }]);
	});
});

describe('presidentChronicle', () => {
	it('führt Mitglieder und Ehemalige zusammen, Mitglied gewinnt', () => {
		const list = presidentChronicle(
			[{ lions_year: 2001, member: { id: 'm1', first_name: 'Carl', last_name: 'K' } }],
			[
				{ lions_year: 2001, name: 'Doppelt' },
				{ lions_year: 2000, name: 'Ehemalig' }
			]
		);
		expect(list).toEqual([
			{ year: 2001, name: 'Carl K', memberId: 'm1' },
			{ year: 2000, name: 'Ehemalig', memberId: null }
		]);
	});
});
