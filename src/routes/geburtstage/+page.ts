import type { PageLoad } from './$types';

export type BdayMember = {
	id: string;
	first_name: string;
	last_name: string;
	birthday: string | null;
	status: 'aktiv' | 'inaktiv' | 'ehrenmitglied';
	partner_first_name: string | null;
	partner_last_name: string | null;
	partner_birthday: string | null;
	partner_birthday_show_age: boolean;
};

export const load: PageLoad = async ({ parent }) => {
	const { supabase } = await parent();
	const { data } = await supabase
		.from('member')
		.select(
			'id, first_name, last_name, birthday, status, partner_first_name, partner_last_name, partner_birthday, partner_birthday_show_age'
		)
		.or('birthday.not.is.null,partner_birthday.not.is.null')
		.order('last_name');
	return { members: (data ?? []) as BdayMember[] };
};
