#!/usr/bin/env node
// Einmal-Import: Sitzungs-Protokolle (PDFs) aus einem Ordner in die Dokumente-
// Ablage (Tabelle public.document + Storage-Bucket "documents").
//
// Aufruf:
//   node scripts/import-protokolle.mjs "<ordner>" [--apply] [--no-extract]
//
// OHNE --apply wird NICHTS geschrieben (Dry-Run: zeigt Titel/Kategorie/Datum/Datei).
//
// WICHTIG: ruft NIEMALS notify_document auf → es wird KEINE Mitglieder-
// Benachrichtigung erzeugt (die 34 Mitglieder bekommen nichts).
//
// Dubletten (zwei Datei-Varianten desselben Datums, per YYYYMMDD-Präfix erkannt):
// es gewinnt die GRÖSSTE Datei = die vollständige Version (inkl. Vortrag/Anhänge/
// Scans). Vom Nutzer so entschieden.
//
// Titel: "Protokoll <Typ> DD.MM.YYYY". Kategorie: MV → protokoll_mv,
// Ausflug → sonstige, sonst → protokoll_clubabend.
//
// Der Service-Role-Key umgeht RLS — niemals committen / ins Memory schreiben.

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const REMOTE_URL = 'https://qfxtyqippdrcrhwbkhwx.supabase.co';
const BUCKET = 'documents';
const UPLOADER_ID = 'b69ead38-1554-4193-9a7c-84692d853e9c'; // Andreas Kremer (Webmaster)

const dir = process.argv[2];
const APPLY = process.argv.includes('--apply');
const NO_EXTRACT = process.argv.includes('--no-extract');

if (!dir) {
	console.error('Fehler: Ordnerpfad als erstes Argument angeben.');
	process.exit(1);
}

// Service-Role-Key aus .env.local lesen (nicht ausgeben).
function readServiceKey() {
	if (process.env.SUPABASE_SERVICE_ROLE_KEY) return process.env.SUPABASE_SERVICE_ROLE_KEY;
	try {
		const txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
		const m = txt.match(/^\s*SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.+?)\s*$/m);
		if (m) return m[1].replace(/^["']|["']$/g, '');
	} catch {
		/* ignore */
	}
	return null;
}

const key = readServiceKey();
if (!key) {
	console.error('Fehler: SUPABASE_SERVICE_ROLE_KEY fehlt (weder Env noch .env.local).');
	process.exit(1);
}

const supabase = createClient(REMOTE_URL, key, {
	auth: { persistSession: false, autoRefreshToken: false }
});

function deDate(iso) {
	const [y, m, d] = iso.split('-');
	return `${d}.${m}.${y}`;
}

// Datum + Anlass aus Dateiname bestimmen. Rückgabe: {iso, kind, category, titleType} | null
function classify(fname) {
	const lower = fname.toLowerCase();
	let iso = null;

	// (a) YYYYMMDD-Präfix
	const pre = fname.match(/^(\d{4})(\d{2})(\d{2})/);
	if (pre) {
		iso = `${pre[1]}-${pre[2]}-${pre[3]}`;
	} else {
		// (b) "vom DD.MM.YYYY" im Klartext
		const vom = fname.match(/(\d{2})\.(\d{2})\.(\d{4})/);
		if (vom) iso = `${vom[3]}-${vom[2]}-${vom[1]}`;
	}
	if (!iso) return null;

	let category, titleType;
	if (lower.includes('mitgliederversammlung') || /\bmv\b/.test(lower)) {
		category = 'protokoll_mv';
		titleType = 'Mitgliederversammlung';
	} else if (lower.includes('ausflug')) {
		category = 'sonstige';
		// DUS = Düsseldorf
		titleType = lower.includes('dus') ? 'Ausflug Düsseldorf' : 'Ausflug';
	} else {
		category = 'protokoll_clubabend';
		titleType = 'Clubabend';
	}
	return { iso, category, titleType };
}

function cleanFileName(iso, titleType) {
	const t = titleType
		.replace(/ä/g, 'ae')
		.replace(/ö/g, 'oe')
		.replace(/ü/g, 'ue')
		.replace(/ß/g, 'ss')
		.replace(/[^\w]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return `Protokoll-${t}-${iso}.pdf`;
}

// ── Dateien einlesen + gruppieren (Dublette = gleiches Datum, größte Datei gewinnt) ──
const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.pdf'));

const parsed = [];
const skipped = [];
for (const f of files) {
	const c = classify(f);
	const full = join(dir, f);
	const size = readFileSync(full).length;
	if (!c) {
		skipped.push({ f, reason: 'kein Datum erkennbar' });
		continue;
	}
	parsed.push({ f, full, size, ...c });
}

// Gruppieren nach ISO-Datum; bei mehreren die größte Datei behalten.
const byDate = new Map();
for (const p of parsed) {
	const prev = byDate.get(p.iso);
	if (!prev) {
		byDate.set(p.iso, p);
	} else if (p.size > prev.size) {
		skipped.push({ f: prev.f, reason: `Dublette ${p.iso} (kleinere Variante)` });
		byDate.set(p.iso, p);
	} else {
		skipped.push({ f: p.f, reason: `Dublette ${p.iso} (kleinere Variante)` });
	}
}

const entries = [...byDate.values()]
	.map((p) => ({
		...p,
		title: `Protokoll ${p.titleType} ${deDate(p.iso)}`,
		fileName: cleanFileName(p.iso, p.titleType)
	}))
	.sort((a, b) => a.iso.localeCompare(b.iso));

// ── Bericht ──
console.log(
	`\nGefundene PDFs: ${files.length} · aufzunehmen: ${entries.length} · übersprungen: ${skipped.length}\n`
);
console.log('Datum       Kategorie             Titel');
console.log('----------  --------------------  -------------------------------------------');
for (const e of entries) {
	console.log(
		`${e.iso}  ${e.category.padEnd(20)}  ${e.title}  [${(e.size / 1024 / 1024).toFixed(2)} MB → ${e.fileName}]`
	);
}
if (skipped.length) {
	console.log('\nÜbersprungen:');
	for (const s of skipped) console.log(`  - ${s.f}  (${s.reason})`);
}

if (!APPLY) {
	console.log('\n[DRY-RUN] Nichts geschrieben. Mit --apply ausführen.');
	// Konnektivität testen (Lesezugriff), damit der Service-Key vorab verifiziert ist.
	const { count, error } = await supabase
		.from('document')
		.select('id', { count: 'exact', head: true });
	if (error) console.log(`\n[WARN] Lesetest fehlgeschlagen (Key/URL prüfen): ${error.message}`);
	else console.log(`[OK] Service-Key gültig, aktuell ${count} Dokument(e) in der DB.`);
	process.exit(0);
}

// ── Anwenden ──
console.log('\n[APPLY] Lade hoch …\n');
const created = [];
let failed = 0;
for (const e of entries) {
	const buf = readFileSync(e.full);
	const { data: row, error: insErr } = await supabase
		.from('document')
		.insert({
			title: e.title,
			category: e.category,
			doc_date: e.iso,
			file_name: e.fileName,
			mime_type: 'application/pdf',
			size_bytes: e.size,
			uploaded_by: UPLOADER_ID
		})
		.select('id')
		.single();
	if (insErr || !row) {
		console.log(`  FEHLER insert ${e.title}: ${insErr?.message ?? 'unbekannt'}`);
		failed++;
		continue;
	}
	const path = `${row.id}/${e.fileName}`;
	const { error: upErr } = await supabase.storage
		.from(BUCKET)
		.upload(path, buf, { contentType: 'application/pdf', upsert: true });
	if (upErr) {
		await supabase.from('document').delete().eq('id', row.id);
		console.log(`  FEHLER upload ${e.title}: ${upErr.message}`);
		failed++;
		continue;
	}
	await supabase.from('document').update({ file_path: path }).eq('id', row.id);
	created.push({ id: row.id, title: e.title });
	console.log(`  OK  ${e.title}`);
}

console.log(`\nAngelegt: ${created.length} · Fehler: ${failed}`);

// ── Volltext-Extraktion (best-effort, keine Benachrichtigung) ──
if (!NO_EXTRACT && created.length) {
	console.log('\nStoße Volltext-Extraktion an (extract-document-text) …');
	let ok = 0,
		ex = 0;
	for (const d of created) {
		try {
			const { error } = await supabase.functions.invoke('extract-document-text', {
				body: { id: d.id }
			});
			if (error) {
				ex++;
				console.log(`  extract FEHLER ${d.title}: ${error.message}`);
			} else ok++;
		} catch (err) {
			ex++;
			console.log(`  extract EXCEPTION ${d.title}: ${err.message}`);
		}
	}
	console.log(`Extraktion: ${ok} ok · ${ex} Fehler`);
}

console.log(
	'\nFertig. (notify_document wurde bewusst NICHT aufgerufen → keine Benachrichtigungen.)'
);
