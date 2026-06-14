import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type QuestionType = 'single' | 'multi' | 'text' | 'boolean' | 'number';
export type QuestionRow = {
	id: string;
	label: string;
	qtype: QuestionType;
	options: string[] | null;
	required: boolean;
	sort_order: number;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, permissions } = await parent();
	if (!permissions.includes('manage_events')) throw redirect(303, `/termine/${params.id}`);

	const [evRes, qRes] = await Promise.all([
		supabase.from('event').select('id, title').eq('id', params.id).maybeSingle(),
		supabase
			.from('question')
			.select('id, label, qtype, options, required, sort_order')
			.eq('event_id', params.id)
			.order('sort_order')
	]);

	if (evRes.error) throw error(500, evRes.error.message);
	if (!evRes.data) throw error(404, 'Termin nicht gefunden');

	return {
		event: evRes.data as { id: string; title: string },
		questions: (qRes.data ?? []) as QuestionRow[]
	};
};
