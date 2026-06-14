import type { PageLoad } from './$types';

export type Notif = {
	id: string;
	kind: 'event_reminder' | 'birthday' | 'attendance_due';
	title: string;
	body: string | null;
	event_id: string | null;
	created_at: string;
	read_at: string | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('notification')
		.select('id, kind, title, body, event_id, created_at, read_at')
		.order('created_at', { ascending: false });
	return { notifications: (data ?? []) as Notif[] };
};
