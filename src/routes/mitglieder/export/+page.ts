import type { PageLoad } from './$types';
import type { ExportMember } from '$lib/lionsExport';

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();

	// Alle Mitglieder (inkl. inaktive) — Verzeichnis-RLS erlaubt das Lesen.
	const { data } = await supabase
		.from('member')
		.select(
			'lions_member_no, title, first_name, last_name, status, email, phone, mobile, phone_office, street, zip, city, birthday, joined_on'
		)
		.order('last_name')
		.order('first_name');

	return { members: (data ?? []) as ExportMember[] };
};
