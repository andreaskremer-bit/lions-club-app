// Sample club data for the Lions Club Bonn-Rheinaue UI kit.
// Fictional members & events — illustrative only.
window.LC_DATA = {
	me: { id: 'm1', name: 'Andreas Kremer', role: 'Präsident', initials: 'AK' },
	members: [
		{
			id: 'm1',
			name: 'Andreas Kremer',
			role: 'Präsident',
			status: 'aktiv',
			tone: 'blue',
			phone: '+49 170 1234567',
			email: 'a.kremer@example.de',
			partner: 'Birgit Kremer'
		},
		{
			id: 'm2',
			name: 'Maria Vogt',
			role: 'Schatzmeisterin',
			status: 'aktiv',
			tone: 'gold',
			phone: '+49 171 2345678',
			email: 'm.vogt@example.de',
			partner: 'Klaus Vogt'
		},
		{
			id: 'm3',
			name: 'Dr. Jens Berg',
			role: 'Sekretär',
			status: 'aktiv',
			tone: 'cream',
			phone: '+49 172 3456789',
			email: 'j.berg@example.de',
			partner: ''
		},
		{
			id: 'm4',
			name: 'Petra Lindner',
			role: 'Vizepräsidentin',
			status: 'aktiv',
			tone: 'blue',
			phone: '+49 173 4567890',
			email: 'p.lindner@example.de',
			partner: 'Thomas Lindner'
		},
		{
			id: 'm5',
			name: 'Wolfgang Reuter',
			role: 'Clubmaster',
			status: 'aktiv',
			tone: 'gold',
			phone: '+49 174 5678901',
			email: 'w.reuter@example.de',
			partner: 'Sabine Reuter'
		},
		{
			id: 'm6',
			name: 'Heinz Albers',
			role: 'Mitglied',
			status: 'Ehrenmitglied',
			tone: 'cream',
			phone: '+49 175 6789012',
			email: 'h.albers@example.de',
			partner: 'Inge Albers'
		},
		{
			id: 'm7',
			name: 'Claudia Brandt',
			role: 'Mitglied',
			status: 'aktiv',
			tone: 'blue',
			phone: '+49 176 7890123',
			email: 'c.brandt@example.de',
			partner: ''
		},
		{
			id: 'm8',
			name: 'Michael Sommer',
			role: 'Webmaster',
			status: 'aktiv',
			tone: 'gold',
			phone: '+49 177 8901234',
			email: 'm.sommer@example.de',
			partner: 'Eva Sommer'
		},
		{
			id: 'm9',
			name: 'Renate Hofmann',
			role: 'Mitglied',
			status: 'inaktiv',
			tone: 'cream',
			phone: '+49 178 9012345',
			email: 'r.hofmann@example.de',
			partner: 'Peter Hofmann'
		},
		{
			id: 'm10',
			name: 'Frank Wolff',
			role: 'Past-Präsident',
			status: 'aktiv',
			tone: 'blue',
			phone: '+49 179 0123456',
			email: 'f.wolff@example.de',
			partner: 'Anna Wolff'
		},
		{
			id: 'm11',
			name: 'Ursula Krämer',
			role: 'Mitglied',
			status: 'aktiv',
			tone: 'gold',
			phone: '+49 160 1112233',
			email: 'u.kraemer@example.de',
			partner: ''
		},
		{
			id: 'm12',
			name: 'Bernd Schäfer',
			role: 'Mitglied',
			status: 'aktiv',
			tone: 'cream',
			phone: '+49 161 2223344',
			email: 'b.schaefer@example.de',
			partner: 'Marion Schäfer'
		}
	],
	// NOTE: `title` = program/theme of the evening; `type` is shown only as a badge.
	// `questions` drives the per-event Zusatzabfragen on the detail screen.
	//   kind: 'single' | 'multi' | 'text' | 'bool' | 'number'
	//   scope: 'person' (default — asked for the member AND each Begleitperson)
	//          'group'  (asked once for the whole booking, e.g. room/travel)
	events: [
		{
			id: 'e1',
			title: 'Thalia Buchhandlung – gestern, heute, morgen',
			type: 'Club-Abend',
			typeKey: 'clubabend',
			date: '12.06.',
			day: '12',
			monShort: 'Jun',
			weekday: 'Do',
			time: '19:00',
			month: 'Juni 2026',
			iso: '2026-06-12',
			phase: 'past',
			location: 'Restaurant Rheinblick',
			city: 'Bonn',
			companion: true,
			status: 'yes',
			yes: 21,
			no: 4,
			open: 9,
			present: 19,
			desc: 'Vortrag von Frau Sander (Thalia Bonn) über den Wandel des stationären Buchhandels. Anschließend gemeinsames Essen.',
			questions: [
				{
					id: 'menu',
					kind: 'single',
					label: 'Menüauswahl',
					icon: 'utensils',
					required: true,
					options: ['Rinderfilet', 'Lachsfilet', 'Vegetarische Variante']
				},
				{
					id: 'allergy',
					kind: 'text',
					label: 'Unverträglichkeiten',
					icon: 'info',
					placeholder: 'z. B. Nüsse, Laktose … (optional)'
				}
			]
		},
		{
			id: 'e2',
			title: 'Jahreshauptversammlung & Vorstandswahl',
			type: 'Versammlung',
			typeKey: 'versammlung',
			date: '26.06.',
			day: '26',
			monShort: 'Jun',
			weekday: 'Do',
			time: '19:00',
			month: 'Juni 2026',
			iso: '2026-06-26',
			phase: 'upcoming',
			location: 'Restaurant Rheinblick',
			city: 'Bonn',
			companion: false,
			status: 'open',
			yes: 12,
			no: 2,
			open: 20,
			desc: 'Wahl des neuen Vorstands, Kassenbericht und Jahresplanung. Findet statt eines Clubabends statt.',
			questions: []
		},
		{
			id: 'e3',
			title: 'Sommerfest im Garten',
			type: 'Gesellig',
			typeKey: 'gesellig',
			date: '06.07.',
			day: '06',
			monShort: 'Jul',
			weekday: 'Mo',
			time: '16:00',
			month: 'Juli 2026',
			iso: '2026-07-06',
			phase: 'upcoming',
			location: 'Garten Familie Kremer',
			city: 'Bonn-Bad Godesberg',
			companion: true,
			status: 'yes',
			yes: 28,
			no: 1,
			open: 5,
			desc: 'Sommerfest mit Familien und Partnern. Für Grillgut ist gesorgt — bitte etwas zum Buffet beisteuern.',
			questions: [
				{
					id: 'buffet',
					kind: 'multi',
					label: 'Was bringst du mit?',
					icon: 'utensils',
					options: ['Salat', 'Nachtisch', 'Getränke', 'Fingerfood']
				},
				{ id: 'veggie', kind: 'bool', label: 'Vegetarisches Essen gewünscht?', icon: 'leaf' },
				{
					id: 'guests',
					kind: 'number',
					label: 'Kinder',
					icon: 'users',
					min: 0,
					max: 6,
					unit: 'Kind/er',
					scope: 'group'
				}
			]
		},
		{
			id: 'e4',
			title: 'Distriktversammlung 111-RN',
			type: 'Lions-Termin',
			typeKey: 'lions',
			date: '28.06.',
			day: '28',
			monShort: 'Jun',
			weekday: 'So',
			time: '10:00',
			month: 'Juni 2026',
			iso: '2026-06-28',
			phase: 'upcoming',
			location: 'Maritim Hotel',
			city: 'Köln',
			companion: false,
			status: 'no',
			yes: 6,
			no: 8,
			open: 20,
			desc: 'Offizielle Distriktversammlung 111-RN mit Delegierten der Region. Anmeldung über das Distriktbüro.',
			questions: []
		},
		{
			id: 'e5',
			title: 'Club-Reise in die Toskana',
			type: 'Club-Reise',
			typeKey: 'reise',
			date: '18.09.',
			day: '18',
			monShort: 'Sep',
			weekday: 'Fr',
			time: '08:00',
			month: 'September 2026',
			iso: '2026-09-18',
			phase: 'upcoming',
			location: 'Abfahrt Bonn Hbf',
			city: 'Toskana, IT',
			companion: true,
			status: 'open',
			yes: 14,
			no: 3,
			open: 17,
			desc: 'Viertägige Clubreise in die Toskana mit Weingut-Besuch und Florenz-Tag. Bitte Zimmerwunsch und Anreise angeben.',
			questions: [
				{
					id: 'menu',
					kind: 'single',
					label: 'Menü Gala-Abend',
					icon: 'utensils',
					required: true,
					options: ['Fleisch', 'Fisch', 'Vegetarisch']
				},
				{
					id: 'room',
					kind: 'single',
					label: 'Zimmerwunsch',
					icon: 'bed-double',
					required: true,
					scope: 'group',
					options: ['Einzelzimmer', 'Doppelzimmer', 'Doppelzimmer zur Einzelnutzung']
				},
				{
					id: 'travel',
					kind: 'single',
					label: 'Anreise',
					icon: 'bus',
					scope: 'group',
					options: ['Bus ab Bonn Hbf', 'Eigene Anreise']
				},
				{
					id: 'nights',
					kind: 'number',
					label: 'Zusätzliche Nächte',
					icon: 'moon',
					min: 0,
					max: 4,
					unit: 'Nacht/Nächte',
					scope: 'group'
				},
				{
					id: 'wishes',
					kind: 'text',
					label: 'Besondere Wünsche',
					icon: 'message-square',
					placeholder: 'Optional …',
					scope: 'group'
				}
			]
		},
		{
			id: 'e6',
			title: 'Maiausflug zum Drachenfels',
			type: 'Gesellig',
			typeKey: 'gesellig',
			date: '24.05.',
			day: '24',
			monShort: 'Mai',
			weekday: 'So',
			time: '11:00',
			month: 'Mai 2026',
			iso: '2026-05-24',
			phase: 'past',
			location: 'Drachenfels',
			city: 'Königswinter',
			companion: true,
			status: 'yes',
			yes: 26,
			no: 5,
			open: 3,
			present: 25,
			desc: 'Gemeinsame Wanderung auf den Drachenfels mit Einkehr. Bei gutem Wetter Familien willkommen.',
			extras: []
		},
		{
			id: 'e7',
			title: 'Benefizkonzert „Klassik am Rhein“',
			type: 'Activity',
			typeKey: 'lions',
			date: '08.05.',
			day: '08',
			monShort: 'Mai',
			weekday: 'Fr',
			time: '19:30',
			month: 'Mai 2026',
			iso: '2026-05-08',
			phase: 'past',
			location: 'Stadthalle',
			city: 'Bad Godesberg',
			companion: true,
			status: 'yes',
			yes: 30,
			no: 2,
			open: 2,
			present: 29,
			desc: 'Benefizkonzert zugunsten des Förderprojekts „Lesen macht stark“. Erlös € 4.200.',
			extras: []
		},
		{
			id: 'e8',
			title: 'Club-Abend April – Jahresbericht',
			type: 'Club-Abend',
			typeKey: 'clubabend',
			date: '17.04.',
			day: '17',
			monShort: 'Apr',
			weekday: 'Do',
			time: '19:00',
			month: 'April 2026',
			iso: '2026-04-17',
			phase: 'past',
			location: 'Restaurant Rheinblick',
			city: 'Bonn',
			companion: false,
			status: 'no',
			yes: 22,
			no: 9,
			open: 3,
			present: 22,
			desc: 'Halbjahres-Bericht des Präsidenten und Vorschau auf die Sommeraktivitäten.',
			extras: []
		}
	],
	donations: [
		{ id: 'm1', name: 'Andreas Kremer', count: 0 },
		{ id: 'm5', name: 'Wolfgang Reuter', count: 2 },
		{ id: 'm7', name: 'Claudia Brandt', count: 1 },
		{ id: 'm11', name: 'Ursula Krämer', count: 3 },
		{ id: 'm12', name: 'Bernd Schäfer', count: 1 },
		{ id: 'm3', name: 'Dr. Jens Berg', count: 0 },
		{ id: 'm4', name: 'Petra Lindner', count: 2 }
	],
	donationRate: 25
};

// 34-person roster for the response sheets (who is in which group).
window.LC_ROSTER = [
	{ name: 'Andreas Kremer', role: 'Präsident', tone: 'blue' },
	{ name: 'Maria Vogt', role: 'Schatzmeisterin', tone: 'gold' },
	{ name: 'Dr. Jens Berg', role: 'Sekretär', tone: 'cream' },
	{ name: 'Petra Lindner', role: 'Vizepräsidentin', tone: 'blue' },
	{ name: 'Wolfgang Reuter', role: 'Clubmaster', tone: 'gold' },
	{ name: 'Heinz Albers', role: 'Ehrenmitglied', tone: 'cream' },
	{ name: 'Claudia Brandt', role: 'Mitglied', tone: 'blue' },
	{ name: 'Michael Sommer', role: 'Webmaster', tone: 'gold' },
	{ name: 'Renate Hofmann', role: 'Mitglied', tone: 'cream' },
	{ name: 'Frank Wolff', role: 'Past-Präsident', tone: 'blue' },
	{ name: 'Ursula Krämer', role: 'Mitglied', tone: 'gold' },
	{ name: 'Bernd Schäfer', role: 'Mitglied', tone: 'cream' },
	{ name: 'Thomas Engel', role: 'Mitglied', tone: 'blue' },
	{ name: 'Sabine Reuter', role: 'Mitglied', tone: 'gold' },
	{ name: 'Klaus Vogt', role: 'Mitglied', tone: 'cream' },
	{ name: 'Inge Albers', role: 'Mitglied', tone: 'blue' },
	{ name: 'Dieter Hahn', role: 'Mitglied', tone: 'gold' },
	{ name: 'Gabriele Roth', role: 'Mitglied', tone: 'cream' },
	{ name: 'Werner Krause', role: 'Mitglied', tone: 'blue' },
	{ name: 'Monika Lang', role: 'Mitglied', tone: 'gold' },
	{ name: 'Jürgen Beck', role: 'Mitglied', tone: 'cream' },
	{ name: 'Brigitte Falk', role: 'Mitglied', tone: 'blue' },
	{ name: 'Helmut Sauer', role: 'Mitglied', tone: 'gold' },
	{ name: 'Christa Neumann', role: 'Mitglied', tone: 'cream' },
	{ name: 'Rolf Zimmermann', role: 'Mitglied', tone: 'blue' },
	{ name: 'Andrea Pohl', role: 'Mitglied', tone: 'gold' },
	{ name: 'Günter Frey', role: 'Mitglied', tone: 'cream' },
	{ name: 'Elke Busch', role: 'Mitglied', tone: 'blue' },
	{ name: 'Norbert Kuhn', role: 'Mitglied', tone: 'gold' },
	{ name: 'Marion Schäfer', role: 'Mitglied', tone: 'cream' },
	{ name: 'Peter Hofmann', role: 'Mitglied', tone: 'blue' },
	{ name: 'Anna Wolff', role: 'Mitglied', tone: 'gold' },
	{ name: 'Stefan Götz', role: 'Mitglied', tone: 'cream' },
	{ name: 'Karin Vogel', role: 'Mitglied', tone: 'blue' }
];

// Deterministic per-event grouping that matches each event's yes/no/open counts.
// Rotates the roster by a per-event offset so groups differ between events,
// and flags a few companions (+1) on club evenings / trips.
window.LC_DATA.responsesFor = function (ev) {
	const R = window.LC_ROSTER;
	const n = R.length;
	const off = (parseInt(ev.day, 10) * 5) % n;
	const rot = R.slice(off).concat(R.slice(0, off));
	const tag = (arr, status) =>
		arr.map((m, i) => ({
			...m,
			status,
			companion: status === 'yes' && ev.companion && i % 5 === 1
		}));
	const yes = tag(rot.slice(0, ev.yes), 'yes');
	const no = tag(rot.slice(ev.yes, ev.yes + ev.no), 'no');
	const open = tag(rot.slice(ev.yes + ev.no, ev.yes + ev.no + ev.open), 'open');
	return { yes, no, open };
};
