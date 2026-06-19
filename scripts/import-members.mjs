#!/usr/bin/env node
// Einmal-Import: Mitglieder-Roster aus dem alten LionsApp-CSV in die Supabase-DB.
// Abgleich per E-Mail (case-insensitiv). Treffer → Update, kein Treffer → Insert.
//
// Aufruf:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=… \
//   node scripts/import-members.mjs "<pfad/zur.csv>" [--apply] [--parse-only]
//
// OHNE --apply wird NICHTS geschrieben (reiner Bericht / Dry-Run).
// Überschreib-Politik (Update): ein DB-Feld wird nur ersetzt, wenn das CSV dort
// einen Wert hat; leere CSV-Zellen löschen vorhandene Daten NICHT. Die E-Mail
// (Login-Adresse) wird NIE geändert. Profilbilder werden immer gesetzt (auch wenn
// schon eins existiert), das alte Storage-Objekt wird entfernt.
//
// ALIASES: CSV-E-Mail → bestehende DB-E-Mail (z. B. abweichende Domain desselben
// Mitglieds), damit der Eintrag in den Update-Pfad läuft statt eine Dublette zu
// erzeugen.
//
// Der Service-Role-Key umgeht RLS — niemals committen / ins Memory schreiben.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const DEFAULT_URL = 'https://qfxtyqippdrcrhwbkhwx.supabase.co';
const BUCKET = 'member-photos';

const ALIASES = {
	// CSV-E-Mail → bestehende DB-E-Mail, Format: 'alt@example.com': 'bestand@example.com'
};

const url = process.env.SUPABASE_URL || DEFAULT_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const csvPath = process.argv[2];
const APPLY = process.argv.includes('--apply');
const PARSE_ONLY = process.argv.includes('--parse-only');

if (!csvPath) {
	console.error('Fehler: CSV-Pfad als erstes Argument angeben.');
	process.exit(1);
}
if (!key && !PARSE_ONLY) {
	console.error('Fehler: SUPABASE_SERVICE_ROLE_KEY (Env) fehlt.');
	process.exit(1);
}
if (url.includes('127.0.0.1') || url.includes('localhost')) {
	console.error('Fehler: SUPABASE_URL zeigt auf den lokalen Stack. Remote-URL setzen.');
	process.exit(1);
}

// ── minimaler RFC-4180-CSV-Parser (Quotes + eingebettete Kommas/Zeilenumbrüche) ──
function parseCsv(text) {
	const rows = [];
	let row = [];
	let field = '';
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
		else if (c === ',') {
			row.push(field);
			field = '';
		} else if (c === '\n') {
			row.push(field);
			rows.push(row);
			row = [];
			field = '';
		} else if (c === '\r') {
			// ignorieren (CRLF)
		} else field += c;
	}
	if (field !== '' || row.length) {
		row.push(field);
		rows.push(row);
	}
	return rows;
}

// DD.MM.YYYY → YYYY-MM-DD; null bei leer/ungültig.
function toIsoDate(s) {
	const m = String(s)
		.trim()
		.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
	if (!m) return null;
	const [, d, mo, y] = m;
	return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

const clean = (s) => {
	const t = String(s ?? '').trim();
	return t === '' ? null : t;
};

// CSV-Spalte → DB-Feld (Wert-Transformation).
const FIELD_MAP = {
	Vorname: ['first_name', clean],
	Nachname: ['last_name', clean],
	Titel: ['title', clean],
	'Internationale Nummer': ['lions_member_no', clean],
	Geburtsdatum: ['birthday', (v) => toIsoDate(v)],
	Adresse: ['street', clean],
	PLZ: ['zip', clean],
	Ort: ['city', clean],
	'Tel Privat': ['phone', clean],
	Mobil: ['mobile', clean],
	'Tel Büro': ['phone_office', clean]
};

const MIME = {
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	gif: 'image/gif',
	webp: 'image/webp',
	heic: 'image/heic'
};

function extFromUrl(u) {
	const m = u.split('?')[0].match(/\.([a-zA-Z0-9]{3,4})$/);
	return (m ? m[1] : 'jpg').toLowerCase();
}

// Foto holen, in den Bucket legen, photo_path setzen, altes Objekt entfernen.
// Content-Type aus der Endung ableiten — die Quelle liefert oft octet-stream,
// womit der Browser das Avatar über die signierte URL nicht inline rendert.
async function setPhoto(supabase, memberId, oldPath, photoUrl) {
	const res = await fetch(photoUrl);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const buf = Buffer.from(await res.arrayBuffer());
	const ext = extFromUrl(photoUrl);
	const contentType = MIME[ext] || 'image/jpeg';
	const path = `${memberId}/avatar_${Date.now()}.${ext}`;
	const { error: stErr } = await supabase.storage
		.from(BUCKET)
		.upload(path, buf, { contentType, upsert: true });
	if (stErr) throw stErr;
	const { error: pErr } = await supabase
		.from('member')
		.update({ photo_path: path })
		.eq('id', memberId);
	if (pErr) throw pErr;
	if (oldPath && oldPath !== path) await supabase.storage.from(BUCKET).remove([oldPath]);
}

async function main() {
	const raw = readFileSync(csvPath, 'utf-8').replace(/^\uFEFF/, '');
	const rows = parseCsv(raw);
	const header = rows[0].map((h) => h.trim());
	const records = rows
		.slice(1)
		.filter((r) => r.some((c) => c.trim() !== ''))
		.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));

	if (PARSE_ONLY) {
		console.log(`Header (${header.length}):`, header.join(' | '));
		console.log(`Datensätze: ${records.length}`);
		const withNo = records.filter((r) => clean(r['Internationale Nummer'])).length;
		const withPhoto = records.filter((r) => clean(r['Profilbild (Url)'])).length;
		const badDates = records.filter(
			(r) => clean(r['Geburtsdatum']) && !toIsoDate(r['Geburtsdatum'])
		);
		console.log(`mit Nummer: ${withNo} · mit Bild: ${withPhoto}`);
		console.log(`Geburtsdatum-Parsefehler: ${badDates.length}`);
		console.log('Beispiel-Mapping (erste Zeile):');
		const r0 = records[0];
		for (const [c, [f, tf]] of Object.entries(FIELD_MAP))
			console.log(`  ${f} ← ${JSON.stringify(tf(r0[c]))}`);
		return;
	}

	const supabase = createClient(url, key, { auth: { persistSession: false } });

	const { data: members, error } = await supabase
		.from('member')
		.select(
			'id, email, first_name, last_name, title, lions_member_no, birthday, street, zip, city, phone, mobile, phone_office, photo_path'
		);
	if (error) {
		console.error('DB-Lesefehler:', error.message);
		process.exit(1);
	}

	const byEmail = new Map(members.map((m) => [m.email.toLowerCase(), m]));

	console.log(`\nModus: ${APPLY ? 'APPLY (schreibt!)' : 'DRY-RUN (nur Bericht)'}`);
	console.log(`Ziel:  ${url}`);
	console.log(`CSV:   ${records.length} Zeilen · DB: ${members.length} Mitglieder\n`);

	let updated = 0;
	let inserted = 0;
	let photos = 0;
	const failures = [];

	for (const rec of records) {
		const rawEmail = (rec['Email'] || '').trim().toLowerCase();
		const email = ALIASES[rawEmail] || rawEmail;
		const member = byEmail.get(email);
		const photoUrl = clean(rec['Profilbild (Url)']);

		// CSV-Werte einsammeln (nur nicht-leere).
		const csvVals = {};
		for (const [csvCol, [dbField, tf]] of Object.entries(FIELD_MAP)) {
			const v = tf(rec[csvCol]);
			if (v !== null) csvVals[dbField] = v;
		}

		if (member) {
			// ── UPDATE ──
			const payload = {};
			const diffs = [];
			for (const [f, v] of Object.entries(csvVals)) {
				if (v !== (member[f] ?? null)) {
					payload[f] = v;
					diffs.push(`${f}: ${JSON.stringify(member[f] ?? null)} → ${JSON.stringify(v)}`);
				}
			}
			if (diffs.length || photoUrl) {
				console.log(`• UPDATE ${member.first_name} ${member.last_name} <${member.email}>`);
				for (const d of diffs) console.log(`    ${d}`);
				if (photoUrl)
					console.log(`    foto: ${member.photo_path ? 'ersetzt' : 'neu'} ← ${photoUrl}`);
			}
			if (APPLY) {
				if (diffs.length) {
					const { error: e } = await supabase.from('member').update(payload).eq('id', member.id);
					if (e) failures.push(`UPDATE ${email}: ${e.message}`);
					else updated++;
				}
				if (photoUrl) {
					try {
						await setPhoto(supabase, member.id, member.photo_path, photoUrl);
						photos++;
					} catch (e) {
						failures.push(`FOTO ${email}: ${e.message}`);
					}
				}
			} else {
				if (diffs.length) updated++;
				if (photoUrl) photos++;
			}
		} else {
			// ── INSERT ──
			const payload = { email: rawEmail, ...csvVals };
			console.log(`• NEU    ${csvVals.first_name} ${csvVals.last_name} <${rawEmail}>`);
			const extra = Object.keys(csvVals).filter((k) => !['first_name', 'last_name'].includes(k));
			if (extra.length) console.log(`    Felder: ${extra.join(', ')}`);
			if (photoUrl) console.log(`    foto: neu ← ${photoUrl}`);
			if (APPLY) {
				const { data: created, error: e } = await supabase
					.from('member')
					.insert(payload)
					.select('id')
					.single();
				if (e) {
					failures.push(`INSERT ${rawEmail}: ${e.message}`);
					continue;
				}
				inserted++;
				if (photoUrl) {
					try {
						await setPhoto(supabase, created.id, null, photoUrl);
						photos++;
					} catch (err) {
						failures.push(`FOTO ${rawEmail}: ${err.message}`);
					}
				}
			} else {
				inserted++;
				if (photoUrl) photos++;
			}
		}
	}

	const csvResolved = new Set(
		records.map((r) => {
			const e = (r['Email'] || '').trim().toLowerCase();
			return ALIASES[e] || e;
		})
	);
	const notInCsv = members.filter((m) => !csvResolved.has(m.email.toLowerCase()));

	console.log('\n──────── Zusammenfassung ────────');
	console.log(`Neu angelegt:                 ${inserted}`);
	console.log(`Aktualisiert (Felder):        ${updated}`);
	console.log(`Profilbilder gesetzt/ersetzt: ${photos}`);
	if (notInCsv.length) {
		console.log(`\nDB-Mitglieder NICHT im CSV (${notInCsv.length}):`);
		for (const m of notInCsv) console.log(`  - ${m.email}`);
	}
	if (failures.length) {
		console.log(`\nFEHLER (${failures.length}):`);
		for (const f of failures) console.log(`  ! ${f}`);
	}
	if (!APPLY) console.log('\nDry-Run beendet. Mit --apply tatsächlich schreiben.');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
