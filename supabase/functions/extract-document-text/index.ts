// Edge Function `extract-document-text` — füllt document.content_text für die
// deutsche Volltextsuche. Aufgerufen vom Upload-Flow per supabase.functions.invoke
// (User-JWT, verify_jwt=Default an). Die eigentliche Verarbeitung läuft serverseitig
// mit Service-Role (Storage-Download + Update). Idempotent re-runbar.
//
// PDF: npm:unpdf (serverless-taugliches pdfjs). DOCX: ZIP entpacken (word/document.xml
// -> Tags strippen). Andere Typen (xlsx, Bilder) -> kein Volltext, nur Metadaten-Suche.

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
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
	return strFromU8(xml)
		.replace(/<\/w:p>/g, '\n')
		.replace(/<[^>]+>/g, '')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/[ \t]+\n/g, '\n')
		.trim();
}

// CORS: der Upload-Flow ruft die Function aus dem Browser (supabase.functions.invoke).
// Ohne Preflight-Antwort + Header blockt der Browser den eigentlichen POST.
const CORS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
	'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (req) => {
	if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

	const { id } = await req.json().catch(() => ({}));
	if (!id) return new Response('id fehlt', { status: 400, headers: CORS });

	const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

	const { data: doc } = await supabase
		.from('document')
		.select('id, file_path, mime_type, file_name')
		.eq('id', id)
		.maybeSingle();
	if (!doc?.file_path)
		return new Response('Dokument oder Datei nicht gefunden', { status: 404, headers: CORS });

	const { data: file, error: dlErr } = await supabase.storage
		.from('documents')
		.download(doc.file_path);
	if (dlErr || !file) return new Response('Download fehlgeschlagen', { status: 500, headers: CORS });

	const bytes = new Uint8Array(await file.arrayBuffer());
	const name = (doc.file_name ?? doc.file_path).toLowerCase();

	let text = '';
	try {
		if (name.endsWith('.pdf') || doc.mime_type === 'application/pdf') {
			text = await extractPdf(bytes);
		} else if (name.endsWith('.docx')) {
			text = await extractDocx(bytes);
		}
	} catch (e) {
		console.error('Textextraktion fehlgeschlagen:', e);
	}

	text = text.slice(0, MAX_CHARS).trim();
	await supabase
		.from('document')
		.update({ content_text: text || null })
		.eq('id', id);

	return new Response(JSON.stringify({ id, chars: text.length }), {
		headers: { ...CORS, 'Content-Type': 'application/json' }
	});
});
