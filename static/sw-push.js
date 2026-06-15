// Web-Push-Handler für den Service Worker.
//
// Wird über `workbox.importScripts` in den von vite-pwa (generateSW) erzeugten
// Service Worker eingebunden — bewusst als statische Datei, damit der SW-Build
// NICHT vom SvelteKit-Service-Worker-Build abhängt (das war unter rolldown-vite 8
// auf Netlify nicht zuverlässig). Läuft im SW-Scope, `self` ist verfügbar.

self.addEventListener('push', (event) => {
	let payload;
	try {
		payload = event.data ? event.data.json() : {};
	} catch {
		payload = { title: event.data && event.data.text() };
	}

	const title = payload.title || 'Lions Club Bonn-Rheinaue';
	event.waitUntil(
		self.registration.showNotification(title, {
			body: payload.body,
			tag: payload.tag,
			icon: '/icons/pwa-192.png',
			badge: '/icons/pwa-192.png',
			data: { url: payload.url || '/' }
		})
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const targetUrl = (event.notification.data && event.notification.data.url) || '/';
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
