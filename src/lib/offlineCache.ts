// Helfer rund um den Browser-Cache der PWA (Stufe 1 des Caching-Stufenplans).
//
// Gecacht werden Mitgliederfotos aus dem privaten Storage-Bucket `member-photos`.
// Das sind personenbezogene Daten — deshalb MUSS der Cache beim Ausloggen
// wieder verschwinden (DSGVO). Die Logik ist hier gekapselt und unit-testbar
// (siehe offlineCache.test.ts).

/**
 * Name des Runtime-Caches für Mitgliederfotos.
 * MUSS mit `runtimeCaching[].options.cacheName` in `vite.config.ts` übereinstimmen —
 * dort wird der Name aus genau dieser Konstante importiert.
 */
export const PHOTO_CACHE_NAME = 'lions-member-photos';

/**
 * Von workbox-expiration angelegte IndexedDB-Datenbank. Sie merkt sich die
 * URLs (inkl. Foto-Pfaden) der gecachten Einträge und wird beim Logout mit
 * geräumt.
 */
const WORKBOX_EXPIRATION_DB = 'workbox-expiration';

/** Caches, die personenbezogene Daten enthalten und beim Logout fallen. */
export function privateCacheNames(all: readonly string[]): string[] {
	return all.filter((name) => name === PHOTO_CACHE_NAME);
}

type DeleteDbTarget = Pick<IDBFactory, 'deleteDatabase'>;

/**
 * Löscht eine IndexedDB-Datenbank, ohne hängen zu bleiben: solange der Service
 * Worker noch eine Verbindung offen hält, feuert `blocked` statt `success`.
 * Der Logout darf darauf nicht warten — deshalb Timeout statt Endlos-Promise.
 */
export function deleteDatabaseWithTimeout(
	factory: DeleteDbTarget,
	name: string,
	timeoutMs = 1000
): Promise<void> {
	return new Promise((resolve) => {
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			resolve();
		};
		const timer = setTimeout(finish, timeoutMs);
		const settle = () => {
			clearTimeout(timer);
			finish();
		};
		try {
			const req = factory.deleteDatabase(name);
			req.onsuccess = settle;
			req.onerror = settle;
			req.onblocked = settle;
		} catch {
			settle();
		}
	});
}

/**
 * Räumt alle Browser-Caches mit personenbezogenen Daten ab. Wird beim Ausloggen
 * aufgerufen — der Workbox-Precache (reine App-Shell: JS/CSS/Fonts/Icons) bleibt
 * bewusst stehen, damit die App danach nicht komplett neu geladen werden muss.
 *
 * Fehler werden geschluckt: ein fehlgeschlagener Cache-Wipe darf den Logout
 * niemals blockieren.
 */
export async function clearPrivateCaches(): Promise<void> {
	if (typeof caches === 'undefined') return;
	try {
		const names = await caches.keys();
		await Promise.all(privateCacheNames(names).map((name) => caches.delete(name)));
	} catch {
		// Cache-API nicht verfügbar oder verweigert — Logout läuft trotzdem weiter.
	}
	if (typeof indexedDB === 'undefined') return;
	try {
		await deleteDatabaseWithTimeout(indexedDB, WORKBOX_EXPIRATION_DB);
	} catch {
		// s. o.
	}
}
