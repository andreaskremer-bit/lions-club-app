import type { PageLoad } from './$types';

export type EventType = 'clubabend' | 'versammlung' | 'reise' | 'gesellig' | 'lions_termin';
export type RsvpStatus = 'zugesagt' | 'abgesagt';

export type MemberLite = {
	id: string;
	first_name: string;
	last_name: string;
	status: 'aktiv' | 'inaktiv' | 'ehrenmitglied';
};

export type EventListItem = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	companion_allowed: boolean;
	donation_required: boolean;
	event_response: { member_id: string; status: RsvpStatus; companion: { id: string }[] }[];
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase, user } = await parent();

	const [eventsRes, meRes, membersRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, location, starts_at, companion_allowed, donation_required, event_response(member_id, status, companion(id))'
			)
			.order('starts_at'),
		supabase
			.from('member')
			.select('id')
			.eq('user_id', user?.id ?? '')
			.maybeSingle(),
		supabase.from('member').select('id, first_name, last_name, status').order('last_name')
	]);

	return {
		events: (eventsRes.data ?? []) as unknown as EventListItem[],
		myMemberId: (meRes.data?.id ?? null) as string | null,
		members: (membersRes.data ?? []) as MemberLite[]
	};
};
