import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import {
	OFFLINE_FALLBACK_URL,
	OFFLINE_SHELL_CACHE,
	PAGE_CACHE_NAME,
	PHOTO_CACHE_NAME,
	privateCacheNames,
	deleteDatabaseWithTimeout
} from './offlineCache';

describe('privateCacheNames', () => {
	it('wählt den Fotocache aus', () => {
		expect(privateCacheNames([PHOTO_CACHE_NAME])).toEqual([PHOTO_CACHE_NAME]);
	});

	it('wählt den Seiten-Cache aus (enthält gerendertes HTML mit Personendaten)', () => {
		expect(privateCacheNames([PAGE_CACHE_NAME])).toEqual([PAGE_CACHE_NAME]);
	});

	it('lässt den Workbox-Precache (App-Shell) stehen', () => {
		const names = [
			'workbox-precache-v2-https://app.lions-bonn-rheinaue.de/',
			PHOTO_CACHE_NAME,
			PAGE_CACHE_NAME
		];
		expect(privateCacheNames(names)).toEqual([PHOTO_CACHE_NAME, PAGE_CACHE_NAME]);
	});

	it('kommt mit leerer Cache-Liste klar', () => {
		expect(privateCacheNames([])).toEqual([]);
	});
});

// URL und Cache-Name der Offline-Seite stehen in drei Dateien, die nichts
// voneinander wissen: static/offline.html (Inhalt), static/sw-offline.js (legt
// sie beim Install ab) und vite.config.ts (holt sie im Fehlerfall). In den
// beiden Service-Worker-Dateien MÜSSEN es Literale sein – sw-offline.js läuft
// ohne Bundler, und workbox-build serialisiert die Callbacks aus vite.config.ts
// per toString() und verliert dabei jeden Modul-Import. Dieser Test hält die
// drei Stellen an dieser Konstante zusammen.
describe('Offline-Fallback', () => {
	it('liegt als statische Datei im Build-Input', () => {
		expect(existsSync(`static${OFFLINE_FALLBACK_URL}`)).toBe(true);
	});

	it('wird beim Install unter genau dieser URL und in diesem Cache abgelegt', () => {
		const sw = readFileSync('static/sw-offline.js', 'utf8');
		expect(sw).toContain(`'${OFFLINE_SHELL_CACHE}'`);
		expect(sw).toContain(`'${OFFLINE_FALLBACK_URL}'`);
	});

	it('wird im Fehlerfall aus genau diesem Cache geholt', () => {
		const config = readFileSync('vite.config.ts', 'utf8');
		expect(config).toContain(`caches.open('${OFFLINE_SHELL_CACHE}')`);
		expect(config).toContain(`.match('${OFFLINE_FALLBACK_URL}')`);
	});
});

/** Minimaler IDBOpenDBRequest-Ersatz: merkt sich die Handler des Aufrufers. */
function fakeFactory() {
	const req: Record<string, (() => void) | null> = {
		onsuccess: null,
		onerror: null,
		onblocked: null
	};
	return {
		req,
		factory: { deleteDatabase: () => req } as unknown as IDBFactory
	};
}

describe('deleteDatabaseWithTimeout', () => {
	it('löst bei Erfolg auf', async () => {
		const { req, factory } = fakeFactory();
		const p = deleteDatabaseWithTimeout(factory, 'db');
		req.onsuccess?.();
		await expect(p).resolves.toBeUndefined();
	});

	it('löst auch auf, wenn die Löschung blockiert ist', async () => {
		const { req, factory } = fakeFactory();
		const p = deleteDatabaseWithTimeout(factory, 'db');
		req.onblocked?.();
		await expect(p).resolves.toBeUndefined();
	});

	it('läuft nach dem Timeout weiter, wenn gar kein Event kommt', async () => {
		vi.useFakeTimers();
		try {
			const { factory } = fakeFactory();
			let settled = false;
			const p = deleteDatabaseWithTimeout(factory, 'db', 1000).then(() => {
				settled = true;
			});
			await vi.advanceTimersByTimeAsync(999);
			expect(settled).toBe(false);
			await vi.advanceTimersByTimeAsync(1);
			await p;
			expect(settled).toBe(true);
		} finally {
			vi.useRealTimers();
		}
	});

	it('schluckt einen werfenden deleteDatabase-Aufruf', async () => {
		const factory = {
			deleteDatabase: () => {
				throw new Error('SecurityError');
			}
		} as unknown as IDBFactory;
		await expect(deleteDatabaseWithTimeout(factory, 'db')).resolves.toBeUndefined();
	});
});
