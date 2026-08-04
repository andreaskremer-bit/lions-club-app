import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { PHOTO_CACHE_NAME } from './src/lib/offlineCache';

export default defineConfig({
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
				globPatterns: ['client/**/*.{js,css,html,ico,png,svg,webp,woff,woff2,webmanifest}'],
				importScripts: ['sw-push.js'],
				cleanupOutdatedCaches: true,
				// KEIN Navigations-Fallback: vite-pwa würde `createHandlerBoundToURL('/')`
				// registrieren, aber `/` liegt nicht im Precache (die App wird nicht
				// prerendert, SSR läuft auf Netlify). Das warf beim SW-Start
				// `non-precached-url` und brach die Registrierung der NACHFOLGENDEN
				// Routen ab — im alten AMD-Build unsichtbar, weil der Fehler in einer
				// Promise verschwand. Ein echter Offline-Start kommt in Stufe 3 des
				// Caching-Plans (NetworkFirst + eigene Fallback-Seite im Precache).
				navigateFallback: null,
				// Stufe 1 des Caching-Stufenplans: Mitgliederfotos aus dem privaten
				// Storage-Bucket `member-photos`. CacheFirst ist hier unkritisch, weil
				// jedes neue Foto unter einem NEUEN Pfad landet (`avatar_<timestamp>.<ext>`)
				// — ein Bildwechsel erzeugt also einen Cache-Miss statt eines alten Bilds.
				runtimeCaching: [
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
