import { describe, expect, it } from 'vitest';
import { CHANGELOG, changelogVersion, formatChangelogDate } from './changelog';

describe('formatChangelogDate', () => {
	it('schreibt das Datum deutsch aus', () => {
		expect(formatChangelogDate('2026-08-04')).toBe('4. August 2026');
		expect(formatChangelogDate('2026-03-01')).toBe('1. März 2026');
		expect(formatChangelogDate('2026-12-31')).toBe('31. Dezember 2026');
	});

	it('gibt unbrauchbare Eingaben unverändert zurück, statt "undefined" anzuzeigen', () => {
		expect(formatChangelogDate('kaputt')).toBe('kaputt');
		expect(formatChangelogDate('2026-13-01')).toBe('2026-13-01');
	});
});

describe('changelogVersion', () => {
	it('nutzt dieselbe Schreibweise wie die Versionsnummer im Build', () => {
		expect(changelogVersion('2026-08-04')).toBe('2026.08.04');
	});
});

describe('CHANGELOG', () => {
	it('führt alle Einträge mit ISO-Datum', () => {
		for (const entry of CHANGELOG) {
			expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		}
	});

	it('ist neueste zuerst sortiert (Reihenfolge der Anzeige)', () => {
		const dates = CHANGELOG.map((e) => e.date);
		expect(dates).toEqual([...dates].sort().reverse());
	});

	it('hat je Eintrag mindestens eine Änderung mit Text', () => {
		for (const entry of CHANGELOG) {
			expect(entry.changes.length).toBeGreaterThan(0);
			for (const change of entry.changes) expect(change.text.trim()).not.toBe('');
		}
	});

	it('nennt keine Details zu Sicherheitslücken (nur neutrale Zusammenfassung)', () => {
		const verboten = /lücke|luecke|exploit|schwachstelle|angreifer|sicherheitsleck/i;
		for (const entry of CHANGELOG) {
			for (const change of entry.changes) expect(change.text).not.toMatch(verboten);
		}
	});
});
