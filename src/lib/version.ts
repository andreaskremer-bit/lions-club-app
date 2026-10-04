/**
 * Versionskennung der laufenden App.
 *
 * Die Werte werden zur Build-Zeit per `define` (vite.config.ts) aus Git
 * eingesetzt – hier steht bewusst nichts Gepflegtes.
 *
 * Wozu das Ganze: eine installierte PWA kann durch den Service-Worker-Cache
 * länger auf einem älteren Stand laufen. Bei einer Rückmeldung aus dem Club
 * („bei mir sieht das anders aus“) ist die sichtbare Nummer der schnellste
 * Weg, den Stand des Geräts zu klären; der Commit-Hash ordnet einen Screenshot
 * exakt einem Code-Stand zu.
 */

/** Kalender-Version des Commits, z. B. `2026.08.04`. */
export const APP_VERSION = __APP_VERSION__;

/** Kurzer Commit-Hash, z. B. `f7e9b1f`. `dev`, wenn kein Git verfügbar war. */
export const APP_COMMIT = __APP_COMMIT__;

/** Einzeiler für die Anzeige: `2026.08.04 · f7e9b1f`. */
export const APP_BUILD = `${APP_VERSION} · ${APP_COMMIT}`;
