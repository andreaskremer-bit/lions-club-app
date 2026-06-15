// Web-Push-Helfer (clientseitig). Reine Funktionen ohne Browser-APIs sind hier
// gekapselt, damit sie unit-testbar bleiben (siehe push.test.ts).

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
