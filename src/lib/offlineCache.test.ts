import { describe, it, expect, vi } from 'vitest';
import { PHOTO_CACHE_NAME, privateCacheNames, deleteDatabaseWithTimeout } from './offlineCache';

describe('privateCacheNames', () => {
	it('wählt den Fotocache aus', () => {
		expect(privateCacheNames([PHOTO_CACHE_NAME])).toEqual([PHOTO_CACHE_NAME]);
	});

	it('lässt den Workbox-Precache (App-Shell) stehen', () => {
		const names = ['workbox-precache-v2-https://app.lions-bonn-rheinaue.de/', PHOTO_CACHE_NAME];
		expect(privateCacheNames(names)).toEqual([PHOTO_CACHE_NAME]);
	});

	it('kommt mit leerer Cache-Liste klar', () => {
		expect(privateCacheNames([])).toEqual([]);
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
