// Web-Push-Helfer (clientseitig). Reine Funktionen ohne Browser-APIs sind hier
// gekapselt, damit sie unit-testbar bleiben (siehe push.test.ts).

import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Wandelt einen base64url-kodierten VAPID-Public-Key in das `Uint8Array`-Format um,
 * das `pushManager.subscribe({ applicationServerKey })` erwartet.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const raw = atob(base64);
	const output = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
	return output;
}

/** Browser-Fähigkeit: Service Worker + Push + Notification vorhanden? */
export function pushSupported(): boolean {
	return (
		typeof window !== 'undefined' &&
		'serviceWorker' in navigator &&
		'PushManager' in window &&
		'Notification' in window
	);
}

/**
 * Extrahiert die für die Server-Speicherung nötigen Felder aus einer
 * `PushSubscription` (Endpoint + p256dh/auth-Schlüssel als base64url).
 */
export function subscriptionToRow(sub: PushSubscription): {
	endpoint: string;
	p256dh: string;
	auth: string;
} {
	const json = sub.toJSON();
	return {
		endpoint: sub.endpoint,
		p256dh: json.keys?.p256dh ?? '',
		auth: json.keys?.auth ?? ''
	};
}

/** Aktuelles Push-Abo dieses Geräts oder null (ohne auf einen aktiven SW zu warten). */
async function currentSubscription(): Promise<PushSubscription | null> {
	if (!pushSupported()) return null;
	const reg = await navigator.serviceWorker.getRegistration();
	return reg ? await reg.pushManager.getSubscription() : null;
}

/**
 * Beim Abmelden: Push-Abo des Geräts beenden. Muss VOR `auth.signOut()` laufen, weil
 * das Löschen der `push_subscription`-Zeile noch die Sitzung braucht (RLS: nur eigene).
 * Sonst bekäme das Gerät nach dem Logout weiter die Benachrichtigungen des Mitglieds –
 * auf einem geteilten Gerät sieht sie die nächste Person. Fehler blockieren den Logout nie.
 */
export async function releasePushOnSignOut(supabase: SupabaseClient): Promise<void> {
	try {
		const sub = await currentSubscription();
		if (!sub) return;
		await supabase.from('push_subscription').delete().eq('endpoint', sub.endpoint);
		await sub.unsubscribe();
	} catch (e) {
		console.error('Push-Abmeldung beim Logout fehlgeschlagen:', e);
	}
}

/**
 * Nach der Anmeldung: Ein Push-Abo, das nicht zum angemeldeten Mitglied gehört (anderes
 * Konto auf demselben Gerät, oder Sitzung ohne Logout abgelaufen), wird gekündigt. Die
 * Zeile ist per RLS nur für das eigene Konto sichtbar – fehlt sie, ist das Abo fremd.
 * Der Push-Dienst meldet den Endpoint danach als ungültig, `send-notifications` räumt
 * die alte Zeile dann selbst ab (404/410).
 */
export async function releaseForeignPush(supabase: SupabaseClient): Promise<void> {
	try {
		const sub = await currentSubscription();
		if (!sub) return;
		const { data, error } = await supabase
			.from('push_subscription')
			.select('endpoint')
			.eq('endpoint', sub.endpoint)
			.maybeSingle();
		if (error) return;
		if (!data) await sub.unsubscribe();
	} catch (e) {
		console.error('Prüfung des Push-Abos nach dem Login fehlgeschlagen:', e);
	}
}
