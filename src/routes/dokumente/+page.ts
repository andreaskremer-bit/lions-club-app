import type { PageLoad } from './$types';
import type { DocumentRow } from '$lib/documents';

const COLS =
	'id, title, category, doc_date, description, event_id, file_path, file_name, created_at';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('document')
		.select(COLS)
		// Termin-Anhänge erscheinen nur am jeweiligen Termin, nicht in der Ablage.
		.is('event_id', null)
		.order('doc_date', { ascending: false, nullsFirst: false })
		.order('created_at', { ascending: false });
	return { documents: (data ?? []) as DocumentRow[] };
};
