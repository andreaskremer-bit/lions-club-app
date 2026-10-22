import type { PageLoad } from './$types';
import type { SuggestableEvent } from '$lib/documents';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('event')
		.select('id, title, starts_at, type')
		.order('starts_at', { ascending: false })
		.limit(100);
	return { events: (data ?? []) as (SuggestableEvent & { title: string })[] };
};
