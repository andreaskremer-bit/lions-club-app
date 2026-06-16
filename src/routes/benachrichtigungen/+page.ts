import type { PageLoad } from './$types';

export type Notif = {
	id: string;
	kind: 'event_reminder' | 'birthday' | 'attendance_due' | 'document' | 'news';
	title: string;
	body: string | null;
	event_id: string | null;
	document_id: string | null;
	news_post_id: string | null;
	created_at: string;
	read_at: string | null;
};

export type NotificationChannel = 'push' | 'email' | 'both';

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
		channel: (me?.notification_channel ?? 'both') as NotificationChannel
	};
};
