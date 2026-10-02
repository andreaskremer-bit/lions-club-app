/**
 * Was ist neu — die für Mitglieder sichtbaren Änderungen.
 *
 * Bewusst von Hand gepflegt und NICHT aus Commit-Messages erzeugt: Commits
 * sind Entwicklerprosa („fix(pwa): Offline-Seite bekommt eine eigene
 * Versionsspur“), hier steht, was ein Mitglied davon merkt. Nur Einträge
 * aufnehmen, die jemand ohne Vorwissen bemerken oder nutzen kann — interne
 * Umbauten, Migrationen und Testabdeckung gehören nach `MEILENSTEINE.md`.
 *
 * Sicherheitsfixes werden hier NUR neutral zusammengefasst („Sicherheit und
 * Stabilität verbessert“). Details würden jedem, der einen Screenshot sieht,
 * verraten, was vorher offen war, und Mitglieder können ohnehin nichts tun —
 * der Fix ist beim Lesen längst ausgeliefert. Nachvollziehbar dokumentiert
 * sind sie in `MEILENSTEINE.md`.
 *
 * Bringt ein Deploy nichts Sichtbares, ändert sich nur die Versionsnummer und
 * es kommt kein Eintrag dazu. Ein Changelog mit vier Monate altem letzten
 * Eintrag wirkt schlechter als gar keiner.
 */

export type ChangeKind = 'neu' | 'verbessert' | 'behoben';

export type ChangelogEntry = {
	/** ISO-Datum (YYYY-MM-DD) des Stands — entspricht der Versionsnummer. */
	date: string;
	changes: { kind: ChangeKind; text: string }[];
};

/** Neueste zuerst. */
export const CHANGELOG: ChangelogEntry[] = [
	{
		date: '2026-10-02',
		changes: [
			{
				kind: 'verbessert',
				text: 'Ein Termin, der gerade läuft, bleibt bis zu seinem Ende unter „Anstehend“ und ist mit „Läuft gerade“ markiert. Außerdem zeigt die App nach einem Update einmal kurz, was neu ist.'
			}
		]
	},
	{
		date: '2026-09-03',
		changes: [
			{
				kind: 'verbessert',
				text: 'Bleibt die App lange geöffnet, erkennt sie jetzt selbst, wenn eine neue Version bereitsteht, und bietet das Neuladen an. Spätestens beim nächsten Seitenwechsel ist der aktuelle Stand da.'
			},
			{
				kind: 'neu',
				text: 'Die Teilnehmerliste eines Termins (mit CSV-Export) steht jetzt auch dem Sekretär zur Verfügung, zum Beispiel für das Protokoll.'
			},
			{
				kind: 'neu',
				text: 'Unter den Meldungen eines Termins gibt es eine neue Gruppe „Gäste“, die alle angemeldeten Begleitpersonen mit Namen aufführt.'
			}
		]
	},
	{
		date: '2026-08-13',
		changes: [{ kind: 'verbessert', text: 'Verbesserungen bei Funktionalität und Stabilität.' }]
	},
	{
		date: '2026-08-04',
		changes: [
			{
				kind: 'behoben',
				text: 'Der Link in einer Benachrichtigung zu einem neuen Beitrag oder Dokument führte auf eine Fehlerseite. Er öffnet jetzt die passende Übersicht.'
			},
			{
				kind: 'verbessert',
				text: 'Die App startet jetzt auch ohne Internet und zeigt die zuletzt geöffnete Seite. Ist gar keine Verbindung da, erscheint ein Hinweis statt der Fehlerseite des Browsers.'
			},
			{
				kind: 'verbessert',
				text: 'Mitgliederfotos werden auf dem Gerät zwischengespeichert und laden dadurch spürbar schneller. Beim Ausloggen werden sie wieder gelöscht.'
			},
			{
				kind: 'neu',
				text: 'Unter Mehr steht jetzt die Versionsnummer der App – ein Tipp darauf öffnet diese Übersicht.'
			}
		]
	},
	{
		date: '2026-08-03',
		changes: [{ kind: 'verbessert', text: 'Sicherheit und Stabilität verbessert.' }]
	},
	{
		date: '2026-07-28',
		changes: [
			{
				kind: 'behoben',
				text: 'Auf dem iPhone ist die Navigationsleiste am unteren Rand beim Scrollen mitgewandert.'
			}
		]
	},
	{
		date: '2026-07-20',
		changes: [
			{
				kind: 'verbessert',
				text: 'Benachrichtigungen per E-Mail sind übersichtlicher gestaltet und führen mit einem Klick direkt zum passenden Termin, Dokument oder Beitrag.'
			}
		]
	},
	{
		date: '2026-07-19',
		changes: [
			{
				kind: 'verbessert',
				text: 'Bei Terminen zählen Begleitpersonen in der Anmeldezahl mit. Die Meldungen-Ansicht zeigt zusätzlich, wer noch nicht geantwortet hat.'
			},
			{
				kind: 'verbessert',
				text: 'Die Anwesenheitserfassung ist nach Zu- und Absagen gruppiert und damit schneller auszufüllen.'
			}
		]
	},
	{
		date: '2026-07-17',
		changes: [
			{
				kind: 'neu',
				text: 'Die Sitzungsprotokolle der vergangenen Jahre liegen unter Dokumente und sind dort im Volltext durchsuchbar.'
			}
		]
	},
	{
		date: '2026-07-16',
		changes: [
			{
				kind: 'neu',
				text: 'Die App ist für alle Mitglieder freigeschaltet: Verzeichnis, Termine mit Zu- und Absage, Anwesenheit, Geburtstage, Dokumente, News und Galerie.'
			},
			{
				kind: 'neu',
				text: 'Benachrichtigungen zu Terminen, Geburtstagen, neuen Dokumenten und Beiträgen – in der App, per E-Mail und auf Wunsch als Push-Mitteilung. Den Kanal wählst du unter Mehr → Benachrichtigungen.'
			}
		]
	}
];

const MONATE = [
	'Januar',
	'Februar',
	'März',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
];

/** `2026-08-04` → `4. August 2026`. */
export function formatChangelogDate(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	if (!y || !m || !d || m < 1 || m > 12) return iso;
	return `${d}. ${MONATE[m - 1]} ${y}`;
}

/** `2026-08-04` → `2026.08.04` — dieselbe Schreibweise wie die Versionsnummer. */
export function changelogVersion(iso: string): string {
	return iso.replaceAll('-', '.');
}
