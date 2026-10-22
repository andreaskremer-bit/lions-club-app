import type { PageLoad } from './$types';
import { authorAmtAt } from '$lib/news';

export type NewsFeedItem = {
	id: string;
	title: string;
	body: string;
	pinned: boolean;
	published_at: string;
	authorName: string | null;
	authorRole: string | null;
};

type Raw = {
	id: string;
	title: string;
	body: string;
	pinned: boolean;
	published_at: string;
	author: {
		first_name: string;
		last_name: string;
		member_amt: {
			lions_year: number;
			amt: { label: string; abbr: string | null; sort_order: number } | null;
		}[];
	} | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('news_post')
		.select(
			'id, title, body, pinned, published_at, author:published_by(first_name, last_name, member_amt(lions_year, amt(label, abbr, sort_order)))'
		)
		.order('pinned', { ascending: false })
		.order('published_at', { ascending: false });

	const posts: NewsFeedItem[] = ((data ?? []) as unknown as Raw[]).map((p) => {
		const a = p.author;
		const role = a ? authorAmtAt(a.member_amt, p.published_at) : null;
		const roleLabel = role ? (role.abbr ?? role.label) : null;
		return {
			id: p.id,
			title: p.title,
			body: p.body,
			pinned: p.pinned,
			published_at: p.published_at,
			authorName: a ? `${a.first_name} ${a.last_name}` : null,
			authorRole: roleLabel
		};
	});

	return { posts };
};
