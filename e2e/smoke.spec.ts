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

// Sicherheits-Header kommen aus src/hooks.server.ts, die CSP aus der SvelteKit-Option
// `csp` (vite.config.ts). Der Test gilt für beide Betriebsarten der CSP: beobachtend
// (Report-Only) und scharf.
test('Antworten tragen Sicherheits-Header und eine CSP mit Nonce', async ({ request }) => {
	const res = await request.get('/login');
	const h = res.headers();
	expect(h['x-frame-options']).toBe('DENY');
	expect(h['referrer-policy']).toBe('same-origin');
	expect(h['permissions-policy']).toContain('camera=()');
	const csp = h['content-security-policy'] ?? h['content-security-policy-report-only'];
	expect(csp).toMatch(/script-src 'self' 'nonce-[^']+'/);
	expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
	expect(csp).toContain("frame-ancestors 'none'");
});
