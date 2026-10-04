// Edge Function `extract-document-text` – füllt document.content_text für die
// deutsche Volltextsuche. Aufgerufen vom Upload-Flow per supabase.functions.invoke
// (User-JWT, verify_jwt=Default an). Der Storage-Download läuft mit Service-Role,
// das Schreiben des Volltexts als Aufrufer. Idempotent re-runbar.
//
// AUFRUFER-PRÜFUNG (Security-Audit 2026-08-03): `verify_jwt` belegt nur, DASS ein
// gültiges Token vorliegt – nicht, dass der Aufrufer dieses Dokument pflegen darf.
// Ohne Prüfung konnte jedes eingeloggte Konto `content_text` beliebiger Dokumente
// überschreiben (= Volltextsuche leeren). Deshalb schreibt die Function `content_text`
// mit dem Token des Aufrufers: die Schreibrechte auf `document` verteilen sich auf ZWEI
// Policies (publish_content für alles, manage_events nur für termin-gebundene
// Dokumente) – RLS bleibt so automatisch deckungsgleich, ein nachgebauter
// Rechte-Check nicht. (Bis 2026-10-04 per No-Op-Probe-Update vorab, das aber den
// gelesenen Titel zurückschrieb und eine parallele Änderung überschreiben konnte.)
//
// PDF: npm:unpdf (serverless-taugliches pdfjs). DOCX: ZIP entpacken (word/document.xml
// -> Tags strippen). Andere Typen (xlsx, Bilder) -> kein Volltext, nur Metadaten-Suche.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
// Für den nutzergebundenen Client (RLS greift). Neues Key-System benennt die
// Variable um – beide Namen akzeptieren, damit der Deploy nicht daran hängt.
const ANON_KEY =
	Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';
const MAX_CHARS = 500_000; // FTS-Sicherheitskappe für sehr große Dokumente

async function extractPdf(bytes: Uint8Array): Promise<string> {
	const { getDocumentProxy, extractText } = await import('npm:unpdf');
	const pdf = await getDocumentProxy(bytes);
	const { text } = await extractText(pdf, { mergePages: true });
	return Array.isArray(text) ? text.join('\n') : text;
}

async function extractDocx(bytes: Uint8Array): Promise<string> {
	const { unzipSync, strFromU8 } = await import('npm:fflate');
	const files = unzipSync(bytes);
	const xml = files['word/document.xml'];
	if (!xml) return '';
	return decodeXmlEntities(
		strFromU8(xml)
			.replace(/<\/w:p>/g, '\n')
			// Tabulator und Zeilenumbrüche als Leerraum erhalten, sonst kleben Wörter
			// zusammen („Datum<w:tab/>Ort“ → „DatumOrt“) und die Suche findet sie nicht.
			.replace(/<w:tab\/>/g, ' ')
			.replace(/<w:(br|cr)\/>/g, '\n')
			.replace(/<[^>]+>/g, '')
	)
		.replace(/[ \t]+\n/g, '\n')
		.trim();
}

/** XML-Entities auflösen; &amp; zuletzt, sonst würde „&amp;lt;“ doppelt zu „<“. */
export function decodeXmlEntities(s: string): string {
	return s
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
		.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
		.replace(/&amp;/g, '&');
}

// CORS: der Upload-Flow ruft die Function aus dem Browser (supabase.functions.invoke).
// Ohne Preflight-Antwort + Header blockt der Browser den eigentlichen POST.
// Nur die eigenen Origins statt '*' – das Token steckt im Header (nicht im Cookie),
// eine fremde Seite kommt also ohnehin nicht an eine fremde Session; die Einengung
// nimmt trotzdem die Möglichkeit, die Function aus beliebigen Seiten heraus zu rufen.
const ALLOWED_ORIGINS = (
	Deno.env.get('APP_ORIGINS') ??
	'https://app.lions-bonn-rheinaue.de,http://localhost:5173,http://127.0.0.1:5173'
)
	.split(',')
	.map((o) => o.trim())
	.filter(Boolean);

function corsHeaders(origin: string | null) {
	return {
		'Access-Control-Allow-Origin':
			origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
		'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		Vary: 'Origin'
	};
}

Deno.serve(async (req) => {
	const CORS = corsHeaders(req.headers.get('Origin'));
	if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

	const { id } = await req.json().catch(() => ({}));
	if (!id) return new Response('id fehlt', { status: 400, headers: CORS });

	const authHeader = req.headers.get('Authorization') ?? '';
	if (!authHeader.toLowerCase().startsWith('bearer '))
		return new Response('Nicht angemeldet', { status: 401, headers: CORS });

	// Client MIT dem Token des Aufrufers: unterliegt RLS wie die App selbst.
	const asCaller = createClient(SUPABASE_URL, ANON_KEY, {
		global: { headers: { Authorization: authHeader } },
		auth: { persistSession: false, autoRefreshToken: false }
	});

	// Lesen als Aufrufer – wer das Dokument nicht sehen darf, bekommt 404 und
	// erfährt so auch nicht, ob die id existiert.
	const { data: doc } = await asCaller
		.from('document')
		.select('id, file_path, mime_type, file_name')
		.eq('id', id)
		.maybeSingle();
	if (!doc?.file_path)
		return new Response('Dokument oder Datei nicht gefunden', { status: 404, headers: CORS });

	// Datei mit dem Service-Key laden; das Schreiben des Volltexts läuft unten als
	// Aufrufer, dort entscheidet RLS über das Schreibrecht (kein Probe-Update mehr, das
	// den eben gelesenen Titel zurückschrieb und eine parallele Änderung überschrieb).
	const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

	const { data: file, error: dlErr } = await supabase.storage
		.from('documents')
		.download(doc.file_path);
	if (dlErr || !file)
		return new Response('Download fehlgeschlagen', { status: 500, headers: CORS });

	const bytes = new Uint8Array(await file.arrayBuffer());
	const name = (doc.file_name ?? doc.file_path).toLowerCase();
	const isPdf = name.endsWith('.pdf') || doc.mime_type === 'application/pdf';
	const isDocx = name.endsWith('.docx');

	let text = '';
	let failed = false;
	try {
		if (isPdf) {
			text = await extractPdf(bytes);
		} else if (isDocx) {
			text = await extractDocx(bytes);
		}
	} catch (e) {
		// Vorhandenen Volltext NICHT durch einen Fehlversuch ersetzen: ein
		// gescheiterter Re-Run hat sonst still die Suche für dieses Dokument
		// geleert. Nicht unterstützte Typen (xlsx, Bilder) sind kein Fehlversuch –
		// dort ist der leere Volltext das korrekte Ergebnis.
		console.error('Textextraktion fehlgeschlagen:', e);
		failed = true;
	}

	if (failed) {
		return new Response(JSON.stringify({ id, chars: null, status: 'extraktion_fehlgeschlagen' }), {
			headers: { ...CORS, 'Content-Type': 'application/json' }
		});
	}

	text = text.slice(0, MAX_CHARS).trim();
	const { data: written, error: writeErr } = await asCaller
		.from('document')
		.update({ content_text: text || null })
		.eq('id', id)
		.select('id')
		.maybeSingle();
	if (writeErr) {
		console.error('Volltext speichern fehlgeschlagen:', writeErr);
		return new Response('Volltext speichern fehlgeschlagen', { status: 500, headers: CORS });
	}
	// Fehlt das Schreibrecht, filtert RLS die Zeile weg -> keine Daten zurück.
	if (!written) return new Response('Keine Berechtigung', { status: 403, headers: CORS });

	return new Response(JSON.stringify({ id, chars: text.length }), {
		headers: { ...CORS, 'Content-Type': 'application/json' }
	});
});
