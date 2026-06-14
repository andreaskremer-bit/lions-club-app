import type { PageLoad } from './$types';

export type MemberStatus = 'aktiv' | 'inaktiv' | 'ehrenmitglied';

type AmtRef = { label: string; sort_order: number; display_only: boolean };

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

	const { data, error } = await supabase
		.from('member')
		.select(
			'id, first_name, last_name, title, status, mobile, phone, email, photo_path, member_amt(amt(label, sort_order, display_only))'
		)
		.order('last_name')
		.order('first_name');

	return {
		// Cast über unknown: ohne generierte DB-Typen inferiert supabase-js die
		// eingebettete Relation als Array, zur Laufzeit ist amt aber ein Objekt.
		members: (data ?? []) as unknown as MemberListItem[],
		loadError: error?.message ?? null
	};
};
