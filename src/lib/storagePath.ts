/**
 * Liegt ein Storage-Pfad unter dem Ordner des eigenen Datensatzes („<id>/…“)?
 *
 * Vor jedem Löschen prüfen: Der Pfad steht in einer Spalte, die andere vorher geändert
 * haben könnten. Ohne Prüfung würde die Sitzung der löschenden Person eine fremde Datei
 * entfernen (Security-Scan 2026-10-04, F9/F10/F12). Die Datenbank erzwingt dasselbe per
 * CHECK (Migration 20261004120200); das hier ist die zweite Linie für Altbestand.
 */
export function isOwnStoragePath(id: string, path: string | null | undefined): path is string {
	return !!path && path.startsWith(`${id}/`) && !path.includes('..');
}

/**
 * Dateiname für einen Storage-Pfad: nur Buchstaben, Ziffern, `_`, `.` und `-`, und keine
 * Punktfolgen (`..`), die die Datenbankregel für Pfade ablehnt (Migration 20261004120200).
 */
export function safeFileName(name: string): string {
	const cleaned = name
		.replace(/[^\w.-]+/g, '_')
		.replace(/\.{2,}/g, '.')
		.replace(/^\.+/, '');
	return cleaned || 'datei';
}
