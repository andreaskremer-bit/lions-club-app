// P3 — Mitglieder-Export für die Meldung an Lions Deutschland (Wiesbaden).
// Reiner Helfer (testbar); die Seite kümmert sich um Laden + Download.
// Allgemeines CSV (Excel-tauglich): später bei Bedarf aufs echte Lions-Template
// mappen. Bewusst OHNE Partner-/Notizfelder (DSGVO-Datensparsamkeit).

export type MemberStatus = 'aktiv' | 'inaktiv' | 'ehrenmitglied';

export type ExportMember = {
	lions_member_no: string | null;
	title: string | null;
	first_name: string;
	last_name: string;
	status: MemberStatus;
	email: string | null;
	phone: string | null;
	mobile: string | null;
	phone_office: string | null;
	street: string | null;
	zip: string | null;
	city: string | null;
	birthday: string | null; // 'YYYY-MM-DD'
	joined_on: string | null; // 'YYYY-MM-DD'
};

const STATUS_LABEL: Record<MemberStatus, string> = {
	aktiv: 'aktiv',
	inaktiv: 'inaktiv',
	ehrenmitglied: 'Ehrenmitglied'
};

const HEADERS = [
	'Mitgliedsnummer',
	'Titel',
	'Vorname',
	'Nachname',
	'Status',
	'E-Mail',
	'Festnetz',
	'Mobil',
	'Büro-Telefon',
	'Straße',
	'PLZ',
	'Ort',
	'Geburtstag',
	'Eintrittsdatum'
] as const;

/** ISO-Datum (YYYY-MM-DD) → DD.MM.YYYY; leer bei null/ungültig. */
export function formatDate(iso: string | null): string {
	if (!iso) return '';
	const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
	return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
}

/** Ein CSV-Feld quoten und interne Anführungszeichen verdoppeln. */
function csvCell(v: string | null): string {
	return `"${String(v ?? '').replace(/"/g, '""')}"`;
}

function row(m: ExportMember): string {
	return [
		m.lions_member_no,
		m.title,
		m.first_name,
		m.last_name,
		STATUS_LABEL[m.status],
		m.email,
		m.phone,
		m.mobile,
		m.phone_office,
		m.street,
		m.zip,
		m.city,
		formatDate(m.birthday),
		formatDate(m.joined_on)
	]
		.map(csvCell)
		.join(',');
}

/**
 * Baut das CSV (Kopfzeile + eine Zeile je Mitglied), CRLF-getrennt, ohne BOM.
 * Die aufrufende Seite stellt der Blob-Erzeugung das BOM (U+FEFF) voran, damit
 * Umlaute in Excel korrekt erscheinen.
 */
export function buildMemberCsv(members: ExportMember[]): string {
	const lines = [HEADERS.map(csvCell).join(',')];
	for (const m of members) lines.push(row(m));
	return lines.join('\r\n');
}

/** Dateiname mit aktuellem Datum, z. B. lions-mitglieder_2026-06-16.csv */
export function exportFilename(today = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	const d = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
	return `lions-mitglieder_${d}.csv`;
}
