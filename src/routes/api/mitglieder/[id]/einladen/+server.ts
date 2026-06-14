import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Lädt ein Mitglied ein = legt ein Auth-Konto an (kein Self-Signup), damit es sich
 * per E-Mail-OTP einloggen kann. Der on_auth_user_created-Trigger verknüpft das Konto
 * automatisch per E-Mail mit der member-Zeile. Nur mit manage_members; Service-Key
 * bleibt serverseitig.
 */
export const POST: RequestHandler = async ({ locals, params }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Nicht angemeldet');

	// Berechtigung des Aufrufers prüfen (als Nutzer über RLS).
	const { data: meData } = await locals.supabase
		.from('member')
		.select('member_amt(amt(amt_permission(permission)))')
		.eq('user_id', user.id)
		.maybeSingle();
	const me = meData as {
		member_amt: { amt: { amt_permission: { permission: string }[] } | null }[];
	} | null;
	const perms = new Set<string>();
	for (const ma of me?.member_amt ?? []) {
		for (const p of ma.amt?.amt_permission ?? []) perms.add(p.permission);
	}
	if (!perms.has('manage_members')) throw error(403, 'Keine Berechtigung');

	// Ziel-Mitglied laden.
	const { data: member } = await locals.supabase
		.from('member')
		.select('email, user_id')
		.eq('id', params.id)
		.maybeSingle();
	if (!member) throw error(404, 'Mitglied nicht gefunden');
	if (member.user_id) return json({ status: 'bereits_eingeladen' });

	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) throw error(500, 'Service-Key nicht konfiguriert (SUPABASE_SERVICE_ROLE_KEY).');

	const admin = createClient(PUBLIC_SUPABASE_URL, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	const { error: createErr } = await admin.auth.admin.createUser({
		email: member.email,
		email_confirm: true
	});
	if (createErr) throw error(400, 'Einladen fehlgeschlagen: ' + createErr.message);

	return json({ status: 'eingeladen' });
};
