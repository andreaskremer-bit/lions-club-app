import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHANGELOG } from './changelog';

// Deutsche Anführungszeichen sind „…“ (U+201E/U+201C). Das gerade " als
// Abschluss sieht fast gleich aus und rutscht beim Schreiben unbemerkt durch,
// deshalb prüft das ein Test statt eines guten Vorsatzes.
const FALSCH_GESCHLOSSEN = /„[^„“"\n]{1,80}"/g;

function quelldateien(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const p = join(dir, e.name);
		if (e.isDirectory()) return quelldateien(p);
		return /\.(ts|svelte|css|html)$/.test(e.name) ? [p] : [];
	});
}

describe('Typografie', () => {
	it('schließt deutsche Anführungszeichen mit “, nie mit "', () => {
		const treffer = quelldateien('src').flatMap((f) =>
			(readFileSync(f, 'utf8').match(FALSCH_GESCHLOSSEN) ?? []).map((m) => `${f}: ${m}`)
		);
		expect(treffer).toEqual([]);
	});

	it('nutzt im Changelog den Halbgeviertstrich – statt —', () => {
		const texte = CHANGELOG.flatMap((e) => e.changes.map((c) => c.text));
		expect(texte.filter((t) => t.includes('—'))).toEqual([]);
	});
});
