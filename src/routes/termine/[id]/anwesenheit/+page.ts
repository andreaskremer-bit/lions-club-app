import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type AttMember = {
	id: string;
	first_name: string;
	last_name: string;
	status: 'aktiv' | 'inaktiv' | 'ehrenmitglied';
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, permissions } = await parent();

	if (!permissions.includes('record_attendance')) {
		throw redirect(303, `/termine/${params.id}`);
	}

	const [evRes, memRes, attRes, rsvpRes] = await Promise.all([
		supabase
			.from('event')
			.select('id, title, type, starts_at, donation_required')
			.eq('id', params.id)
			.maybeSingle(),
		supabase.from('member').select('id, first_name, last_name, status').order('last_name'),
		supabase.from('attendance').select('member_id, present').eq('event_id', params.id),
		supabase.from('event_response').select('member_id, status').eq('event_id', params.id)
	]);

	if (evRes.error) throw error(500, evRes.error.message);
	if (!evRes.data) throw error(404, 'Termin nicht gefunden');

	const event = evRes.data as {
		id: string;
		title: string;
		type: string;
		starts_at: string;
		donation_required: boolean;
	};
	// Anwesenheit gibt es nur für spendenpflichtige Termine.
	if (!event.donation_required) throw redirect(303, `/termine/${params.id}`);

	const attendance: Record<string, boolean> = {};
	for (const a of (attRes.data ?? []) as { member_id: string; present: boolean }[]) {
		attendance[a.member_id] = a.present;
	}

	// Rückmeldungen für die Vorbelegung (zugesagt→anwesend, abgesagt→abwesend).
	const rsvp: Record<string, 'zugesagt' | 'abgesagt'> = {};
	for (const r of (rsvpRes.data ?? []) as {
		member_id: string;
		status: 'zugesagt' | 'abgesagt';
	}[]) {
		rsvp[r.member_id] = r.status;
	}

	return { event, members: (memRes.data ?? []) as AttMember[], attendance, rsvp };
};
