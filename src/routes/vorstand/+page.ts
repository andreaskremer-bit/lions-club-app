import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { lionsStartYear } from '$lib/dates';

export type AmtCluster = 'clubvorstand' | 'weiterer_vorstand' | 'beauftragte';
export type AmtRow = {
	id: string;
	key: string;
	label: string;
	cluster: AmtCluster;
	sort_order: number;
	display_only: boolean;
};
export type MemberRow = { id: string; first_name: string; last_name: string; status: string };
export type Assignment = { member_id: string; amt_id: string; lions_year: number };
export type Venue = {
	name: string | null;
	street: string | null;
	zip: string | null;
	city: string | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase, permissions } = await parent();
	if (!permissions.includes('manage_roles')) throw redirect(303, '/');

	const currentYear = lionsStartYear(new Date());

	const [amtRes, memRes, maRes, venueRes] = await Promise.all([
		supabase
			.from('amt')
			.select('id, key, label, cluster, sort_order, display_only')
			.order('cluster')
			.order('sort_order'),
		supabase
			.from('member')
			.select('id, first_name, last_name, status')
			.order('last_name')
			.order('first_name'),
		supabase
			.from('member_amt')
			.select('member_id, amt_id, lions_year')
			.in('lions_year', [currentYear - 1, currentYear, currentYear + 1]),
		supabase.from('club_venue').select('name, street, zip, city').eq('id', 1).maybeSingle()
	]);

	return {
		amts: (amtRes.data ?? []) as AmtRow[],
		members: (memRes.data ?? []) as MemberRow[],
		assignments: (maRes.data ?? []) as Assignment[],
		venue: (venueRes.data ?? { name: null, street: null, zip: null, city: null }) as Venue,
		currentYear
	};
};
