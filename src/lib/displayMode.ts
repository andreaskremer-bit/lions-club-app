// Erkennt, ob die App gerade als installierte PWA (Homescreen) oder in einem
// normalen Browser-Tab läuft, und meldet das einmal pro App-Start an die DB
// (RPC `track_display_mode`, Migration 20260813120100).
//
// Hintergrund: `push_subscription` war bisher der einzige Anhaltspunkt für
// „installiert“ — er übersieht aber jede Installation ohne aktivierten Push.
// Der Anzeige-Modus beantwortet die Frage direkt.
//
// Die Erkennung steckt in einer reinen Funktion (`isStandaloneMode`), damit sie
// ohne DOM testbar bleibt (Vitest läuft mit environment: 'node').

/**
 * Anzeige-Modi, die eine Installation bedeuten. Das Manifest fordert
 * `display: 'standalone'`; Browser dürfen daraus aber auf `minimal-ui`
 * zurückfallen, und manche Android-Launcher starten `fullscreen`. Alle drei
 * heißen „läuft nicht im Browser-Tab“.
 */
const STANDALONE_MODES = ['standalone', 'fullscreen', 'minimal-ui'] as const;

/**
 * Reiner Kern der Erkennung.
 *
 * @param matchesMedia Prüft eine Media-Query (im Browser `window.matchMedia`).
 * @param iosStandalone `navigator.standalone` — von iOS-Safari gesetzt.
 *   Bewusst zusätzlich abgefragt: es ist der historisch zuverlässigste Marker
 *   für „zum Homescreen hinzugefügt“ auf iOS und kostet nichts.
 */
export function isStandaloneMode(
	matchesMedia: (query: string) => boolean,
	iosStandalone?: boolean
): boolean {
	if (iosStandalone === true) return true;
	return STANDALONE_MODES.some((mode) => matchesMedia(`(display-mode: ${mode})`));
}

/** Läuft die App gerade als installierte PWA? Auf dem Server immer `false`. */
export function isStandalone(): boolean {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
	return isStandaloneMode(
		(query) => window.matchMedia(query).matches,
		(navigator as Navigator & { standalone?: boolean }).standalone
	);
}

/** Minimalvertrag statt des vollen SupabaseClient-Typs — hält die Funktion testbar. */
type RpcCaller = {
	rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<unknown>;
};

/**
 * Meldet den aktuellen Anzeige-Modus. Fire-and-forget: Fehler werden
 * geschluckt, denn eine fehlgeschlagene Telemetrie darf den App-Start unter
 * keinen Umständen stören (offline, RLS, Netzfehler).
 */
export async function trackDisplayMode(supabase: RpcCaller): Promise<void> {
	try {
		await supabase.rpc('track_display_mode', { standalone: isStandalone() });
	} catch {
		// bewusst ignoriert — s. o.
	}
}
