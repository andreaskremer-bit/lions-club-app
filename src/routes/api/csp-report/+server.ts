import type { RequestHandler } from './$types';
import { summarizeCspReport } from '$lib/securityHeaders';

/** Meldungen sind klein; alles darüber ist kein Browser-Bericht. */
const MAX_BYTES = 8 * 1024;

/**
 * Nimmt CSP-Verstoßmeldungen der Browser entgegen (`report-uri`, siehe
 * `src/lib/securityHeaders.ts`) und schreibt je Meldung EINE gekürzte Zeile ins
 * Function-Log (Netlify → Logs → Functions → `sveltekit-render`).
 *
 * Liegt bewusst hinter dem Auth-Guard: nur Browser angemeldeter Mitglieder
 * kommen durch, es gibt keinen offenen Endpunkt, den Fremde fluten könnten.
 * Meldungen der Login-Seite gehen dadurch verloren – die ist lokal geprüft.
 */
export const POST: RequestHandler = async ({ request }) => {
	const raw = await request.text();
	if (raw.length <= MAX_BYTES) {
		const line = summarizeCspReport(raw);
		if (line) console.warn(`[csp] ${line}`);
	}
	return new Response(null, { status: 204 });
};
