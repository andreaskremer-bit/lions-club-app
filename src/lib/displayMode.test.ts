import { describe, it, expect, vi } from 'vitest';
import { isStandalone, isStandaloneMode, trackDisplayMode } from './displayMode';

/** Media-Matcher, der genau die übergebenen Queries als Treffer meldet. */
const matcherFor =
	(...hits: string[]) =>
	(query: string) =>
		hits.includes(query);

describe('isStandaloneMode', () => {
	it('erkennt den Standardfall display-mode: standalone', () => {
		expect(isStandaloneMode(matcherFor('(display-mode: standalone)'))).toBe(true);
	});

	it('erkennt fullscreen und minimal-ui als installiert', () => {
		expect(isStandaloneMode(matcherFor('(display-mode: fullscreen)'))).toBe(true);
		expect(isStandaloneMode(matcherFor('(display-mode: minimal-ui)'))).toBe(true);
	});

	it('meldet den Browser-Tab als nicht installiert', () => {
		expect(isStandaloneMode(matcherFor('(display-mode: browser)'))).toBe(false);
	});

	it('vertraut navigator.standalone auf iOS auch ohne Media-Query-Treffer', () => {
		expect(isStandaloneMode(matcherFor(), true)).toBe(true);
	});

	it('wertet navigator.standalone === false nicht als Installation', () => {
		expect(isStandaloneMode(matcherFor(), false)).toBe(false);
	});
});

describe('isStandalone', () => {
	it('liefert ohne DOM (SSR) false, statt zu werfen', () => {
		expect(isStandalone()).toBe(false);
	});
});

describe('trackDisplayMode', () => {
	it('meldet den Modus per RPC', async () => {
		const rpc = vi.fn().mockResolvedValue({ error: null });
		await trackDisplayMode({ rpc });
		expect(rpc).toHaveBeenCalledWith('track_display_mode', { standalone: false });
	});

	it('schluckt Fehler — Telemetrie darf den App-Start nie blockieren', async () => {
		const rpc = vi.fn().mockRejectedValue(new Error('offline'));
		await expect(trackDisplayMode({ rpc })).resolves.toBeUndefined();
	});
});
