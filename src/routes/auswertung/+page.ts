import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { AuswMember, AuswEvent } from '$lib/auswertung';

export const load: PageLoad = async ({ parent }) => {
	const { supabase, permissions } = await parent();

	// Geldsicht/Auswertung nur für Schatzmeister (view_donations).
	if (!permissions.includes('view_donations')) throw redirect(303, '/');

	// Anwesenheit lädt die Seite je Lions-Jahr nach (nur die Termine des gewählten Jahres):
	// eine ungefilterte Abfrage liefe sonst in die PostgREST-Grenze von 1000 Zeilen.
	const [membersRes, eventsRes] = await Promise.all([
		supabase
			.from('member')
			// Alle Status: wer inzwischen inaktiv oder Ehrenmitglied ist, behält seine
			// erfassten Abwesenheiten (buildRows filtert).
			.select('id, first_name, last_name, status')
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
