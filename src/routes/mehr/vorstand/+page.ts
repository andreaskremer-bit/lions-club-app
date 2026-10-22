import type { PageLoad } from './$types';
import { lionsStartYear } from '$lib/dates';

type AmtCluster = 'clubvorstand' | 'weiterer_vorstand' | 'beauftragte';
export type BoardAmt = { id: string; key: string; label: string; cluster: AmtCluster | null };
export type BoardHolder = { amt_id: string; lions_year: number; member: BoardMember | null };
type BoardMember = { id: string; first_name: string; last_name: string };

// Schreibgeschützte Übersicht für alle Mitglieder: Wer hat im laufenden Lions-Jahr welches
// Amt? Die Kürzel im Verzeichnis ließen sich auf dem Handy (kein Hover) sonst nicht
// auflösen. Verwaltung bleibt auf /vorstand (manage_roles).
export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const year = lionsStartYear(new Date());
	const [amtRes, maRes] = await Promise.all([
		supabase.from('amt').select('id, key, label, cluster').order('cluster').order('sort_order'),
		supabase
			.from('member_amt')
			.select('amt_id, lions_year, member(id, first_name, last_name)')
			.in('lions_year', [year - 1, year])
	]);
	return {
		year,
		amts: (amtRes.data ?? []) as BoardAmt[],
		holders: (maRes.data ?? []) as unknown as BoardHolder[]
	};
};
