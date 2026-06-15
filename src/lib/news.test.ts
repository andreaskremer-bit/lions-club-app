import { describe, it, expect } from 'vitest';
import { linkify } from './news';

describe('linkify', () => {
	it('gibt reinen Text als ein Segment ohne href zurück', () => {
		expect(linkify('Hallo Welt')).toEqual([{ text: 'Hallo Welt' }]);
	});

	it('erkennt eine URL im Text', () => {
		expect(linkify('Mehr unter https://lions-bonn-rheinaue.de heute')).toEqual([
			{ text: 'Mehr unter ' },
			{ text: 'https://lions-bonn-rheinaue.de', href: 'https://lions-bonn-rheinaue.de' },
			{ text: ' heute' }
		]);
	});

	it('behandelt eine URL am Anfang und am Ende', () => {
		expect(linkify('http://a.de text http://b.de')).toEqual([
			{ text: 'http://a.de', href: 'http://a.de' },
			{ text: ' text ' },
			{ text: 'http://b.de', href: 'http://b.de' }
		]);
	});

	it('gibt für leeren Text ein leeres Array zurück', () => {
		expect(linkify('')).toEqual([]);
	});
});
