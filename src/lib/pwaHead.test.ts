import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Sperre gegen einen Rückfall, der bis 2026-11-05 unbemerkt live war: Die Seiten
// verwiesen nicht auf das Web-App-Manifest. iOS übernahm deshalb beim „Zum
// Home-Bildschirm“ die gerade offene Adresse als feste Startadresse des Icons
// (ein Mitglied startete so jedes Mal auf einer alten Termin-Detailseite).
// @vite-pwa/sveltekit setzt den Verweis NICHT selbst – er steht von Hand in app.html.

const appHtml = readFileSync(new URL('../app.html', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../../vite.config.ts', import.meta.url), 'utf8');

describe('PWA-Kopf in app.html', () => {
	it('verweist auf das Manifest', () => {
		expect(appHtml).toMatch(/<link rel="manifest" href="\/manifest\.webmanifest" \/>/);
	});

	it('schlägt auf iOS und Android denselben Icon-Namen vor', () => {
		const ios = /<meta name="apple-mobile-web-app-title" content="([^"]+)" \/>/.exec(appHtml)?.[1];
		const manifest = /short_name: '([^']+)'/.exec(viteConfig)?.[1];
		expect(ios).toBe('Club-App');
		expect(manifest).toBe(ios);
	});

	it('das Manifest startet auf der Startseite als eigenständige App', () => {
		expect(viteConfig).toMatch(/start_url: '\/'/);
		expect(viteConfig).toMatch(/display: 'standalone'/);
	});
});
