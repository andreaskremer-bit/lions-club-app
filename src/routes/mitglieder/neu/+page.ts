import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { permissions } = await parent();
	// Neumitglieder anlegen: nur mit manage_members (Sekretär/Webmaster).
	if (!permissions.includes('manage_members')) throw redirect(303, '/mitglieder');
	return {};
};
