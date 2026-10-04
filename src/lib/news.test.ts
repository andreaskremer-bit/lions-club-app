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

	it('lässt Satzzeichen am Ende nicht in den Link', () => {
		expect(linkify('Anmeldung unter https://lions.de/event.')).toEqual([
			{ text: 'Anmeldung unter ' },
			{ text: 'https://lions.de/event', href: 'https://lions.de/event' },
			{ text: '.' }
		]);
		expect(linkify('(siehe https://x.de/info)')).toEqual([
			{ text: '(siehe ' },
			{ text: 'https://x.de/info', href: 'https://x.de/info' },
			{ text: ')' }
		]);
	});

	it('behält eine Klammer, die zum Link gehört', () => {
		const url = 'https://de.wikipedia.org/wiki/Lions_(Club)';
		expect(linkify(`Info: ${url}`)).toEqual([{ text: 'Info: ' }, { text: url, href: url }]);
	});

	it('gibt für leeren Text ein leeres Array zurück', () => {
		expect(linkify('')).toEqual([]);
	});
});
