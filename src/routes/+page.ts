import type { PageLoad } from './$types';
import type { EventType } from './termine/+page';
import { DEFAULT_EVENT_MS } from '$lib/dates';
import { authorAmtAt } from '$lib/news';

export type StartEvent = {
	id: string;
	title: string;
	type: EventType;
	location: string | null;
	starts_at: string;
	ends_at: string | null;
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
		member_amt: {
			lions_year: number;
			amt: { label: string; sort_order: number; cluster: string | null } | null;
		}[];
	} | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase, memberId } = await parent();
	const now = Date.now();
	const nowIso = new Date(now).toISOString();
	// Ohne `ends_at` gilt Beginn + 2 h als Ende (siehe `eventEnd`).
	const startCutoffIso = new Date(now - DEFAULT_EVENT_MS).toISOString();
	const NEWS_COLS =
		'id, title, body, pinned, published_at, author:published_by(first_name, last_name, member_amt(lions_year, amt(label, sort_order, cluster)))';

	const [eventRes, newsRes, pinnedRes, activeRes] = await Promise.all([
		supabase
			.from('event')
			.select(
				'id, title, type, location, starts_at, ends_at, event_response(member_id, status, companion(id))'
			)
			// Noch nicht zu Ende – ein laufender Termin bleibt „nächster Termin“, bis er endet.
			.or(`ends_at.gt.${nowIso},and(ends_at.is.null,starts_at.gt.${startCutoffIso})`)
			.order('starts_at', { ascending: true })
			.limit(1)
			.maybeSingle(),
		// „Neueste News“ ist wirklich die neueste. Eine angepinnte steht zusätzlich darüber –
		// vorher belegte sie die Karte dauerhaft, und neue Beiträge erschienen nicht.
		supabase
			.from('news_post')
			.select(NEWS_COLS)
			.order('published_at', { ascending: false })
			.limit(1)
			.maybeSingle(),
		supabase
			.from('news_post')
			.select(NEWS_COLS)
			.eq('pinned', true)
			.order('published_at', { ascending: false })
			.limit(1)
			.maybeSingle(),
		supabase.from('member').select('id').eq('status', 'aktiv')
	]);

	const toStart = (raw: RawNews | null): StartNews | null => {
		if (!raw) return null;
		const a = raw.author;
		return {
			id: raw.id,
			title: raw.title,
			body: raw.body,
			pinned: raw.pinned,
			published_at: raw.published_at,
			authorName: a ? `${a.first_name} ${a.last_name}` : null,
			authorRole: a ? (authorAmtAt(a.member_amt, raw.published_at)?.label ?? null) : null
		};
	};
	const latestNews = toStart(newsRes.data as unknown as RawNews | null);
	const pinned = toStart(pinnedRes.data as unknown as RawNews | null);
	const pinnedNews = pinned && pinned.id !== latestNews?.id ? pinned : null;

	return {
		nextEvent: (eventRes.data ?? null) as StartEvent | null,
		latestNews,
		pinnedNews,
		activeMemberIds: (activeRes.data ?? []).map((m) => m.id as string),
		myMemberId: memberId
	};
};
