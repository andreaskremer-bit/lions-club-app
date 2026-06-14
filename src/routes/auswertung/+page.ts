import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type AuswMember = { id: string; first_name: string; last_name: string };
export type AuswEvent = { id: string; title: string; starts_at: string };

export const load: PageLoad = async ({ parent }) => {
	const { supabase, permissions } = await parent();

	// Geldsicht/Auswertung nur für Schatzmeister (view_donations).
	if (!permissions.includes('view_donations')) throw redirect(303, '/');

	const [membersRes, eventsRes, attRes] = await Promise.all([
		supabase
			.from('member')
			.select('id, first_name, last_name')
			.eq('status', 'aktiv')
			.order('last_name')
			.order('first_name'),
		supabase
			.from('event')
			.select('id, title, starts_at')
			.eq('donation_required', true)
			.order('starts_at'),
		supabase.from('attendance').select('event_id, member_id, present')
	]);

	return {
		members: (membersRes.data ?? []) as AuswMember[],
		events: (eventsRes.data ?? []) as AuswEvent[],
		attendance: (attRes.data ?? []) as { event_id: string; member_id: string; present: boolean }[]
	};
};
