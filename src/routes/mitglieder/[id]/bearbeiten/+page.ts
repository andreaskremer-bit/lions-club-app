import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { MemberDetail } from '../+page';

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, user } = await parent();

	const { data, error: err } = await supabase
		.from('member')
		.select(
			'id, user_id, first_name, last_name, title, status, email, phone, mobile, street, zip, city, birthday, joined_on, photo_path, partner_name, partner_birthday, partner_email, partner_mobile, notes, member_amt(amt(label, sort_order, display_only))'
		)
		.eq('id', params.id)
		.maybeSingle();

	if (err) throw error(500, err.message);
	if (!data) throw error(404, 'Mitglied nicht gefunden');

	const member = data as unknown as MemberDetail;

	// Selbstpflege: nur die eigene Zeile ist hier bearbeitbar.
	if (!user || member.user_id !== user.id) {
		throw redirect(303, `/mitglieder/${member.id}`);
	}

	return { member };
};
