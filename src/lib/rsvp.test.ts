import { describe, it, expect } from 'vitest';
import { rsvpCounts } from './rsvp';

const active = new Set(['a1', 'a2', 'a3', 'a4']);

describe('rsvpCounts', () => {
	it('zählt zugesagte Mitglieder und ihre Begleitpersonen', () => {
		const c = rsvpCounts(
			[
				{ member_id: 'a1', status: 'zugesagt', companion: [{}] },
				{ member_id: 'a2', status: 'abgesagt', companion: [] }
			],
			active
		);
		expect(c).toEqual({ zu: 2, ab: 1, offen: 2, gaeste: 1 });
	});

	it('zählt Begleitpersonen auch, wenn das Mitglied selbst abgesagt hat', () => {
		const c = rsvpCounts([{ member_id: 'a1', status: 'abgesagt', companion: [{}, {}] }], active);
		expect(c).toEqual({ zu: 2, ab: 1, offen: 3, gaeste: 2 });
	});

	it('Rückmeldungen inaktiver oder Ehrenmitglieder verringern „offen“ nicht', () => {
		const c = rsvpCounts(
			[
				{ member_id: 'ehren', status: 'zugesagt', companion: [] },
				{ member_id: 'inaktiv', status: 'abgesagt', companion: [] }
			],
			active
		);
		expect(c.offen).toBe(4);
		expect(c.zu).toBe(1);
		expect(c.ab).toBe(1);
	});
});
