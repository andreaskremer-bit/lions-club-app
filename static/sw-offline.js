// Wird per `importScripts` in die generierte sw.js eingebunden (s. vite.config.ts)
// und legt beim Installieren des Service Workers die Offline-Fallback-Seite ab.
//
// Warum NICHT über den Workbox-Precache?
//   1. @vite-pwa/sveltekit schneidet in seiner manifestTransform JEDER `.html`-Datei
//      die Endung ab (gedacht für prerenderte SvelteKit-Seiten). Aus `offline.html`
//      würde die Precache-URL `/offline` — ob die auf Netlify wirklich ausgeliefert
//      wird, hängt an dessen Pretty-URL-Verhalten.
//   2. Scheitert im Precache EIN Request, schlägt die ganze Installation fehl und
//      der neue Service Worker wird nie aktiv. Diese Nebensache darf das nicht können.
// Deshalb: eigener Mini-Cache, eigener Fetch, Fehler werden geschluckt.
//
// Der Body wird bewusst in eine NEUE Response umgepackt statt die Antwort direkt
// abzulegen: Netlify kann `/offline.html` auf `/offline` umleiten, und eine
// Response mit `redirected: true` lässt sich nicht als Antwort auf eine
// Navigation zurückgeben ("a redirected response was used for a request whose
// redirect mode is not follow"). Frisch gebaut ist sie garantiert sauber.

// Muss zu OFFLINE_SHELL_CACHE / OFFLINE_FALLBACK_URL in src/lib/offlineCache.ts passen.
const LIONS_OFFLINE_CACHE = 'lions-offline-shell';
const LIONS_OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
	event.waitUntil(
		(async () => {
			try {
				const res = await fetch(LIONS_OFFLINE_URL, { cache: 'reload' });
				if (!res.ok) return;
				const body = await res.text();
				const cache = await caches.open(LIONS_OFFLINE_CACHE);
				await cache.put(
					LIONS_OFFLINE_URL,
					new Response(body, {
						status: 200,
						headers: { 'Content-Type': 'text/html; charset=utf-8' }
					})
				);
			} catch {
				// Kein Netz beim Update o. Ä. — der alte Eintrag bleibt einfach liegen.
			}
		})()
	);
});
