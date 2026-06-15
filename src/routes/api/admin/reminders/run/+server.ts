import { json, error } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Manueller Test-Trigger für die Reminder-Engine (nur `manage_members`).
 * Schritt 1: `enqueue_due_reminders()` füllt die Outbox (In-App sofort sichtbar).
 * Schritt 2: ruft optional die Edge Function `send-notifications` für den
 * Außen-Versand (Push/E-Mail) — die respektiert ihrerseits REMINDERS_ARMED (Dry-Run).
 *
 * Sicher in der Geheim-Phase: enqueue erzeugt nur für freigeschaltete Mitglieder
 * (member.notifications_enabled), der Versand ist per Default Dry-Run.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
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

	const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!serviceKey) throw error(500, 'Service-Key nicht konfiguriert (SUPABASE_SERVICE_ROLE_KEY).');

	const admin = createClient(PUBLIC_SUPABASE_URL, serviceKey, {
		auth: { persistSession: false, autoRefreshToken: false }
	});

	// Schritt 1: fällige Reminder erzeugen (idempotent).
	const { error: rpcErr } = await admin.rpc('enqueue_due_reminders');
	if (rpcErr) throw error(500, 'Reminder erzeugen fehlgeschlagen: ' + rpcErr.message);

	// Schritt 2 (optional): Außen-Versand anstoßen. Nur wenn der Aufruf `{ send: true }`
	// schickt. Fehler hier sind nicht fatal (Function evtl. lokal nicht gestartet).
	let send: unknown = 'übersprungen';
	const body = await request.json().catch(() => ({}));
	if (body?.send === true) {
		try {
			const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/send-notifications`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
				body: '{}'
			});
			send = res.ok ? await res.json() : `Function-Fehler (${res.status})`;
		} catch (e) {
			send = 'Function nicht erreichbar: ' + (e as Error).message;
		}
	}

	return json({ status: 'ok', enqueued: true, send });
};
