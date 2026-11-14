import { describe, expect, it } from 'vitest';
import {
	CSP_REPORT_PATH,
	SECURITY_HEADERS,
	cspDirectives,
	summarizeCspReport
} from './securityHeaders';

describe('SECURITY_HEADERS', () => {
	it('verbietet das Einbetten und kürzt den Referrer', () => {
		expect(SECURITY_HEADERS['X-Frame-Options']).toBe('DENY');
		expect(SECURITY_HEADERS['Referrer-Policy']).toBe('same-origin');
		expect(SECURITY_HEADERS['Permissions-Policy']).toContain('camera=()');
	});
});

describe('cspDirectives', () => {
	const prod = cspDirectives({ supabaseUrl: 'https://abc.supabase.co/rest/v1' });

	it('erlaubt Skripte nur von der eigenen Adresse, nie inline', () => {
		expect(prod['script-src']).toEqual(["'self'"]);
		expect(prod['default-src']).toEqual(["'self'"]);
		expect(prod['object-src']).toEqual(["'none'"]);
	});

	it('erlaubt ins CSS eingebettete Schriften', () => {
		expect(prod['font-src']).toEqual(["'self'", 'data:']);
	});

	it('nimmt von der Supabase-Adresse nur den Ursprung', () => {
		expect(prod['connect-src']).toEqual(["'self'", 'https://abc.supabase.co']);
		expect(prod['img-src']).toContain('https://abc.supabase.co');
	});

	it('verbietet das Einbetten und meldet an den eigenen Endpunkt', () => {
		expect(prod['frame-ancestors']).toEqual(["'none'"]);
		// Ohne `report-uri` bricht SvelteKit den Build im Report-Only-Modus ab.
		expect(prod['report-uri']).toEqual([CSP_REPORT_PATH]);
	});

	it('öffnet WebSockets nur für den Dev-Server', () => {
		expect(prod['connect-src']).not.toContain('ws:');
		expect(
			cspDirectives({ supabaseUrl: 'http://127.0.0.1:54321', dev: true })['connect-src']
		).toEqual(["'self'", 'ws:', 'http://127.0.0.1:54321']);
	});

	it('übersteht eine fehlende oder kaputte Supabase-Adresse', () => {
		expect(cspDirectives({ supabaseUrl: undefined })['connect-src']).toEqual(["'self'"]);
		expect(cspDirectives({ supabaseUrl: 'kein-url' })['connect-src']).toEqual(["'self'"]);
	});
});

describe('summarizeCspReport', () => {
	const id = '3f2b8c1e-1111-4222-8333-abcdefabcdef';

	it('fasst eine report-uri-Meldung in einer Zeile zusammen', () => {
		const raw = JSON.stringify({
			'csp-report': {
				'document-uri': `https://app.example/mitglieder/${id}?x=1`,
				'effective-directive': 'img-src',
				'blocked-uri': 'https://cdn.example/bild.png?token=geheim',
				'source-file': 'https://app.example/_app/immutable/nodes/3.js',
				'line-number': 12
			}
		});
		expect(summarizeCspReport(raw)).toBe(
			'img-src blockiert https://cdn.example/bild.png auf /mitglieder/:id ' +
				'(Quelle https://app.example/_app/immutable/nodes/3.js:12)'
		);
	});

	it('lässt weder IDs noch Query-Token ins Log', () => {
		const line = summarizeCspReport(
			JSON.stringify({
				'csp-report': {
					'document-uri': `https://app.example/termine/${id}`,
					'violated-directive': 'connect-src',
					'blocked-uri': `https://x.example/storage/${id}/a.jpg?token=geheim`
				}
			})
		);
		expect(line).not.toContain(id);
		expect(line).not.toContain('geheim');
	});

	it('versteht die Reporting-API und Schlüsselwörter wie inline', () => {
		const raw = JSON.stringify([
			{
				type: 'csp-violation',
				body: {
					documentURL: 'https://app.example/news',
					effectiveDirective: 'script-src-elem',
					blockedURL: 'inline'
				}
			}
		]);
		expect(summarizeCspReport(raw)).toBe('script-src-elem blockiert inline auf /news');
	});

	it('verwirft alles, was keine Meldung ist', () => {
		expect(summarizeCspReport('kein json')).toBeNull();
		expect(summarizeCspReport('[]')).toBeNull();
		expect(summarizeCspReport('{"csp-report":{}}')).toBeNull();
		expect(summarizeCspReport('"text"')).toBeNull();
	});
});
