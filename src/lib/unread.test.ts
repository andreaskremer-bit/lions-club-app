import { describe, expect, it } from 'vitest';
import { notificationIdFromHash } from './unread';

describe('notificationIdFromHash', () => {
	it('liest die Outbox-ID aus dem Fragment', () => {
		expect(notificationIdFromHash('#n=0b7c2a3e-1f4d-4e5a-9b6c-7d8e9f0a1b2c')).toBe(
			'0b7c2a3e-1f4d-4e5a-9b6c-7d8e9f0a1b2c'
		);
	});
	it('ignoriert andere Fragmente', () => {
		expect(notificationIdFromHash('')).toBeNull();
		expect(notificationIdFromHash('#top')).toBeNull();
		expect(notificationIdFromHash('#n=kein-uuid')).toBeNull();
	});
});
