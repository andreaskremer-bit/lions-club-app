import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { EventType, RsvpStatus } from '../+page';

export type ResponseRow = {
	id: string;
	member_id: string;
	status: RsvpStatus;
	comment: string | null;
	member: { first_name: string; last_name: string } | null;
	companion: { id: string; name: string }[];
};

export type EventDetail = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	ends_at: string | null;
	description: string | null;
	companion_allowed: boolean;
	donation_required: boolean;
	event_response: ResponseRow[];
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, user } = await parent();

	const [eventRes, meRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, location, starts_at, ends_at, description, companion_allowed, donation_required, event_response(id, member_id, status, comment, member(first_name, last_name), companion(id, name))'
			)
			.eq('id', params.id)
			.maybeSingle(),
		supabase
			.from('member')
			.select('id')
			.eq('user_id', user?.id ?? '')
			.maybeSingle()
	]);

	if (eventRes.error) throw error(500, eventRes.error.message);
	if (!eventRes.data) throw error(404, 'Termin nicht gefunden');

	const event = eventRes.data as unknown as EventDetail;
	return {
		event,
		myMemberId: (meRes.data?.id ?? null) as string | null,
		isPast: new Date(event.starts_at).getTime() < Date.now()
	};
};
