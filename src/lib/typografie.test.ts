import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGELOG } from './changelog';

// Deutsche Anführungszeichen sind „…“ (U+201E/U+201C). Das gerade " als
// Abschluss sieht fast gleich aus und rutscht beim Schreiben unbemerkt durch,
// deshalb prüft das ein Test statt eines guten Vorsatzes.
const FALSCH_GESCHLOSSEN = /„[^„“"\n]{1,80}"/g;

// Gedankenstrich ist – (U+2013). Ein — (U+2014) mit Leerzeichen davor oder danach ist ein
// Gedankenstrich an der falschen Stelle. Allein stehend ('—', >—<) ist er als Platzhalter
// für „kein Wert“ erlaubt und fällt hier nicht auf.
const GEVIERTSTRICH = /(^|\s)—|—(\s|$)/gm;

// Alles, was wir schreiben und ausliefern. Bereits angewendete Migrationen bleiben
// unverändert (supabase/migrations ist deshalb nicht dabei).
const VERZEICHNISSE = ['src', 'scripts', 'static', 'e2e', 'supabase/functions', 'supabase/tests'];
const DIESE_DATEI = join('src', 'lib', 'typografie.test.ts');

function quelldateien(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const p = join(dir, e.name);
		if (e.isDirectory()) return quelldateien(p);
		return /\.(ts|svelte|css|html|js|mjs|sql|sh)$/.test(e.name) ? [p] : [];
	});
}

function treffer(muster: RegExp): string[] {
	return VERZEICHNISSE.flatMap(quelldateien)
		.filter((f) => f !== DIESE_DATEI)
		.flatMap((f) => (readFileSync(f, 'utf8').match(muster) ?? []).map((m) => `${f}: ${m.trim()}`));
}

describe('Typografie', () => {
	it('schließt deutsche Anführungszeichen mit “, nie mit "', () => {
		expect(treffer(FALSCH_GESCHLOSSEN)).toEqual([]);
	});

	it('nutzt den Halbgeviertstrich – statt —, auch in Kommentaren', () => {
		expect(treffer(GEVIERTSTRICH)).toEqual([]);
	});

	it('nutzt im Changelog den Halbgeviertstrich – statt —', () => {
		const texte = CHANGELOG.flatMap((e) => e.changes.map((c) => c.text));
		expect(texte.filter((t) => t.includes('—'))).toEqual([]);
	});
});
