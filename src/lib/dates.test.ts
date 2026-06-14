import { describe, it, expect } from 'vitest';
import {
	companionAllowed,
	donationRequired,
	lionsStartYear,
	nextBirthdayInfo,
	seriesDates
} from './dates';

describe('Veranstaltungstyp-Regeln (Spec §4.2)', () => {
	it('Begleitperson erlaubt', () => {
		expect(companionAllowed('clubabend')).toBe(true);
		expect(companionAllowed('reise')).toBe(true);
		expect(companionAllowed('gesellig')).toBe(true);
		expect(companionAllowed('versammlung')).toBe(false);
		expect(companionAllowed('lions_termin')).toBe(false);
	});
	it('Spendenpflicht', () => {
		expect(donationRequired('clubabend')).toBe(true);
		expect(donationRequired('versammlung')).toBe(true);
		expect(donationRequired('reise')).toBe(false);
		expect(donationRequired('gesellig')).toBe(false);
		expect(donationRequired('lions_termin')).toBe(false);
	});
});

describe('lionsStartYear (1.7.–30.6.)', () => {
	it('Juli beginnt neues Lions-Jahr', () => {
		expect(lionsStartYear(new Date(2026, 6, 1))).toBe(2026); // 1. Juli 2026
		expect(lionsStartYear(new Date(2026, 5, 30))).toBe(2025); // 30. Juni 2026
		expect(lionsStartYear(new Date(2026, 0, 15))).toBe(2025); // Januar 2026
	});
});

describe('nextBirthdayInfo', () => {
	it('Geburtstag heute', () => {
		const info = nextBirthdayInfo('1980-03-12', new Date(2026, 2, 12));
		expect(info.today).toBe(true);
		expect(info.days).toBe(0);
		expect(info.turning).toBe(46);
	});
	it('später im Jahr', () => {
		const info = nextBirthdayInfo('1980-03-20', new Date(2026, 2, 12));
		expect(info.days).toBe(8);
		expect(info.turning).toBe(46);
	});
	it('bereits vorbei → nächstes Jahr', () => {
		const info = nextBirthdayInfo('1980-01-01', new Date(2026, 2, 12));
		expect(info.date.getFullYear()).toBe(2027);
		expect(info.turning).toBe(47);
	});
});

describe('seriesDates', () => {
	const iso = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
	it('wöchentlich', () => {
		const ds = seriesDates(new Date(2026, 8, 1, 19, 0), 'weekly', 3);
		expect(ds.map(iso)).toEqual(['2026-9-1', '2026-9-8', '2026-9-15']);
	});
	it('14-täglich', () => {
		const ds = seriesDates(new Date(2026, 8, 1), 'biweekly', 3);
		expect(ds.map(iso)).toEqual(['2026-9-1', '2026-9-15', '2026-9-29']);
	});
	it('monatlich (gleiches Datum, mit Jahreswechsel)', () => {
		const ds = seriesDates(new Date(2026, 10, 8), 'monthly', 3);
		expect(ds.map(iso)).toEqual(['2026-11-8', '2026-12-8', '2027-1-8']);
	});
	it('behält die Uhrzeit', () => {
		const ds = seriesDates(new Date(2026, 8, 1, 19, 30), 'weekly', 2);
		expect(ds[1].getHours()).toBe(19);
		expect(ds[1].getMinutes()).toBe(30);
	});
});
