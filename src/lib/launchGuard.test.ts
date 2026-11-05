import { describe, expect, it } from 'vitest';
import { checkLaunch, launchRedirect, LAUNCH_MARK_KEY, type LaunchInfo } from './launchGuard';

const base: LaunchInfo = {
	standalone: true,
	alreadyLaunched: false,
	pathname: '/termine/2c3a9a39-f113-4d38-a105-04d353b68cec',
	isNotificationLink: false
};

describe('launchRedirect', () => {
	it('leitet einen frischen App-Start auf einer Unterseite zur Startseite', () => {
		expect(launchRedirect(base)).toBe('/');
	});

	it('lässt den Browser in Ruhe (Lesezeichen, geteilte Links)', () => {
		expect(launchRedirect({ ...base, standalone: false })).toBeNull();
	});

	it('greift nur beim ersten Aufruf der App-Sitzung (Neuladen, Update)', () => {
		expect(launchRedirect({ ...base, alreadyLaunched: true })).toBeNull();
	});

	it('respektiert Push-Ziele', () => {
		expect(launchRedirect({ ...base, isNotificationLink: true })).toBeNull();
	});

	it('lässt Startseite und Login unangetastet', () => {
		expect(launchRedirect({ ...base, pathname: '/' })).toBeNull();
		expect(launchRedirect({ ...base, pathname: '/login' })).toBeNull();
	});
});

function memoryStorage(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		getItem: (k: string) => data.get(k) ?? null,
		setItem: (k: string, v: string) => void data.set(k, v),
		data
	};
}

describe('checkLaunch', () => {
	const info = { standalone: true, pathname: '/termine/x', isNotificationLink: false };

	it('leitet beim ersten Aufruf um und setzt die Markierung', () => {
		const s = memoryStorage();
		expect(checkLaunch(s, info)).toBe('/');
		expect(s.data.get(LAUNCH_MARK_KEY)).toBe('1');
		expect(checkLaunch(s, info)).toBeNull();
	});

	it('setzt die Markierung auch, wenn nicht umgeleitet wird', () => {
		const s = memoryStorage();
		expect(checkLaunch(s, { ...info, pathname: '/' })).toBeNull();
		expect(checkLaunch(s, info)).toBeNull();
	});

	it('leitet ohne nutzbares sessionStorage nie um', () => {
		expect(checkLaunch(null, info)).toBeNull();
		const throwing = {
			getItem: () => {
				throw new Error('SecurityError');
			},
			setItem: () => {}
		};
		expect(checkLaunch(throwing, info)).toBeNull();
	});
});
