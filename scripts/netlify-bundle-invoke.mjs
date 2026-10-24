// Ruft die gebündelte Netlify-Function direkt auf (Teil von scripts/netlify-bundle-check.sh).
//
//   node netlify-bundle-invoke.mjs <entpackte-function> <ausgabe.json> [cookie-datei]
//   node netlify-bundle-invoke.mjs --vergleich <alt.json> <neu.json>
//   node netlify-bundle-invoke.mjs --sitzung <repo> <email> <cookie-datei>   (nur lokaler Stack)
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);

// Event aus supabase/seed.sql
const SEED_EVENT = '00000000-0000-0000-0000-0000000a1001';
const OHNE_LOGIN = [
	['GET', '/'],
	['GET', '/login'],
	['GET', '/login/__data.json?x-sveltekit-invalidated=01'],
	['GET', '/termine'],
	['GET', '/galerie'],
	['POST', '/api/admin/reminders/run'],
	['DELETE', '/api/mitglieder/00000000-0000-0000-0000-000000000000']
];
const MIT_LOGIN = [
	'/',
	'/termine',
	`/termine/${SEED_EVENT}`,
	`/termine/${SEED_EVENT}/teilnehmer`,
	`/termine/${SEED_EVENT}/anwesenheit`,
	`/termine/${SEED_EVENT}/bearbeiten`,
	'/termine/planung',
	'/mitglieder',
	'/mitglieder/neu',
	'/mitglieder/export',
	'/news',
	'/dokumente',
	'/geburtstage',
	'/galerie',
	'/vorstand',
	'/auswertung',
	'/benachrichtigungen',
	'/mehr',
	'/mehr/version',
	'/mehr/vorstand',
	'/gibt-es-nicht'
].map((p) => ['GET', p]);

if (args[0] === '--vergleich') vergleich(args[1], args[2]);
else if (args[0] === '--sitzung') await sitzung(args[1], args[2], args[3]);
else await aufrufen(args[0], args[1], args[2]);

async function aufrufen(dir, out, cookieFile) {
	const entry = join(dir, '.netlify/functions-internal/sveltekit-render.mjs');
	const handler = (await import(pathToFileURL(entry).href)).default;
	const cookie = cookieFile ? readFileSync(cookieFile, 'utf8') : '';
	const ctx = { waitUntil() {}, cookies: { set() {}, get() {}, delete() {} } };
	const faelle = cookie ? [...OHNE_LOGIN.slice(1, 2), ...MIT_LOGIN] : OHNE_LOGIN;
	const ergebnisse = [];
	for (const [method, path] of faelle) {
		const headers = cookie ? { cookie } : {};
		let r;
		try {
			const res = await handler(
				new Request('https://app.lions-bonn-rheinaue.de' + path, {
					method,
					headers,
					redirect: 'manual'
				}),
				ctx
			);
			const body = await res.text();
			// Sichtbarer Text ohne Skripte: Build-Hashes, Zeitstempel und die Reihenfolge
			// parallel geladener Daten ändern sich zwischen Builds, der Inhalt nicht.
			const text = body
				.replace(/<script[\s\S]*?<\/script>/g, '')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			r = {
				method,
				path,
				status: res.status,
				location: res.headers.get('location'),
				text: createHash('sha1').update(text).digest('hex').slice(0, 12),
				laenge: body.length
			};
		} catch (e) {
			r = { method, path, fehler: String(e?.stack ?? e).slice(0, 500) };
		}
		ergebnisse.push(r);
		console.log(
			String(r.status ?? 'FEHLER').padEnd(6),
			method.padEnd(6),
			path,
			r.location ?? '',
			r.fehler ?? ''
		);
	}
	writeFileSync(out, JSON.stringify(ergebnisse, null, '\t'));
	if (ergebnisse.some((r) => r.fehler || r.status >= 500)) process.exit(1);
}

function vergleich(altDatei, neuDatei) {
	const alt = JSON.parse(readFileSync(altDatei, 'utf8'));
	const neu = JSON.parse(readFileSync(neuDatei, 'utf8'));
	let abweichungen = 0;
	alt.forEach((a, i) => {
		const n = neu[i];
		const felder = ['path', 'status', 'location', 'text', 'fehler'].filter((k) => a[k] !== n?.[k]);
		if (felder.length) {
			abweichungen++;
			console.log(
				'ABWEICHUNG',
				a.method,
				a.path,
				felder.map((k) => `${k}: ${a[k]} → ${n?.[k]}`).join(', ')
			);
		}
	});
	console.log(`${alt.length - abweichungen}/${alt.length} gleich`);
	if (abweichungen) process.exit(1);
}

async function sitzung(repo, email, out) {
	const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = process.env;
	if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(API_URL ?? ''))
		throw new Error('nur gegen den lokalen Stack');
	const req = createRequire(join(repo, 'package.json'));
	const { createClient } = req('@supabase/supabase-js');
	const { createServerClient } = req('@supabase/ssr');
	const admin = createClient(API_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
	const { data: link, error: e1 } = await admin.auth.admin.generateLink({
		type: 'magiclink',
		email
	});
	if (e1) throw e1;
	const jar = new Map();
	const sb = createServerClient(API_URL, ANON_KEY, {
		cookies: {
			getAll: () => [...jar].map(([name, value]) => ({ name, value })),
			setAll: (list) =>
				list.forEach(({ name, value }) => (value ? jar.set(name, value) : jar.delete(name)))
		}
	});
	const { error: e2 } = await sb.auth.verifyOtp({
		email,
		token: link.properties.email_otp,
		type: 'email'
	});
	if (e2) throw e2;
	writeFileSync(out, [...jar].map(([n, v]) => `${n}=${encodeURIComponent(v)}`).join('; '), {
		mode: 0o600
	});
}
