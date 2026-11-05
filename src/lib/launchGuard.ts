// Start-Wächter: Ein App-Start vom Homescreen beginnt immer auf der Startseite.
//
// Hintergrund (2026-11-05): Bis zu diesem Datum verwies keine Seite auf das
// Web-App-Manifest. iOS hat deshalb beim „Zum Home-Bildschirm“ die gerade offene
// Adresse als feste Startadresse ins Icon geschrieben – ein Mitglied landete so
// bei jedem App-Start auf einer alten Termin-Detailseite, auch nach Ab- und
// Anmelden. Die Einstellungen eines bestehenden Icons kann eine Website nicht
// ändern (iOS liest das Manifest nur beim Anlegen). Was sie kann: beim Start
// erkennen, dass sie frisch auf einer Unterseite geöffnet wurde, und umleiten.
//
// Die Entscheidung steckt in einer reinen Funktion, damit sie ohne DOM testbar
// bleibt (Vitest läuft mit environment: 'node').

/** sessionStorage-Schlüssel: gesetzt = in dieser App-Sitzung schon gestartet. */
export const LAUNCH_MARK_KEY = 'lions-app-gestartet';

export interface LaunchInfo {
	/** Läuft die App als installierte PWA (siehe `isStandalone()`)? */
	standalone: boolean;
	/**
	 * Gab es in dieser App-Sitzung schon einen Seitenaufruf? sessionStorage
	 * übersteht Neuladen („Jetzt neu laden“, voller Seitenaufruf nach einem
	 * Update), ist nach einem echten Start vom Homescreen aber leer.
	 */
	alreadyLaunched: boolean;
	pathname: string;
	/** Trägt die Adresse ein Benachrichtigungs-Ziel (`#n=<id>`, Push/Mail)? */
	isNotificationLink: boolean;
}

/**
 * Wohin beim Start umgeleitet werden soll – oder `null` für „bleiben“.
 *
 * Bewusst NUR für die installierte App: Im Browser lässt sich ein Icon nicht
 * von einem Lesezeichen oder einem geteilten Link unterscheiden – dort ist eine
 * Unterseite als Einstieg meist gewollt.
 */
export function launchRedirect(info: LaunchInfo): string | null {
	if (!info.standalone || info.alreadyLaunched) return null;
	// Push-Antippen öffnet die App gezielt auf dem Inhalt (sw-push.js → openWindow).
	if (info.isNotificationLink) return null;
	if (info.pathname === '/' || info.pathname.startsWith('/login')) return null;
	return '/';
}

/** Minimalvertrag für sessionStorage – hält `checkLaunch` testbar. */
type MarkStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * Liest und setzt die Start-Markierung und liefert das Umleitungsziel.
 * Ohne nutzbares sessionStorage (privater Modus, gesperrt) wird nie umgeleitet –
 * sonst ginge jede Navigation mit vollem Seitenaufruf zurück auf Start.
 */
export function checkLaunch(
	storage: MarkStorage | null,
	info: Omit<LaunchInfo, 'alreadyLaunched'>
): string | null {
	if (!storage) return null;
	try {
		const alreadyLaunched = storage.getItem(LAUNCH_MARK_KEY) === '1';
		storage.setItem(LAUNCH_MARK_KEY, '1');
		return launchRedirect({ ...info, alreadyLaunched });
	} catch {
		return null;
	}
}
