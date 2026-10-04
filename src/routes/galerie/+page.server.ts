import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

/**
 * Galerie-Link nur an Clubmitglieder. Der Drive-Ordner ist „Jeder mit Link“ freigegeben,
 * der Link ist also selbst der Schlüssel – deshalb liegt er in einer PRIVATEN Env-Variable.
 * Als `PUBLIC_*` stand er im Bootstrap-Skript jeder Seite (auch /login) und unter
 * /_app/env.js, d. h. für jeden ohne Konto lesbar (Security-Scan 2026-10-04, F3).
 *
 * Eingeloggt reicht nicht: Nur wer ein verknüpftes Mitgliedskonto hat, bekommt den Link
 * (gleiche Grenze wie die RLS-Policies seit 20260803120100).
 */
export const load: PageServerLoad = async ({ locals }) => {
	const galleryUrl = env.GALLERY_URL ?? '';
	if (!galleryUrl) return { galleryUrl: '' };

	const { data: memberId } = await locals.supabase.rpc('current_member_id');
	return { galleryUrl: memberId ? galleryUrl : '' };
};
