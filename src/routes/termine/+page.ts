import type { PageLoad } from './$types';

export type EventType = 'clubabend' | 'versammlung' | 'reise' | 'gesellig' | 'lions_termin';
export type RsvpStatus = 'zugesagt' | 'abgesagt';

export type EventListItem = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	companion_allowed: boolean;
	donation_required: boolean;
	event_response: { member_id: string; status: RsvpStatus }[];
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase, user } = await parent();

	const [eventsRes, meRes, activeRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, location, starts_at, companion_allowed, donation_required, event_response(member_id, status)'
			)
			.order('starts_at'),
		supabase
			.from('member')
			.select('id')
			.eq('user_id', user?.id ?? '')
			.maybeSingle(),
		supabase.from('member').select('id', { count: 'exact', head: true }).eq('status', 'aktiv')
	]);

	return {
		events: (eventsRes.data ?? []) as unknown as EventListItem[],
		myMemberId: (meRes.data?.id ?? null) as string | null,
		activeCount: activeRes.count ?? 0
	};
};
