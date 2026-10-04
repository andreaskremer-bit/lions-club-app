import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Löscht ein Mitglied vollständig: Datensatz, Profilfotos und Login-Konto (DSGVO –
 * Ausgeschiedene werden gelöscht, nicht archiviert). Vorher blieben Fotos im Bucket und
 * das Konto in auth.users zurück.
 *
 * Reihenfolge: Erst löscht die SITZUNG des Aufrufers die member-Zeile – damit entscheidet
 * die RLS-Policy `member_delete_privileged` (delete_member im aktuellen Lions-Jahr), ob er
 * das darf. Erst danach räumt der Service-Key Fotos und Konto ab.
 */
export const DELETE: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Nicht angemeldet');

	const { data: member } = await locals.supabase
		.from('member')
		.select('id, user_id')
		.eq('id', params.id)
		.maybeSingle();
	if (!member) throw error(404, 'Mitglied nicht gefunden');
	if (member.user_id === user.id)
		throw error(400, 'Das eigene Konto lässt sich hier nicht löschen.');

	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) throw error(500, 'Service-Key nicht konfiguriert (SUPABASE_SERVICE_ROLE_KEY).');

	// Als Nutzer löschen: RLS prüft das Recht. Ohne Recht löscht PostgREST still 0 Zeilen.
	const { data: deleted, error: delErr } = await locals.supabase
		.from('member')
		.delete()
		.eq('id', member.id)
		.select('id');
	if (delErr) throw error(400, 'Löschen fehlgeschlagen: ' + delErr.message);
	if (!deleted?.length) throw error(403, 'Keine Berechtigung');

	const admin = createClient(PUBLIC_SUPABASE_URL, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	// Alle Fotos im Ordner des Mitglieds (aktuelles und ggf. frühere).
	const problems: string[] = [];
	const { data: files, error: listErr } = await admin.storage
		.from('member-photos')
		.list(member.id, { limit: 1000 });
	if (listErr) problems.push('Fotos: ' + listErr.message);
	else if (files.length) {
		const { error: rmErr } = await admin.storage
			.from('member-photos')
			.remove(files.map((f) => `${member.id}/${f.name}`));
		if (rmErr) problems.push('Fotos: ' + rmErr.message);
	}

	if (member.user_id) {
		const { error: authErr } = await admin.auth.admin.deleteUser(member.user_id);
		if (authErr) problems.push('Login-Konto: ' + authErr.message);
	}

	return json({ status: 'geloescht', problems });
};
