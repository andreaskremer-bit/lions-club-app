import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { MemberStatus } from '../../+page';

export type EditMember = {
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
	member_amt: { amt_id: string }[];
};

export type AmtOption = { id: string; label: string; sort_order: number };

export const load: PageLoad = async ({ parent, params }) => {
	const { supabase, user, permissions } = await parent();
	const canEditMaster = permissions.includes('edit_member_master');

	const [memRes, amtRes] = await Promise.all([
		supabase
			.from('member')
			.select(
				'id, user_id, first_name, last_name, title, status, email, phone, mobile, street, zip, city, birthday, joined_on, photo_path, partner_name, partner_birthday, partner_email, partner_mobile, member_amt(amt_id)'
			)
			.eq('id', params.id)
			.maybeSingle(),
		supabase.from('amt').select('id, label, sort_order').order('sort_order')
	]);

	if (memRes.error) throw error(500, memRes.error.message);
	if (!memRes.data) throw error(404, 'Mitglied nicht gefunden');

	const member = memRes.data as unknown as EditMember;
	const isSelf = !!user && member.user_id === user.id;

	// Bearbeiten darf: man selbst (Selbstpflege) ODER edit_member_master.
	if (!isSelf && !canEditMaster) throw redirect(303, `/mitglieder/${member.id}`);

	let photoUrl: string | null = null;
	if (member.photo_path) {
		const { data: signed } = await supabase.storage
			.from('member-photos')
			.createSignedUrl(member.photo_path, 3600);
		photoUrl = signed?.signedUrl ?? null;
	}

	return {
		member,
		photoUrl,
		isSelf,
		canEditMaster,
		canManageRoles: permissions.includes('manage_roles'),
		canDelete: permissions.includes('delete_member'),
		allAemter: (amtRes.data ?? []) as AmtOption[],
		memberAmtIds: member.member_amt.map((x) => x.amt_id)
	};
};
