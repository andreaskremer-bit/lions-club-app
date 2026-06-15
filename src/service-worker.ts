/// <reference lib="webworker" />
//
// Custom Service Worker (vite-pwa injectManifest-Strategie). Liefert dreierlei:
//   1. Offline-Shell: Workbox-Precaching der gebauten Assets + Offline-Fallback.
//   2. Web-Push-Empfang: zeigt Reminder als System-Notification.
//   3. notificationclick: öffnet/fokussiert die App (ggf. Termin-Detail).
//
// @vite-pwa/sveltekit baut auf SvelteKits Service-Worker auf: SvelteKit kompiliert
// diese Datei zu output/client/service-worker.js, dann injiziert Workbox die
// Precache-Liste (self.__WB_MANIFEST). SvelteKits Auto-Registrierung ist in
// vite.config.ts (serviceWorker.register=false) abgeschaltet -> vite-pwa registriert.

import { precacheAndRoute, matchPrecache } from 'workbox-precaching';
import { NavigationRoute, registerRoute, setCatchHandler } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST: Array<{ url: string; revision: string | null }>;
};

const OFFLINE_URL = '/offline.html';

// 1) Build-Assets vorab cachen (Offline-Shell).
precacheAndRoute(self.__WB_MANIFEST);

// Navigationen laufen über das Netz (SSR + Supabase brauchen Verbindung); schlägt das
// fehl, greift der Catch-Handler unten mit der Offline-Seite.
registerRoute(new NavigationRoute(new NetworkOnly()));

setCatchHandler(async ({ request }) => {
	if (request.mode === 'navigate') {
		const fallback = await matchPrecache(OFFLINE_URL);
		if (fallback) return fallback;
	}
	return Response.error();
});

// Sofortige Aktivierung neuer SW-Versionen (passt zu registerType: 'autoUpdate').
self.addEventListener('install', () => {
	self.skipWaiting();
});
self.addEventListener('activate', (event) => {
	event.waitUntil(self.clients.claim());
});

// 2) Push-Empfang: Payload ist JSON { title, body, url, tag }.
self.addEventListener('push', (event) => {
	let payload: { title?: string; body?: string; url?: string; tag?: string };
	try {
		payload = event.data?.json() ?? {};
	} catch {
		payload = { title: event.data?.text() };
	}

	const title = payload.title ?? 'Lions Club Bonn-Rheinaue';
	event.waitUntil(
		self.registration.showNotification(title, {
			body: payload.body,
			tag: payload.tag,
			icon: '/icons/pwa-192.png',
			badge: '/icons/pwa-192.png',
			data: { url: payload.url ?? '/' }
		})
	);
});

// 3) Klick auf die Notification: bestehenden Tab fokussieren oder neuen öffnen.
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const targetUrl = (event.notification.data?.url as string) ?? '/';
	event.waitUntil(
		(async () => {
			const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			for (const client of all) {
				if ('focus' in client) {
					await client.focus();
					if ('navigate' in client) await client.navigate(targetUrl).catch(() => {});
					return;
				}
			}
			await self.clients.openWindow(targetUrl);
		})()
	);
});
