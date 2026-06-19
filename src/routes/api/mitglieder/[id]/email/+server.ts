import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import { lionsStartYear } from '$lib/dates';
import type { RequestHandler } from './$types';

/**
 * Ändert die E-Mail eines Mitglieds und hält die Login-Adresse (auth.users) synchron.
 * Clientseitig nicht möglich (auth.users braucht die Admin-API / Service-Key).
 * Nur mit `edit_member_master`; Service-Key bleibt serverseitig.
 */
export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	const { user } = await locals.safeGetSession();
	if (!user) throw error(401, 'Nicht angemeldet');

	// Berechtigung des Aufrufers prüfen (als Nutzer über RLS) — nur Ämter des aktuellen LJ.
	const { data: meData } = await locals.supabase
		.from('member')
		.select('member_amt(amt(amt_permission(permission)))')
		.eq('user_id', user.id)
		.eq('member_amt.lions_year', lionsStartYear(new Date()))
		.maybeSingle();
	const me = meData as {
		member_amt: { amt: { amt_permission: { permission: string }[] } | null }[];
	} | null;
	const perms = new Set<string>();
	for (const ma of me?.member_amt ?? []) {
		for (const p of ma.amt?.amt_permission ?? []) perms.add(p.permission);
	}
	if (!perms.has('edit_member_master')) throw error(403, 'Keine Berechtigung');

	const body = await request.json().catch(() => ({}));
	const email = String(body?.email ?? '').trim();
	if (!email || !email.includes('@')) throw error(400, 'Ungültige E-Mail.');

	// Ziel-Mitglied laden.
	const { data: member } = await locals.supabase
		.from('member')
		.select('email, user_id')
		.eq('id', params.id)
		.maybeSingle();
	if (!member) throw error(404, 'Mitglied nicht gefunden');

	if (email.toLowerCase() === member.email.toLowerCase()) return json({ status: 'unverändert' });

	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) throw error(500, 'Service-Key nicht konfiguriert (SUPABASE_SERVICE_ROLE_KEY).');
	const admin = createClient(PUBLIC_SUPABASE_URL, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	// 1. Login-Adresse zuerst (häufigster Fehlerfall: Kollision in auth.users).
	if (member.user_id) {
		const { error: authErr } = await admin.auth.admin.updateUserById(member.user_id, {
			email,
			email_confirm: true
		});
		if (authErr) throw error(409, 'Login-Adresse ändern fehlgeschlagen: ' + authErr.message);
	}

	// 2. Verzeichnis-Adresse. Bei Kollision (member_email_unique) die Login-Adresse
	//    zurückrollen, damit beide nicht auseinanderlaufen.
	const { error: updErr } = await admin.from('member').update({ email }).eq('id', params.id);
	if (updErr) {
		if (member.user_id) {
			await admin.auth.admin.updateUserById(member.user_id, {
				email: member.email,
				email_confirm: true
			});
		}
		const msg = updErr.message.includes('member_email_unique')
			? 'Diese E-Mail ist bereits vergeben.'
			: updErr.message;
		throw error(409, msg);
	}

	return json({ status: 'aktualisiert' });
};
