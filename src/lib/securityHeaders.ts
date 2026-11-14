/**
 * Sicherheits-Header der App und die Content-Security-Policy (CSP).
 *
 * Zwei Abnehmer:
 *  - `src/hooks.server.ts` setzt `SECURITY_HEADERS` auf jede Server-Antwort.
 *    Header-Regeln in `netlify.toml` griffen dort NICHT: Netlify wendet sie nur
 *    auf Dateien aus dem eigenen CDN an, nicht auf Antworten der Function
 *    `sveltekit-render`, aus der alle Seiten kommen.
 *  - `vite.config.ts` reicht `cspDirectives()` an SvelteKit (`csp`), das den
 *    CSP-Header selbst schreibt und das eine Inline-Skript jeder Seite mit einem
 *    Einmalwert (Nonce) versieht.
 *
 * Bewusst ohne Importe: `vite.config.ts` lädt dieses Modul vor dem Build.
 */

/** Pfad des Endpunkts, an den Browser CSP-Verstöße melden. */
export const CSP_REPORT_PATH = '/api/csp-report';

/**
 * Header für jede Server-Antwort. HSTS und `X-Content-Type-Options` setzt
 * Netlify bereits selbst.
 */
export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
	// Die App darf nirgends eingebettet werden (Schutz vor untergeschobenen Klicks).
	'X-Frame-Options': 'DENY',
	// Fremde Seiten (Galerie-Link, Links in News) erfahren nicht, woher man kommt.
	'Referrer-Policy': 'same-origin',
	// Gerätefunktionen, die die App nicht nutzt. Foto-Upload läuft über die
	// Dateiauswahl und ist davon nicht betroffen, Push ebenfalls nicht.
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
};

/** Nur der Ursprung (`https://host[:port]`), `null` bei leerem oder kaputtem Wert. */
function originOf(url: string | undefined): string | null {
	if (!url) return null;
	try {
		return new URL(url).origin;
	} catch {
		return null;
	}
}

/**
 * CSP-Direktiven im Format der SvelteKit-Option `csp`.
 *
 * `supabaseUrl` = `PUBLIC_SUPABASE_URL` (Daten, Login, Storage-Bilder, Edge
 * Functions liegen alle auf diesem einen Ursprung). `dev` erlaubt zusätzlich
 * die WebSocket-Verbindung des Vite-Dev-Servers.
 *
 * `script-src` enthält bewusst KEIN `'unsafe-inline'` – SvelteKit ergänzt den
 * Nonce selbst. Bei `style-src` ist es nötig: es gibt `style="…"`-Attribute
 * (u. a. in `src/app.html`), und Stile können keinen Code ausführen.
 */
export function cspDirectives(opts: {
	supabaseUrl: string | undefined;
	dev?: boolean;
}): Record<string, string[]> {
	const supabase = originOf(opts.supabaseUrl);
	const withSupabase = (...sources: string[]) => (supabase ? [...sources, supabase] : sources);

	return {
		'default-src': ["'self'"],
		'script-src': ["'self'"],
		'style-src': ["'self'", "'unsafe-inline'"],
		'connect-src': opts.dev ? withSupabase("'self'", 'ws:') : withSupabase("'self'"),
		// blob:/data: für lokal erzeugte Vorschauen und eingebettete Grafiken.
		'img-src': withSupabase("'self'", 'blob:', 'data:'),
		// data: weil Vite kleine Schriftdateien direkt ins CSS schreibt (im Browser
		// aufgefallen: ohne data: meldete jede Seite einen Verstoß).
		'font-src': ["'self'", 'data:'],
		'worker-src': ["'self'"],
		'manifest-src': ["'self'"],
		'object-src': ["'none'"],
		'base-uri': ["'self'"],
		'form-action': ["'self'"],
		'frame-ancestors': ["'none'"],
		'report-uri': [CSP_REPORT_PATH]
	};
}

const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/** Adresse fürs Log kürzen: ohne Query/Fragment (signierte URLs tragen dort ein
 *  Token), IDs maskiert – ins Log gehört nichts, was auf eine Person zeigt. */
function trimUrl(value: unknown, keepOrigin: boolean): string {
	if (typeof value !== 'string' || !value) return '-';
	try {
		const url = new URL(value);
		const path = url.pathname.replace(UUID, ':id');
		return (keepOrigin ? url.origin + path : path).slice(0, 200);
	} catch {
		// Kein URL, sondern ein Schlüsselwort wie `inline`, `eval` oder `data`.
		return value.replace(UUID, ':id').slice(0, 60);
	}
}

/**
 * Macht aus dem Meldungs-Body eines Browsers eine kurze Log-Zeile.
 * Versteht beide Formate: `application/csp-report` (`report-uri`) und die
 * Reporting-API (`application/reports+json`). `null` = nichts Verwertbares.
 */
export function summarizeCspReport(raw: string): string | null {
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return null;
	}
	const first: unknown = Array.isArray(parsed) ? parsed[0] : parsed;
	if (!first || typeof first !== 'object') return null;
	const outer = first as Record<string, unknown>;
	const body = (outer['csp-report'] ?? outer['body']) as Record<string, unknown> | undefined;
	if (!body || typeof body !== 'object') return null;

	const directive =
		body['effective-directive'] ?? body['effectiveDirective'] ?? body['violated-directive'];
	if (typeof directive !== 'string' || !directive) return null;

	const blocked = trimUrl(body['blocked-uri'] ?? body['blockedURL'], true);
	const page = trimUrl(body['document-uri'] ?? body['documentURL'], false);
	const source = trimUrl(body['source-file'] ?? body['sourceFile'], true);
	const line = body['line-number'] ?? body['lineNumber'];

	return (
		`${directive.slice(0, 40)} blockiert ${blocked} auf ${page}` +
		(source === '-' ? '' : ` (Quelle ${source}${typeof line === 'number' ? ':' + line : ''})`)
	);
}
