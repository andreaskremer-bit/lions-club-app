import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Die Edge Functions laden ihre npm-Pakete über `npm:`-Imports, ohne Lockfile. Bis
 * 2026-10-24 standen dort Bereiche (`@2`, `@3`) oder gar keine Version – welche
 * Version live lief, entschied der Tag des Deploys. Jetzt: jede Version exakt, und
 * `supabase/edge-deps/package.json` führt dieselben Versionen, damit `npm audit`
 * und Dependabot sie sehen. Ein Update heißt: Import UND Manifest ändern, dann
 * `npm install --package-lock-only` in `supabase/edge-deps/`.
 */
const FUNCTIONS = join('supabase', 'functions');
const MANIFEST = JSON.parse(readFileSync(join('supabase', 'edge-deps', 'package.json'), 'utf8'));

function quelldateien(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
		const p = join(dir, e.name);
		if (e.isDirectory()) return quelldateien(p);
		return /\.ts$/.test(e.name) && !/\.test\.ts$/.test(e.name) ? [p] : [];
	});
}

// Name und Version aus 'npm:@scope/name@1.2.3' bzw. 'npm:name' (Version fehlt)
const NPM_IMPORT = /['"]npm:((?:@[^/'"]+\/)?[^@'"/]+)(?:@([^'"/]+))?[^'"]*['"]/g;

const imports = quelldateien(FUNCTIONS).flatMap((datei) =>
	[...readFileSync(datei, 'utf8').matchAll(NPM_IMPORT)].map((m) => ({
		datei,
		name: m[1],
		version: m[2] ?? '(keine)'
	}))
);

describe('npm:-Imports der Edge Functions', () => {
	it('findet überhaupt Imports (sonst prüft der Test nichts)', () => {
		expect(imports.length).toBeGreaterThan(0);
	});

	it('nennen jede Version exakt (kein Bereich, kein Weglassen)', () => {
		const lose = imports.filter((i) => !/^\d+\.\d+\.\d+$/.test(i.version));
		expect(lose.map((i) => `${i.datei}: ${i.name}@${i.version}`)).toEqual([]);
	});

	it('stimmen mit supabase/edge-deps/package.json überein', () => {
		const falsch = imports.filter((i) => MANIFEST.dependencies[i.name] !== i.version);
		expect(falsch.map((i) => `${i.datei}: ${i.name}@${i.version}`)).toEqual([]);
		const genutzt = new Set(imports.map((i) => i.name));
		expect(Object.keys(MANIFEST.dependencies).filter((n) => !genutzt.has(n))).toEqual([]);
	});
});
