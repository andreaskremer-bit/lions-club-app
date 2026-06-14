import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { count } = await supabase
		.from('notification')
		.select('id', { count: 'exact', head: true })
		.is('read_at', null);
	return { unread: count ?? 0 };
};
