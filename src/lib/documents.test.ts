import { describe, expect, it } from 'vitest';
import {
	archiveCategoryOptions,
	inArchive,
	suggestEvent,
	type SuggestableEvent
} from './documents';

const events: SuggestableEvent[] = [
	{ id: 'ca-0710', starts_at: '2026-10-07T17:00:00+00:00', type: 'clubabend' },
	{ id: 'ca-2110', starts_at: '2026-10-21T17:00:00+00:00', type: 'clubabend' },
	{ id: 'ca-0411', starts_at: '2026-11-04T18:00:00+00:00', type: 'clubabend' },
	{ id: 'mv-1510', starts_at: '2026-10-15T17:00:00+00:00', type: 'versammlung' },
	{ id: 'reise', starts_at: '2026-10-20T08:00:00+00:00', type: 'reise' }
];

describe('inArchive', () => {
	it('zeigt Protokolle mit Termin in der Ablage', () => {
		expect(inArchive({ category: 'protokoll_clubabend', event_id: 'x' })).toBe(true);
	});
	it('blendet Termin-Unterlagen mit Termin aus', () => {
		expect(inArchive({ category: 'termin_unterlage', event_id: 'x' })).toBe(false);
	});
	it('zeigt Termin-Unterlagen ohne Termin (gelöschter Termin), sonst wären sie unauffindbar', () => {
		expect(inArchive({ category: 'termin_unterlage', event_id: null })).toBe(true);
	});
	it('bietet Termin-Unterlage nicht als Filter in der Ablage an', () => {
		expect(archiveCategoryOptions.map((o) => o.value)).not.toContain('termin_unterlage');
	});
});

describe('suggestEvent', () => {
	it('nimmt den Clubabend am Protokolldatum', () => {
		expect(suggestEvent(events, 'protokoll_clubabend', '2026-10-21')).toBe('ca-2110');
	});
	it('schlägt ohne Clubabend am Protokolldatum nichts vor (kein Rückgriff auf ältere)', () => {
		expect(suggestEvent(events, 'protokoll_clubabend', '2026-10-20')).toBeNull();
	});
	it('schlägt ohne Datum nichts vor', () => {
		expect(suggestEvent(events, 'protokoll_clubabend', null)).toBeNull();
	});
	it('wählt für MV-Protokolle die Mitgliederversammlung', () => {
		expect(suggestEvent(events, 'protokoll_mv', '2026-10-15')).toBe('mv-1510');
		expect(suggestEvent(events, 'protokoll_clubabend', '2026-10-15')).toBeNull();
	});
	it('zählt den Kalendertag in Europe/Berlin', () => {
		// 23:30 UTC am 21.10. ist in Berlin schon der 22.10.
		const late = [
			{ id: 'spaet', starts_at: '2026-10-21T23:30:00+00:00', type: 'clubabend' as const }
		];
		expect(suggestEvent(late, 'protokoll_clubabend', '2026-10-21')).toBeNull();
		expect(suggestEvent(late, 'protokoll_clubabend', '2026-10-22')).toBe('spaet');
	});
	it('macht für andere Kategorien keinen Vorschlag', () => {
		expect(suggestEvent(events, 'satzung', '2026-10-21')).toBeNull();
		expect(suggestEvent(events, 'termin_unterlage', '2026-10-21')).toBeNull();
	});
});
