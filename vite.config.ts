import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

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
				// Build-Assets inkl. self-hosted Fonts vorab cachen (Offline-Shell).
				globPatterns: ['client/**/*.{js,css,html,ico,png,svg,webp,woff,woff2,webmanifest}'],
				importScripts: ['sw-push.js'],
				cleanupOutdatedCaches: true
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
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	}
});
