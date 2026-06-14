import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { MemberStatus } from '../+page';

type AmtRef = { label: string; sort_order: number; display_only: boolean };

export type MemberDetail = {
	id: string;
	user_id: string | null;
	first_name: string;
	last_name: string;
	title: string | null;
	status: MemberStatus;
	email: string;
	phone: string | null;
	mobile: string | null;
	street: string | null;
	zip: string | null;
	city: string | null;
	birthday: string | null;
	joined_on: string | null;
	photo_path: string | null;
	partner_name: string | null;
	partner_birthday: string | null;
	partner_email: string | null;
	partner_mobile: string | null;
	notes: string | null;
	member_amt: { amt: AmtRef | null }[];
};

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

	let photoUrl: string | null = null;
	if (member.photo_path) {
		const { data: signed } = await supabase.storage
			.from('member-photos')
			.createSignedUrl(member.photo_path, 3600);
		photoUrl = signed?.signedUrl ?? null;
	}

	return { member, photoUrl, isSelf: !!user && member.user_id === user.id };
};
