import type { PageLoad } from './$types';

export type BdayMember = {
	id: string;
	first_name: string;
	last_name: string;
	birthday: string;
	status: 'aktiv' | 'inaktiv' | 'ehrenmitglied';
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('member')
		.select('id, first_name, last_name, birthday, status')
		.not('birthday', 'is', null)
		.order('last_name');
	return { members: (data ?? []) as BdayMember[] };
};
