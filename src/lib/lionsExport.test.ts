import { describe, it, expect } from 'vitest';
import { buildMemberCsv, formatDate, exportFilename, type ExportMember } from './lionsExport';

const base: ExportMember = {
	lions_member_no: '1234567',
	title: 'Dr.',
	first_name: 'Anna',
	last_name: 'Aktiv',
	status: 'aktiv',
	email: 'anna@example.com',
	phone: '0228 123',
	mobile: '0170 456',
	phone_office: '0228 999',
	street: 'Hauptstr. 1',
	zip: '53113',
	city: 'Bonn',
	birthday: '1980-09-15',
	joined_on: '2010-01-01'
};

describe('formatDate', () => {
	it('wandelt ISO in DD.MM.YYYY', () => {
		expect(formatDate('1980-09-15')).toBe('15.09.1980');
	});
	it('liefert leer bei null/ungültig', () => {
		expect(formatDate(null)).toBe('');
		expect(formatDate('kaputt')).toBe('');
	});
});

describe('buildMemberCsv', () => {
	it('beginnt mit der Kopfzeile und CRLF', () => {
		const csv = buildMemberCsv([base]);
		const lines = csv.split('\r\n');
		expect(lines[0]).toContain('"Titel"');
		expect(lines[0]).toContain('"Eintrittsdatum"');
		expect(lines).toHaveLength(2);
	});

	it('mappt Felder, Status-Label und Datumsformat', () => {
		const csv = buildMemberCsv([base]);
		const dataLine = csv.split('\r\n')[1];
		expect(dataLine).toContain('"Anna"');
		expect(dataLine).toContain('"aktiv"');
		expect(dataLine).toContain('"15.09.1980"');
		expect(dataLine).toContain('"01.01.2010"');
	});

	it('zeigt Ehrenmitglied als Label und leert leere Felder', () => {
		const csv = buildMemberCsv([
			{ ...base, status: 'ehrenmitglied', mobile: null, birthday: null }
		]);
		const dataLine = csv.split('\r\n')[1];
		expect(dataLine).toContain('"Ehrenmitglied"');
		// leeres Mobil + leerer Geburtstag → leere gequotete Zellen
		expect(dataLine).toContain('""');
	});

	it('escaped Anführungszeichen durch Verdopplung', () => {
		const csv = buildMemberCsv([{ ...base, city: 'Bad "Godesberg"' }]);
		expect(csv).toContain('"Bad ""Godesberg"""');
	});

	it('liefert nur die Kopfzeile bei leerer Liste', () => {
		expect(buildMemberCsv([]).split('\r\n')).toHaveLength(1);
	});
});

describe('exportFilename', () => {
	it('enthält das Datum im ISO-Format', () => {
		expect(exportFilename(new Date(2026, 5, 16))).toBe('lions-mitglieder_2026-06-16.csv');
	});
});
