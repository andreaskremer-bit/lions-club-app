import { describe, it, expect } from 'vitest';
import { isOwnStoragePath, safeFileName } from './storagePath';

describe('isOwnStoragePath', () => {
	const id = '11111111-1111-1111-1111-111111111111';

	it('akzeptiert Pfade unter der eigenen Id', () => {
		expect(isOwnStoragePath(id, `${id}/avatar_1.jpg`)).toBe(true);
	});

	it('lehnt fremde, leere und manipulierte Pfade ab', () => {
		expect(isOwnStoragePath(id, '22222222-2222-2222-2222-222222222222/Satzung.pdf')).toBe(false);
		expect(isOwnStoragePath(id, `${id}-x/a.jpg`)).toBe(false);
		expect(isOwnStoragePath(id, `${id}/../other/a.jpg`)).toBe(false);
		expect(isOwnStoragePath(id, null)).toBe(false);
		expect(isOwnStoragePath(id, '')).toBe(false);
	});
});

describe('safeFileName', () => {
	it('ersetzt Sonderzeichen und fasst Punktfolgen zusammen', () => {
		expect(safeFileName('Bericht..pdf')).toBe('Bericht.pdf');
		expect(safeFileName('Protokoll Mai 2026 (final)...pdf')).toBe('Protokoll_Mai_2026_final_.pdf');
		expect(safeFileName('..geheim')).toBe('geheim');
		expect(safeFileName('Übersicht.pdf')).toBe('_bersicht.pdf');
	});

	it('liefert nie einen leeren Namen', () => {
		expect(safeFileName('...')).toBe('datei');
	});
});
