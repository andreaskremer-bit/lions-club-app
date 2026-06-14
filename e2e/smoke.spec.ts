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
