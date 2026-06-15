import { describe, it, expect } from 'vitest';
import { buildIcs, icsFilename } from './ics';

const now = new Date('2026-06-01T10:00:00Z');

describe('buildIcs', () => {
	it('baut ein gültiges VEVENT mit DTSTART/DTEND (UTC)', () => {
		const ics = buildIcs(
			{
				id: 'abc',
				title: 'Club-Abend',
				location: 'Thalia Bonn',
				description: null,
				starts_at: '2026-06-18T17:00:00Z',
				ends_at: '2026-06-18T19:00:00Z'
			},
			now
		);
		expect(ics).toContain('BEGIN:VCALENDAR');
		expect(ics).toContain('DTSTART:20260618T170000Z');
		expect(ics).toContain('DTEND:20260618T190000Z');
		expect(ics).toContain('SUMMARY:Club-Abend');
		expect(ics).toContain('LOCATION:Thalia Bonn');
		expect(ics).toContain('END:VCALENDAR');
		expect(ics.includes('\r\n')).toBe(true);
	});

	it('setzt DTEND auf Beginn + 2h, wenn ends_at fehlt', () => {
		const ics = buildIcs(
			{
				id: 'x',
				title: 'T',
				location: null,
				description: null,
				starts_at: '2026-06-18T17:00:00Z',
				ends_at: null
			},
			now
		);
		expect(ics).toContain('DTSTART:20260618T170000Z');
		expect(ics).toContain('DTEND:20260618T190000Z');
		expect(ics).not.toContain('LOCATION:');
	});

	it('escaped Sonderzeichen in Text', () => {
		const ics = buildIcs(
			{
				id: 'y',
				title: 'A, B; C',
				location: null,
				description: 'Zeile1\nZeile2',
				starts_at: '2026-06-18T17:00:00Z',
				ends_at: null
			},
			now
		);
		expect(ics).toContain('SUMMARY:A\\, B\\; C');
		expect(ics).toContain('DESCRIPTION:Zeile1\\nZeile2');
	});
});

describe('icsFilename', () => {
	it('erzeugt einen Slug mit .ics', () => {
		expect(icsFilename('Club-Abend: Thalia!')).toBe('club-abend-thalia.ics');
	});
	it('fällt auf "termin" zurück', () => {
		expect(icsFilename('—')).toBe('termin.ics');
	});
});
