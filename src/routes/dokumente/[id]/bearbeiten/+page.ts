import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { DocumentRow } from '$lib/documents';

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase } = await parent();
	const { data: doc } = await supabase
		.from('document')
		.select('id, title, category, doc_date, description, event_id, file_path, file_name')
		.eq('id', params.id)
		.maybeSingle();
	if (!doc) throw error(404, 'Dokument nicht gefunden');
	const { data: events } = await supabase
		.from('event')
		.select('id, title, starts_at')
		.order('starts_at', { ascending: false })
		.limit(100);
	return {
		doc: doc as DocumentRow,
		events: (events ?? []) as { id: string; title: string; starts_at: string }[]
	};
};
