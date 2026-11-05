import { expect, test } from '@playwright/test';

// Smoke-Tests ohne Anmeldung: Auth-Guard + Login-Seite. Brauchen kein Supabase-Backend
// (der Guard leitet ohne Session-Cookie um, bevor ein Netzwerkaufruf nötig ist).

test('nicht eingeloggt -> Weiterleitung auf /login', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveURL(/\/login$/);
	await expect(page.getByText('Willkommen zurück')).toBeVisible();
});

test('Login-Seite zeigt das E-Mail-Feld', async ({ page }) => {
	await page.goto('/login');
	await expect(page.getByLabel('E-Mail')).toBeVisible();
});

test('Seiten verweisen auf ein gültiges Web-App-Manifest', async ({ page, request }) => {
	await page.goto('/login');
	const href = await page.locator('link[rel="manifest"]').getAttribute('href');
	expect(href).toBe('/manifest.webmanifest');
	const res = await request.get(href!);
	expect(res.ok()).toBe(true);
	const manifest = await res.json();
	expect(manifest.start_url).toBe('/');
	expect(manifest.display).toBe('standalone');
});
