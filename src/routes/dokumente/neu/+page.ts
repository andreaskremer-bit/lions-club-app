import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('event')
		.select('id, title, starts_at')
		.order('starts_at', { ascending: false })
		.limit(100);
	return { events: (data ?? []) as { id: string; title: string; starts_at: string }[] };
};
