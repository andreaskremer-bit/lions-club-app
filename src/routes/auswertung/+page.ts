import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export type AuswMember = { id: string; first_name: string; last_name: string };
export type AuswEvent = { id: string; title: string; starts_at: string };

export const load: PageLoad = async ({ parent }) => {
	const { supabase, permissions } = await parent();

	// Geldsicht/Auswertung nur für Schatzmeister (view_donations).
	if (!permissions.includes('view_donations')) throw redirect(303, '/');

	// Anwesenheit lädt die Seite je Lions-Jahr nach (nur die Termine des gewählten Jahres):
	// eine ungefilterte Abfrage liefe sonst in die PostgREST-Grenze von 1000 Zeilen.
	const [membersRes, eventsRes] = await Promise.all([
		supabase
			.from('member')
			.select('id, first_name, last_name')
			.eq('status', 'aktiv')
			.order('last_name')
			.order('first_name'),
		supabase
			.from('event')
			.select('id, title, starts_at')
			.eq('donation_required', true)
			.order('starts_at')
	]);

	return {
		members: (membersRes.data ?? []) as AuswMember[],
		events: (eventsRes.data ?? []) as AuswEvent[]
	};
};
