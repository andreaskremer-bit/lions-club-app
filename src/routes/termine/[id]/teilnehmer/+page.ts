import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type TQuestion = { id: string; label: string; sort_order: number };
export type TResponse = {
	member_id: string;
	status: 'zugesagt' | 'abgesagt';
	member: { first_name: string; last_name: string } | null;
	companion: { id: string; name: string }[];
};
export type TAnswer = {
	question_id: string;
	member_id: string;
	companion_id: string | null;
	value: unknown;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, permissions } = await parent();
	if (!permissions.includes('manage_events')) throw redirect(303, `/termine/${params.id}`);

	const [evRes, qRes, rRes, aRes] = await Promise.all([
		supabase.from('event').select('id, title').eq('id', params.id).maybeSingle(),
		supabase
			.from('question')
			.select('id, label, sort_order')
			.eq('event_id', params.id)
			.order('sort_order'),
		supabase
			.from('event_response')
			.select('member_id, status, member(first_name, last_name), companion(id, name)')
			.eq('event_id', params.id)
			.eq('status', 'zugesagt'),
		supabase
			.from('answer')
			.select('question_id, member_id, companion_id, value, question!inner(event_id)')
			.eq('question.event_id', params.id)
	]);

	if (evRes.error) throw error(500, evRes.error.message);
	if (!evRes.data) throw error(404, 'Termin nicht gefunden');

	return {
		event: evRes.data as { id: string; title: string },
		questions: (qRes.data ?? []) as TQuestion[],
		responses: (rRes.data ?? []) as unknown as TResponse[],
		answers: (aRes.data ?? []) as unknown as TAnswer[]
	};
};
