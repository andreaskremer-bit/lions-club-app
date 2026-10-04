import { describe, it, expect } from 'vitest';
import { isOwnStoragePath } from './storagePath';

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
