import type { PageLoad } from './$types';
import type { EventType } from './termine/+page';
import type { NewsPost } from '$lib/news';

export type StartEvent = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const nowIso = new Date().toISOString();

	const [eventRes, newsRes] = await Promise.all([
		supabase
			.from('event')
			.select('id, title, type, location, starts_at')
			.gte('starts_at', nowIso)
			.order('starts_at', { ascending: true })
			.limit(1)
			.maybeSingle(),
		supabase
			.from('news_post')
			.select('id, title, body, pinned, published_at')
			.order('pinned', { ascending: false })
			.order('published_at', { ascending: false })
			.limit(1)
			.maybeSingle()
	]);

	return {
		nextEvent: (eventRes.data ?? null) as StartEvent | null,
		latestNews: (newsRes.data ?? null) as NewsPost | null
	};
};
