import type { PageLoad } from './$types';
import { presidentChronicle } from '$lib/amtHistory';

// Präsidenten seit der Gründung: Mitglieder aus member_amt (alle Lions-Jahre),
// Ehemalige ohne Mitgliedszeile aus praesident_chronik.
export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const [maRes, chronikRes] = await Promise.all([
		supabase
			.from('member_amt')
			.select('lions_year, member(id, first_name, last_name), amt!inner(key)')
			.eq('amt.key', 'praesident'),
		supabase.from('praesident_chronik').select('lions_year, name')
	]);
	const members = (maRes.data ?? []) as unknown as {
		lions_year: number;
		member: { id: string; first_name: string; last_name: string } | null;
	}[];
	return {
		presidents: presidentChronicle(
			members,
			(chronikRes.data ?? []) as { lions_year: number; name: string }[]
		)
	};
};
