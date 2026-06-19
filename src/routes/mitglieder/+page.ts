import type { PageLoad } from './$types';
import { lionsStartYear } from '$lib/dates';

export type MemberStatus = 'aktiv' | 'inaktiv' | 'ehrenmitglied';

type AmtRef = { label: string; abbr: string | null; sort_order: number; display_only: boolean };

export type MemberListItem = {
	id: string;
	first_name: string;
	last_name: string;
	title: string | null;
	status: MemberStatus;
	mobile: string | null;
	phone: string | null;
	email: string;
	photo_path: string | null;
	member_amt: { amt: AmtRef | null }[];
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();

	// Nur Ämter des aktuellen Lions-Jahres als Untertitel/Badge anzeigen.
	const { data, error } = await supabase
		.from('member')
		.select(
			'id, first_name, last_name, title, status, mobile, phone, email, photo_path, member_amt(amt(label, abbr, sort_order, display_only))'
		)
		.eq('member_amt.lions_year', lionsStartYear(new Date()))
		.order('last_name')
		.order('first_name');

	// Cast über unknown: ohne generierte DB-Typen inferiert supabase-js die
	// eingebettete Relation als Array, zur Laufzeit ist amt aber ein Objekt.
	const members = (data ?? []) as unknown as MemberListItem[];

	// Signierte URLs für vorhandene Fotos (privater Bucket) in einem Aufruf.
	const photoUrls: Record<string, string> = {};
	const paths = members.map((m) => m.photo_path).filter((p): p is string => !!p);
	if (paths.length) {
		const { data: signed } = await supabase.storage
			.from('member-photos')
			.createSignedUrls(paths, 3600);
		for (const s of signed ?? []) {
			if (s.signedUrl && s.path) photoUrls[s.path] = s.signedUrl;
		}
	}

	return { members, photoUrls, loadError: error?.message ?? null };
};
