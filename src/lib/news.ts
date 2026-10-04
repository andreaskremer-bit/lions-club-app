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
 * Satzzeichen am Ende gehören nicht zum Link („siehe https://x.de/info.“), eine
 * schließende Klammer nur, wenn der Link selbst eine öffnet (Wikipedia-Stil).
 */
function trimTrailing(url: string): string {
	let u = url;
	for (;;) {
		const last = u.at(-1);
		if (last && '.,;:!?\'"“‘»'.includes(last)) u = u.slice(0, -1);
		else if (last === ')' && (u.match(/\(/g)?.length ?? 0) < (u.match(/\)/g)?.length ?? 0))
			u = u.slice(0, -1);
		else return u;
	}
}

/**
 * Zerlegt Klartext in Text- und Link-Segmente, damit URLs im Feed sicher als
 * Links gerendert werden können (Svelte escaped den Text, kein HTML-Inject).
 */
export function linkify(text: string): TextSegment[] {
	const out: TextSegment[] = [];
	let last = 0;
	for (const m of text.matchAll(URL_RE)) {
		const start = m.index ?? 0;
		const url = trimTrailing(m[0]);
		if (start > last) out.push({ text: text.slice(last, start) });
		out.push({ text: url, href: url });
		last = start + url.length;
	}
	if (last < text.length) out.push({ text: text.slice(last) });
	return out;
}
