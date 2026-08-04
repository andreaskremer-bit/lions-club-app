// Helfer rund um den Browser-Cache der PWA (Stufen 1 + 3 des Caching-Stufenplans).
//
// Gecacht werden Mitgliederfotos aus dem privaten Storage-Bucket `member-photos`
// (Stufe 1) und die zuletzt besuchten Seiten (Stufe 3). Beides sind
// personenbezogene Daten — deshalb MUSS der Cache beim Ausloggen wieder
// verschwinden (DSGVO), und beim Anmelden ebenfalls, damit auf einem geteilten
// Gerät nichts von der Vorgängerin übrig bleibt. Die Logik ist hier gekapselt
// und unit-testbar (siehe offlineCache.test.ts).

/**
 * Name des Runtime-Caches für Mitgliederfotos.
 * MUSS mit `runtimeCaching[].options.cacheName` in `vite.config.ts` übereinstimmen —
 * dort wird der Name aus genau dieser Konstante importiert.
 */
export const PHOTO_CACHE_NAME = 'lions-member-photos';

/**
 * Name des Runtime-Caches für Seitenaufrufe (Navigationen). Der serverseitig
 * gerenderte HTML-Code enthält die geladenen Daten (Mitglieder, Termine …) —
 * also personenbezogen und ebenfalls beim Ab-/Anmelden zu räumen.
 */
export const PAGE_CACHE_NAME = 'lions-pages';

/**
 * Statische Fallback-Seite aus `static/offline.html` — wird ausgeliefert, wenn
 * eine Navigation weder Netz noch Cache-Treffer hat.
 */
export const OFFLINE_FALLBACK_URL = '/offline.html';

/**
 * Cache, in den `static/sw-offline.js` die Fallback-Seite beim Installieren des
 * Service Workers legt. Enthält KEINE personenbezogenen Daten und bleibt beim
 * Ab-/Anmelden deshalb stehen.
 */
export const OFFLINE_SHELL_CACHE = 'lions-offline-shell';

/** Runtime-Caches mit personenbezogenem Inhalt. */
const PRIVATE_CACHE_NAMES: readonly string[] = [PHOTO_CACHE_NAME, PAGE_CACHE_NAME];

/**
 * Von workbox-expiration angelegte IndexedDB-Datenbank. Sie merkt sich die
 * URLs (inkl. Foto-Pfaden) der gecachten Einträge und wird beim Logout mit
 * geräumt.
 */
const WORKBOX_EXPIRATION_DB = 'workbox-expiration';

/** Caches, die personenbezogene Daten enthalten und beim Ab-/Anmelden fallen. */
export function privateCacheNames(all: readonly string[]): string[] {
	return all.filter((name) => PRIVATE_CACHE_NAMES.includes(name));
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
 * UND direkt nach dem Anmelden aufgerufen (geteiltes Gerät) — der Workbox-Precache
 * (reine App-Shell: JS/CSS/Fonts/Icons/Offline-Seite) bleibt bewusst stehen, damit
 * die App danach nicht komplett neu geladen werden muss.
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
