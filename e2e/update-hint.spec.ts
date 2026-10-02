import { expect, test } from '@playwright/test';

// Versions-Erkennung im laufenden Client (kit.version in vite.config.ts + Root-Layout).
// Die Route hier tauscht `_app/version.json` gegen eine fremde Version aus; dann muss
// SvelteKit `updated.current` setzen und das Root-Layout den Hinweis mit dem
// Neu-laden-Button zeigen. Braucht keine Anmeldung: Der Hinweis gilt auch auf /login.
//
// ACHTUNG: Im Dev-Server ist `updated.check()` in SvelteKit ein No-op und
// `_app/version.json` existiert nicht. Der Test läuft deshalb nur gegen einen
// Produktions-Build und überspringt sich sonst selbst:
//   npm run build && npx vite preview --port 5173 --strictPort
//   npx playwright test e2e/update-hint.spec.ts
test('neue Version -> Hinweis „Neue Version verfügbar“', async ({ page }) => {
	const versionFile = await page.request.get('/_app/version.json');
	test.skip(
		!versionFile.ok() || !versionFile.headers()['content-type']?.includes('json'),
		'nur gegen einen Produktions-Build (vite preview) prüfbar, nicht im Dev-Server'
	);

	await page.goto('/login');
	await expect(page.getByLabel('E-Mail')).toBeVisible();
	await expect(page.getByText('Neue Version verfügbar')).toHaveCount(0);

	await page.route('**/_app/version.json', (route) =>
		route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({ version: 'andere-version' })
		})
	);

	// Sichtbarkeitswechsel löst die Sofort-Prüfung aus (statt auf den Poll zu warten).
	await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

	await expect(page.getByText('Neue Version verfügbar')).toBeVisible();
	await expect(page.getByRole('button', { name: 'Jetzt neu laden' })).toBeVisible();

	// „Später“ blendet den Hinweis aus, ohne die Seite neu zu laden.
	await page.getByRole('button', { name: 'Später' }).click();
	await expect(page.getByText('Neue Version verfügbar')).toHaveCount(0);
	await expect(page.getByLabel('E-Mail')).toBeVisible();
});
