/**
 * Gemeinsame CSV-Bausteine für alle Exporte (Lions-Export, Teilnehmerliste,
 * Abwesenheiten). Die Dateien sind für Excel gedacht (BOM, CRLF).
 *
 * Formel-Schutz (CSV-Injection): Mitglieder können Namen, Adressen, Begleitpersonen
 * und Freitextantworten selbst eintragen. Beginnt ein Wert mit = + - @ (oder Tab/CR),
 * wertet Excel ihn als Formel aus – z. B. ein `=HYPERLINK(…)`, das beim Klick Daten
 * anderer Zeilen nach außen schickt. Solche Werte bekommen ein führendes Hochkomma.
 *
 * Das gilt auch für Telefonnummern wie „+49-228-123456“: Excel rechnet sie sonst aus
 * (Ergebnis -123635). Ausgenommen sind nur reine Zahlen wie „-5“ oder „+3,5“.
 */
const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^[+-]?\d+([.,]\d+)?$/;

/** Neutralisiert Formel-Anfänge (siehe oben), sonst unverändert. */
export function neutralizeFormula(value: string): string {
	return FORMULA_START.test(value) && !PLAIN_NUMBER.test(value) ? `'${value}` : value;
}

/** Ein CSV-Feld: Formel-Schutz, quoten, interne Anführungszeichen verdoppeln. */
export function csvCell(v: unknown): string {
	return `"${neutralizeFormula(String(v ?? '')).replace(/"/g, '""')}"`;
}

/** Eine CSV-Zeile aus beliebigen Werten. */
export function csvRow(values: readonly unknown[]): string {
	return values.map(csvCell).join(',');
}

/** Lädt CSV-Zeilen als Datei herunter (BOM für Umlaute in Excel, CRLF). */
export function downloadCsv(lines: readonly string[], filename: string): void {
	const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	// Im Dokument einhängen und die URL erst später freigeben: WebKit (iOS-PWA) startet
	// den Download asynchron und bekäme sonst eine schon ungültige Blob-URL.
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
