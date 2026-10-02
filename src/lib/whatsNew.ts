// Hinweis „Neu in der App“ nach einem Update.
//
// Maßstab ist der von Hand gepflegte Changelog, NICHT der Commit-Hash: Ein
// Deploy ohne sichtbare Änderung bringt keinen Changelog-Eintrag und soll auch
// keinen Hinweis auslösen. Gemerkt wird das Datum des neuesten gesehenen
// Eintrags, pro Gerät im localStorage – eine reine Komfortfunktion, keine
// Personendaten, deshalb auch nicht im Logout-Wipe. Wer zwei Geräte nutzt,
// sieht den Hinweis zweimal; das ist gewollt einfacher als eine DB-Spalte.
//
// Kommen am selben Tag weitere Änderungen dazu (gleiches Datum), erscheint der
// Hinweis für Geräte, die diesen Tag schon gesehen haben, nicht erneut.

import { CHANGELOG, type ChangelogEntry } from './changelog';

const STORAGE_KEY = 'lions-changelog-seen';

/**
 * Changelog-Einträge, die neuer sind als `seen` (ISO-Datum). Ohne gespeicherten
 * Wert zählt nur der neueste Eintrag – sonst bekäme ein Gerät beim ersten Mal
 * die ganze Historie präsentiert.
 */
export function unseenEntries(
	seen: string | null,
	changelog: ChangelogEntry[] = CHANGELOG
): ChangelogEntry[] {
	if (!seen) return changelog.slice(0, 1);
	return changelog.filter((entry) => entry.date > seen);
}

/** Datum des neuesten Changelog-Eintrags (oder `null` bei leerem Changelog). */
export function latestChangelogDate(changelog: ChangelogEntry[] = CHANGELOG): string | null {
	return changelog[0]?.date ?? null;
}

// localStorage kann in privaten Fenstern oder bei gesperrten Website-Daten
// werfen – dann einfach keinen Hinweis zeigen, statt die App zu stören.
export function readSeen(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

export function markChangelogSeen(): void {
	const latest = latestChangelogDate();
	if (!latest) return;
	try {
		localStorage.setItem(STORAGE_KEY, latest);
	} catch {
		// siehe readSeen
	}
}

/** Ist localStorage nutzbar? Ohne Speicher würde der Hinweis bei jedem Start kommen. */
export function storageAvailable(): boolean {
	try {
		const probe = `${STORAGE_KEY}-probe`;
		localStorage.setItem(probe, '1');
		localStorage.removeItem(probe);
		return true;
	} catch {
		return false;
	}
}
