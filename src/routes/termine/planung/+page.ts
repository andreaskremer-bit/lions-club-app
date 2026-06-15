import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { supabase, permissions } = await parent();
	// Termine anlegen/planen: nur mit manage_events (Präsident/Vize/Clubmaster/Sekretär).
	if (!permissions.includes('manage_events')) throw redirect(303, '/termine');

	// Vereinslokal als Default-Ort für Clubabend/MV.
	const { data: venue } = await supabase
		.from('club_venue')
		.select('name, street, zip, city')
		.eq('id', 1)
		.maybeSingle();
	const parts = venue
		? [venue.name, venue.street, [venue.zip, venue.city].filter(Boolean).join(' ')]
				.filter(Boolean)
				.join(', ')
		: '';
	return { venueLocation: parts };
};
