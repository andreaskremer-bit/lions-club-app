// News-Helfer (M6).

export type NewsPost = {
	id: string;
	title: string;
	body: string;
	pinned: boolean;
	published_at: string;
};

export type TextSegment = { text: string; href?: string };

const URL_RE = /(https?:\/\/[^\s]+)/g;

/**
 * Zerlegt Klartext in Text- und Link-Segmente, damit URLs im Feed sicher als
 * Links gerendert werden können (Svelte escaped den Text, kein HTML-Inject).
 */
export function linkify(text: string): TextSegment[] {
	const out: TextSegment[] = [];
	let last = 0;
	for (const m of text.matchAll(URL_RE)) {
		const start = m.index ?? 0;
		if (start > last) out.push({ text: text.slice(last, start) });
		out.push({ text: m[0], href: m[0] });
		last = start + m[0].length;
	}
	if (last < text.length) out.push({ text: text.slice(last) });
	return out;
}
