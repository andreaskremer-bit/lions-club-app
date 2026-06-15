import type { PageLoad } from './$types';
import type { NewsPost } from '$lib/news';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('news_post')
		.select('id, title, body, pinned, published_at')
		.order('pinned', { ascending: false })
		.order('published_at', { ascending: false });
	return { posts: (data ?? []) as NewsPost[] };
};
