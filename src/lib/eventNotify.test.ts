import { describe, expect, it } from 'vitest';
import { cancelText, changeSummary, newEventText } from './eventNotify';

const base = { starts_at: '2026-11-04T18:00:00.000Z', location: 'Hotel Königshof' };

describe('changeSummary', () => {
	it('meldet nichts, wenn Beginn und Ort gleich bleiben', () => {
		expect(changeSummary(base, { ...base, starts_at: '2026-11-04T18:00:00+00:00' })).toBeNull();
	});
	it('ignoriert Sekunden (das Formular rechnet minutengenau)', () => {
		expect(changeSummary(base, { ...base, starts_at: '2026-11-04T18:00:42.000Z' })).toBeNull();
	});
	it('nennt neuen Beginn in Berliner Zeit', () => {
		expect(changeSummary(base, { ...base, starts_at: '2026-11-04T18:30:00.000Z' })).toBe(
			'Neuer Beginn: Mittwoch, 4. November 2026 um 19:30 Uhr.'
		);
	});
	it('nennt neuen Ort und beides zusammen', () => {
		expect(changeSummary(base, { ...base, location: 'Rheinblick' })).toBe('Neuer Ort: Rheinblick.');
		expect(
			changeSummary(base, { starts_at: '2026-11-05T18:00:00.000Z', location: 'Rheinblick' })
		).toBe('Neuer Beginn: Donnerstag, 5. November 2026 um 19:00 Uhr. Neuer Ort: Rheinblick.');
	});
	it('meldet einen entfernten Ort', () => {
		expect(changeSummary(base, { ...base, location: '' })).toBe('Der Ort ist noch offen.');
	});
});

describe('Texte', () => {
	it('Absage und neuer Termin', () => {
		expect(cancelText(base.starts_at)).toBe('Der Termin am Mittwoch, 4. November 2026 fällt aus.');
		expect(newEventText(base.starts_at, base.location)).toBe(
			'Mittwoch, 4. November 2026 um 19:00 Uhr, Hotel Königshof.'
		);
	});
});
