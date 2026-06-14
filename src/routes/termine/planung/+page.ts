import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { permissions } = await parent();
	// Termine anlegen/planen: nur mit manage_events (Präsident/Vize/Clubmaster/Sekretär).
	if (!permissions.includes('manage_events')) throw redirect(303, '/termine');
	return {};
};
