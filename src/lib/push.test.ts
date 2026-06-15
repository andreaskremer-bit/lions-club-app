import { describe, it, expect } from 'vitest';
import { urlBase64ToUint8Array } from './push';

describe('urlBase64ToUint8Array', () => {
	it('dekodiert einen base64url-String ohne Padding', () => {
		// "Man" -> base64 "TWFu", base64url ohne Padding identisch.
		const out = urlBase64ToUint8Array('TWFu');
		expect(Array.from(out)).toEqual([77, 97, 110]);
	});

	it('ergänzt fehlendes Padding', () => {
		// "M" -> base64 "TQ==". Ohne Padding "TQ" muss korrekt aufgefüllt werden.
		const out = urlBase64ToUint8Array('TQ');
		expect(Array.from(out)).toEqual([77]);
	});

	it('ersetzt URL-sichere Zeichen (- und _)', () => {
		// Bytes [251, 255] -> base64 "+/8=" -> base64url "-_8".
		const out = urlBase64ToUint8Array('-_8');
		expect(Array.from(out)).toEqual([251, 255]);
	});

	it('dekodiert einen realistischen VAPID-Schlüssel auf 65 Byte (uncompressed EC point)', () => {
		const key =
			'BF42VYV3CvT4GFcoUAXg0r8cCump_PXIbqbeQ6qfKqEgr28JxTbdKSgPDiJizTPUp93H2KlkIEDhiaxs_z_Mq6M';
		const out = urlBase64ToUint8Array(key);
		expect(out.length).toBe(65);
		expect(out[0]).toBe(0x04); // uncompressed point prefix
	});
});
