import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { PAGE_CACHE_NAME, PHOTO_CACHE_NAME } from './src/lib/offlineCache';

// Inhalts-Hash der Offline-Seite und ihres Install-Skripts.
//
// WARUM: `static/offline.html` liegt bewusst NICHT im Workbox-Precache (s. u.),
// taucht also im Precache-Manifest der `sw.js` nicht auf. Ohne diesen Hash wäre
// die generierte `sw.js` nach einer reinen Textänderung an der Offline-Seite
// BYTEGLEICH — der Browser sähe kein Update, der `install`-Handler liefe nie
// wieder, und die alte Fassung bliebe für immer im Cache. Der Hash hängt am
// `importScripts`-Eintrag und landet damit wörtlich in der `sw.js`: neue Seite
// → neue `sw.js` → SW-Update → `install` holt die Seite frisch.
const offlineRevision = createHash('sha256')
	.update(readFileSync('static/offline.html'))
	.update(readFileSync('static/sw-offline.js'))
	.digest('hex')
	.slice(0, 8);

// ---------------------------------------------------------------------------
// Versionskennung der ausgelieferten App (Anzeige unter /mehr → Version).
//
// CalVer statt SemVer: „Breaking Change für API-Konsumenten?" fragt hier
// niemand — die einzige real gestellte Frage ist „habe ich den aktuellen
// Stand?". Genau die ist bei einer PWA mit Service Worker nicht rhetorisch,
// weil ein Gerät durchaus tagelang eine ältere Shell fahren kann.
//
// Beide Werte entstehen zur BUILD-Zeit aus Git. Bewusst nichts von Hand
// gepflegtes (auch nicht `package.json.version`): eine Nummer, die jemand
// bumpen muss, ist nach drei Wochen falsch — und eine falsche Nummer ist
// schlechter als gar keine.
function gitOutput(cmd: string): string | null {
	try {
		return (
			execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] })
				.toString()
				.trim() || null
		);
	} catch {
		return null;
	}
}

/** `2026.08.04` — Datum in Europe/Berlin, damit ein Nacht-Deploy (Netlify baut
 *  in UTC) nicht auf den Vortag datiert wird. */
function berlinDate(d: Date): string {
	const parts = new Intl.DateTimeFormat('de-DE', {
		timeZone: 'Europe/Berlin',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).formatToParts(d);
	const at = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
	return `${at('year')}.${at('month')}.${at('day')}`;
}

// Commit-Datum statt Build-Datum: reproduzierbar (ein Re-Deploy desselben
// Commits ergibt dieselbe Nummer) und beschreibt den Stand des Codes, nicht
// den Zeitpunkt der Auslieferung. Fallback = Build-Zeit, falls kein Git da ist.
const commitIso = gitOutput('git log -1 --format=%cI');
const appVersion = berlinDate(commitIso ? new Date(commitIso) : new Date());
// Netlifys COMMIT_REF als Rückfalloption, falls der Build ohne .git läuft.
const appCommit =
	gitOutput('git rev-parse --short=7 HEAD') ?? process.env.COMMIT_REF?.slice(0, 7) ?? 'dev';

export default defineConfig({
	// Typen für beide Globals stehen in src/app.d.ts, gelesen werden sie nur in
	// src/lib/version.ts.
	define: {
		__APP_VERSION__: JSON.stringify(appVersion),
		__APP_COMMIT__: JSON.stringify(appCommit)
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Netlify deployment (DPF-zertifiziert); personenbezogene Daten möglichst client -> Supabase.
			adapter: adapter()
		}),
		// PWA mit Web-Push + Offline-Asset-Caching (M5).
		// generateSW (Default): vite-pwa erzeugt den Service Worker selbst — KEINE
		// Abhängigkeit vom SvelteKit-SW-Build (dessen injectManifest-Kopplung unter
		// rolldown-vite 8 auf Netlify im closeBundle scheiterte: swSrc ENOENT).
		// Push-/notificationclick-Handler kommen via importScripts aus static/sw-push.js.
		SvelteKitPWA({
			registerType: 'autoUpdate',
			workbox: {
				// Workbox-Runtime IN die sw.js schreiben statt per `define()`/importScripts
				// nachzuladen: im AMD-Wrapper läuft die Factory erst in einem Microtask,
				// Workbox registriert seinen `fetch`-Listener dann NICHT während der
				// initialen Auswertung des Worker-Skripts — der Browser wertet den SW
				// daraufhin als „ohne Fetch-Handler" und umgeht ihn bei Requests.
				// Ohne dieses Flag greift `runtimeCaching` schlicht nicht.
				inlineWorkboxRuntime: true,
				// Build-Assets inkl. self-hosted Fonts vorab cachen (Offline-Shell).
				// BEWUSST OHNE `html`: @vite-pwa/sveltekit schneidet in seiner
				// manifestTransform jeder `.html`-Datei die Endung ab (gedacht für
				// prerenderte Seiten) — `static/offline.html` läge dann unter der URL
				// `/offline` im Precache, und ein Fehlschlag beim Holen würde die
				// GESAMTE Installation kippen. Die Offline-Seite cacht deshalb
				// `static/sw-offline.js` selbst. Der Client-Output enthält sonst keine
				// HTML-Dateien (prerenderte Seiten kämen aus `prerendered/**`).
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,webmanifest}'],
				importScripts: ['sw-push.js', `sw-offline.js?v=${offlineRevision}`],
				cleanupOutdatedCaches: true,
				// KEIN `navigateFallback`: vite-pwa würde daraus `createHandlerBoundToURL('/')`
				// bauen, aber `/` liegt nicht im Precache (die App wird nicht prerendert,
				// SSR läuft auf Netlify). Das warf beim SW-Start `non-precached-url` und
				// brach die Registrierung der NACHFOLGENDEN Routen ab — im alten AMD-Build
				// unsichtbar, weil der Fehler in einer Promise verschwand.
				// Der Offline-Start läuft stattdessen über die Navigations-Route unten:
				// erst Netz, dann zuletzt besuchte Seite, dann `/offline.html`.
				navigateFallback: null,
				// ACHTUNG bei allen Callbacks hier drin: workbox-build schreibt sie per
				// `Function.prototype.toString()` in die sw.js. Sie dürfen deshalb NICHTS
				// aus diesem Modul-Scope benutzen — importierte Konstanten stehen im
				// Service Worker nicht zur Verfügung. Nur `cacheName` & Co. sind normale
				// Werte, die beim Build ausgewertet werden.
				runtimeCaching: [
					// Stufe 3 des Caching-Stufenplans: Seitenaufrufe (Navigationen).
					// NetworkFirst BEWUSST ohne `networkTimeoutSeconds` — solange das Netz
					// antwortet, sieht man immer den frischen SSR-Stand. Erst wenn der
					// Request scheitert, kommt die zuletzt besuchte Fassung, und wenn auch
					// die fehlt, die statische Offline-Seite.
					{
						urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: PAGE_CACHE_NAME,
							// Kurzlebig: das HTML verweist auf gehashte Assets, die nach einem
							// Deploy nicht mehr existieren. Nur als Notnagel fürs Funkloch.
							expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 },
							plugins: [
								{
									cacheWillUpdate: async ({
										request,
										response
									}: {
										request: Request;
										response: Response;
									}) => {
										// `redirected` NICHT cachen: ohne Session antwortet der Server
										// mit 303 auf /login, fetch folgt und liefert die Login-Seite
										// unter der ursprünglichen URL. Aus dem Cache zurückgegeben
										// bricht so eine Antwort die Navigation ab ("a redirected
										// response was used for a request whose redirect mode is not
										// follow") — und sie gehört ohnehin nicht zu dieser URL.
										if (!response || response.status !== 200 || response.redirected) return null;
										// Die Login-Seite ist offline nutzlos (der Code kommt per Mail)
										// und soll den Platz nicht belegen.
										if (new URL(request.url).pathname.startsWith('/login')) return null;
										return response;
									},
									// Netz weg UND kein Cache-Treffer: statt der Browser-Fehlerseite
									// die Offline-Seite, die `static/sw-offline.js` beim Installieren
									// abgelegt hat. Namen müssen zu OFFLINE_SHELL_CACHE /
									// OFFLINE_FALLBACK_URL in src/lib/offlineCache.ts passen.
									handlerDidError: async () =>
										(await (await caches.open('lions-offline-shell')).match('/offline.html')) ??
										undefined
								}
							]
						}
					},
					// Stufe 1 des Caching-Stufenplans: Mitgliederfotos aus dem privaten
					// Storage-Bucket `member-photos`. CacheFirst ist hier unkritisch, weil
					// jedes neue Foto unter einem NEUEN Pfad landet (`avatar_<timestamp>.<ext>`)
					// — ein Bildwechsel erzeugt also einen Cache-Miss statt eines alten Bilds.
					{
						// ACHTUNG: KEIN RegExp verwenden — Workbox wendet RegExp-Muster auf
						// Cross-Origin-Requests nur an, wenn sie den URL-ANFANG matchen. Die
						// Fotos liegen auf einem fremden Origin (Supabase-Storage, lokal
						// 127.0.0.1:54321), ein Muster ab `/storage/...` greift dort nie.
						// Der Callback prüft den Pfad und bleibt origin-unabhängig.
						urlPattern: ({ url }: { url: URL }) =>
							url.pathname.startsWith('/storage/v1/object/sign/member-photos/'),
						handler: 'CacheFirst',
						options: {
							cacheName: PHOTO_CACHE_NAME,
							// Signierte URLs tragen ein bei JEDEM Aufruf neues Token im
							// Query-String. Ohne Normalisierung wäre jede Sitzung ein
							// Cache-Miss und der Cache liefe voll — deshalb Cache-Key ohne Query.
							plugins: [
								{
									cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
										const url = new URL(request.url);
										return url.origin + url.pathname;
									}
								}
							],
							// 35 Mitglieder + Reserve; ~30 Tage, danach frisch ziehen.
							expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
							cacheableResponse: { statuses: [200] }
						}
					}
				]
			},
			// Service Worker auch im Dev-Server aktiv (für lokales Push-Testen).
			devOptions: { enabled: true, type: 'classic' },
			manifest: {
				name: 'Lions Club Bonn-Rheinaue',
				short_name: 'Lions BN-Rheinaue',
				description: 'Clubverwaltung des Lions Club Bonn-Rheinaue',
				lang: 'de',
				dir: 'ltr',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#F6F1E7',
				theme_color: '#1E4FA3',
				icons: [
					{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/icons/pwa-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	],
	test: {
		// Reine Unit-Tests (Pure-Funktionen ohne SvelteKit-/DOM-Abhängigkeiten).
		// Edge-Function-Tests laufen mit: `email.ts` greift nur noch guarded auf
		// `Deno` zu, damit der Import unter Node nicht scheitert.
		include: ['src/**/*.{test,spec}.{js,ts}', 'supabase/functions/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	}
});
