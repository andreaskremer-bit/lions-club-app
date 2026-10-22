import { describe, expect, it } from 'vitest';
import { buildRows, unrecordedEvents, type AuswMember, type AttRow } from './auswertung';

const members: AuswMember[] = [
	{ id: 'a', first_name: 'Anna', last_name: 'Aktiv', status: 'aktiv' },
	{ id: 'i', first_name: 'Ingo', last_name: 'Inaktiv', status: 'inaktiv' },
	{ id: 'e', first_name: 'Erna', last_name: 'Ehren', status: 'ehrenmitglied' },
	{ id: 'n', first_name: 'Nils', last_name: 'Neu', status: 'aktiv' }
];
const att: AttRow[] = [
	{ event_id: 'e1', member_id: 'a', present: false },
	{ event_id: 'e1', member_id: 'i', present: false },
	{ event_id: 'e2', member_id: 'i', present: true },
	{ event_id: 'e2', member_id: 'a', present: true }
];

describe('buildRows', () => {
	it('behält inzwischen inaktive Mitglieder mit erfasster Anwesenheit samt heutigem Status', () => {
		const rows = buildRows(members, att);
		const ingo = rows.find((r) => r.id === 'i')!;
		expect(ingo).toMatchObject({ status: 'inaktiv', abwesend: 1, anwesend: 1, erfasst: 2 });
	});
	it('zeigt aktive Mitglieder auch ohne Erfassung, andere ohne Erfassung nicht', () => {
		const ids = buildRows(members, att).map((r) => r.id);
		expect(ids).toEqual(['a', 'i', 'n']);
	});
});

describe('unrecordedEvents', () => {
	const now = new Date('2026-10-22T12:00:00Z');
	const events = [
		{ id: 'e1', title: 'A', starts_at: '2026-10-01T17:00:00Z' },
		{ id: 'e3', title: 'B', starts_at: '2026-10-08T17:00:00Z' },
		{ id: 'e4', title: 'C', starts_at: '2026-11-05T17:00:00Z' }
	];
	it('meldet vergangene Termine ohne Erfassung, nicht künftige', () => {
		expect(unrecordedEvents(events, att, now).map((e) => e.id)).toEqual(['e3']);
	});
});
