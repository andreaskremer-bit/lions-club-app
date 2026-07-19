import type { PageLoad } from './$types';
import type { EventType } from './termine/+page';
import { lionsStartYear } from '$lib/dates';

export type StartEvent = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	event_response: {
		member_id: string;
		status: 'zugesagt' | 'abgesagt';
		companion: { id: string }[];
	}[];
};

export type StartNews = {
	id: string;
	title: string;
	body: string;
	pinned: boolean;
	published_at: string;
	authorName: string | null;
	authorRole: string | null;
};

type RawNews = {
	id: string;
	title: string;
	body: string;
	pinned: boolean;
	published_at: string;
	author: {
		first_name: string;
		last_name: string;
		member_amt: { lions_year: number; amt: { label: string; sort_order: number } | null }[];
	} | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase, memberId } = await parent();
	const nowIso = new Date().toISOString();
	const year = lionsStartYear(new Date());

	const [eventRes, newsRes, activeRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, location, starts_at, event_response(member_id, status, companion(id))'
			)
			.gte('starts_at', nowIso)
			.order('starts_at', { ascending: true })
			.limit(1)
			.maybeSingle(),
		supabase
			.from('news_post')
			.select(
				'id, title, body, pinned, published_at, author:published_by(first_name, last_name, member_amt(lions_year, amt(label, sort_order)))'
			)
			.order('pinned', { ascending: false })
			.order('published_at', { ascending: false })
			.limit(1)
			.maybeSingle(),
		supabase.from('member').select('id', { count: 'exact', head: true }).eq('status', 'aktiv')
	]);

	let latestNews: StartNews | null = null;
	const raw = newsRes.data as unknown as RawNews | null;
	if (raw) {
		const a = raw.author;
		const role =
			a?.member_amt
				.filter((ma) => ma.lions_year === year)
				.map((ma) => ma.amt)
				.filter((x): x is NonNullable<typeof x> => !!x)
				.sort((x, y) => x.sort_order - y.sort_order)[0]?.label ?? null;
		latestNews = {
			id: raw.id,
			title: raw.title,
			body: raw.body,
			pinned: raw.pinned,
			published_at: raw.published_at,
			authorName: a ? `${a.first_name} ${a.last_name}` : null,
			authorRole: role
		};
	}

	return {
		nextEvent: (eventRes.data ?? null) as StartEvent | null,
		latestNews,
		activeCount: activeRes.count ?? 0,
		myMemberId: memberId
	};
};
