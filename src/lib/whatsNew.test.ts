import { describe, expect, it } from 'vitest';
import type { ChangelogEntry } from './changelog';
import { latestChangelogDate, unseenEntries } from './whatsNew';

const LOG: ChangelogEntry[] = [
	{ date: '2026-10-02', changes: [{ kind: 'neu', text: 'C' }] },
	{ date: '2026-09-03', changes: [{ kind: 'neu', text: 'B' }] },
	{ date: '2026-08-04', changes: [{ kind: 'neu', text: 'A' }] }
];

describe('unseenEntries', () => {
	it('liefert alle Einträge nach dem zuletzt gesehenen', () => {
		expect(unseenEntries('2026-08-04', LOG).map((e) => e.date)).toEqual([
			'2026-10-02',
			'2026-09-03'
		]);
	});

	it('liefert nichts, wenn der neueste Eintrag schon gesehen ist', () => {
		expect(unseenEntries('2026-10-02', LOG)).toEqual([]);
	});

	it('zeigt ohne gespeicherten Stand nur den neuesten Eintrag, nicht die ganze Historie', () => {
		expect(unseenEntries(null, LOG).map((e) => e.date)).toEqual(['2026-10-02']);
	});
});

describe('latestChangelogDate', () => {
	it('nimmt den ersten Eintrag (Changelog ist neueste zuerst)', () => {
		expect(latestChangelogDate(LOG)).toBe('2026-10-02');
	});

	it('kommt mit leerem Changelog zurecht', () => {
		expect(latestChangelogDate([])).toBeNull();
	});
});
