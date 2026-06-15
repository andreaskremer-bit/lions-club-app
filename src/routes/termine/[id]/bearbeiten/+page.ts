import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { EventType } from '$lib/dates';

export type EditEvent = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	ends_at: string | null;
	description: string | null;
	reminder_days_before: number;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('event')
		.select('id, title, type, location, starts_at, ends_at, description, reminder_days_before')
		.eq('id', params.id)
		.maybeSingle();
	if (!data) throw error(404, 'Termin nicht gefunden');
	return { event: data as EditEvent };
};
