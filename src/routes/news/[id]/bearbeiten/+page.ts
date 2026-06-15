import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { NewsPost } from '$lib/news';

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();
	const { data: post } = await supabase
		.from('news_post')
		.select('id, title, body, pinned, published_at')
		.eq('id', params.id)
		.maybeSingle();
	if (!post) throw error(404, 'Nachricht nicht gefunden');
	return { post: post as NewsPost };
};
