import type { PageLoad } from './$types';

export type Notif = {
	id: string;
	kind:
		| 'event_reminder'
		| 'birthday'
		| 'attendance_due'
		| 'document'
		| 'news'
		| 'event_new'
		| 'event_changed'
		| 'event_cancelled'
		| 'event_question';
	title: string;
	body: string | null;
	event_id: string | null;
	document_id: string | null;
	news_post_id: string | null;
	created_at: string;
	read_at: string | null;
};

// 'both' entfiel am 2026-10-22: Es verhielt sich wie 'push' (Push, E-Mail nur ohne Gerät).
export type NotificationChannel = 'push' | 'email';

export const load: PageLoad = async ({ parent }) => {
	const { supabase, memberId } = await parent();

	const [notifsRes, meRes] = await Promise.all([
		supabase
			.from('notification')
			.select('id, kind, title, body, event_id, document_id, news_post_id, created_at, read_at')
			.order('created_at', { ascending: false }),
		memberId
			? supabase.from('member').select('notification_channel').eq('id', memberId).maybeSingle()
			: Promise.resolve({ data: null })
	]);

	const me = meRes.data as { notification_channel: NotificationChannel } | null;
	return {
		notifications: (notifsRes.data ?? []) as Notif[],
		channel: (me?.notification_channel ?? 'push') as NotificationChannel
	};
};
