// Termin-Detail + An-/Abmeldung, Begleitperson, generische Zusatzabfragen (Menü, Zimmerwunsch …).
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
const DETAIL_TONE = {
	clubabend: 'blue',
	versammlung: 'blue',
	gesellig: 'gold',
	lions: 'neutral',
	reise: 'sage'
};

function EventDetailScreen({ eventId, onBack, onResponses }) {
	const { AppBar, IconButton, Button, Card, Tag, StatusBadge, Input } = LC;
	const { Ic, QuestionField } = window;
	const e = window.LC_DATA.events.find((x) => x.id === eventId) || window.LC_DATA.events[0];
	const me = window.LC_DATA.me;
	const past = e.phase === 'past';
	const [status, setStatus] = React.useState(e.status);
	const [companions, setCompanions] = React.useState([]); // [{id, name}]
	const [answers, setAnswers] = React.useState({}); // answers[personId][questionId]

	const questions = e.questions || [];
	const personQs = questions.filter((q) => q.scope !== 'group');
	const groupQs = questions.filter((q) => q.scope === 'group');
	const persons = [{ id: 'me', name: me.name, isMe: true }, ...companions];

	const setAns = (pid, qid, val) =>
		setAnswers((a) => ({ ...a, [pid]: { ...(a[pid] || {}), [qid]: val } }));
	const addCompanion = () => setCompanions((c) => [...c, { id: 'c' + Date.now(), name: '' }]);
	const renameCompanion = (id, name) =>
		setCompanions((c) => c.map((x) => (x.id === id ? { ...x, name } : x)));
	const removeCompanion = (id) => {
		setCompanions((c) => c.filter((x) => x.id !== id));
		setAnswers((a) => {
			const n = { ...a };
			delete n[id];
			return n;
		});
	};

	return (
		<div className="screen">
			<AppBar
				center
				bordered
				title={past ? 'Vergangen' : 'Termin'}
				leading={
					<IconButton icon={<Ic name="chevron-left" size={22} />} label="Zurück" onClick={onBack} />
				}
				trailing={<IconButton icon={<Ic name="calendar-plus" size={20} />} label="In Kalender" />}
			/>

			<div className="screen__scroll">
				<div className="detail__hero">
					<Tag tone={DETAIL_TONE[e.typeKey]}>{e.type}</Tag>
					<h1 className="detail__title">{e.title}</h1>
					<div className="detail__facts">
						<div className="fact">
							<Ic name="calendar-days" size={18} />
							<span>
								{e.weekday}, {e.date}
								{e.month.split(' ')[1]} · <span className="u-mono">{e.time}</span>
							</span>
						</div>
						<div className="fact">
							<Ic name="map-pin" size={18} />
							<span>
								{e.location}, {e.city}
							</span>
						</div>
					</div>
				</div>

				<div className="screen__pad detail__stack">
					<Card>
						<div className="detail__statusrow">
							<span className="detail__statuslabel">{past ? 'Deine Meldung' : 'Dein Status'}</span>
							<StatusBadge status={status} />
						</div>
						<p className="detail__desc">{e.desc}</p>
					</Card>

					{past && e.present != null && (
						<Card>
							<div className="att-final">
								<span className="att-final__ic">
									<Ic name="user-check" size={20} />
								</span>
								<div className="att-final__body">
									<div className="att-final__t">Anwesenheit erfasst</div>
									<div className="att-final__s">
										{e.present} von {e.yes} Zusagen anwesend
									</div>
								</div>
								<span className="att-final__n">{e.present}</span>
							</div>
						</Card>
					)}

					{!past && status !== 'no' && e.companion && (
						<Card>
							<div className="detail__qlabel">
								<Ic name="users" size={17} /> Begleitpersonen
							</div>
							<div className="comp-list">
								{companions.length === 0 && (
									<p className="comp-empty">Nur ich — keine Begleitung angemeldet.</p>
								)}
								{companions.map((c, i) => (
									<div key={c.id} className="comp-row">
										<div className="comp-row__field">
											<Input
												placeholder={'Name Begleitperson ' + (i + 1)}
												value={c.name}
												onChange={(ev) => renameCompanion(c.id, ev.target.value)}
											/>
										</div>
										<IconButton
											icon={<Ic name="trash-2" size={18} />}
											label="Entfernen"
											onClick={() => removeCompanion(c.id)}
										/>
									</div>
								))}
							</div>
							<button type="button" className="comp-add" onClick={addCompanion}>
								<Ic name="user-plus" size={18} /> Begleitperson hinzufügen
							</button>
						</Card>
					)}

					{!past &&
						status !== 'no' &&
						personQs.length > 0 &&
						persons.map((p) => (
							<Card key={p.id}>
								<div className="qf-person">
									<span className="qf-person__av">
										{(p.name || '?').trim().charAt(0).toUpperCase() || '?'}
									</span>
									<div className="qf-person__txt">
										<span className="qf-person__name">
											{p.isMe ? me.name : p.name || 'Begleitperson'}
										</span>
										<span className="qf-person__tag">{p.isMe ? 'Du' : 'Begleitung'}</span>
									</div>
								</div>
								<div className="qf-stack">
									{personQs.map((q) => (
										<QuestionField
											key={q.id}
											q={{ ...q, _scope: p.id }}
											value={(answers[p.id] || {})[q.id]}
											onChange={(val) => setAns(p.id, q.id, val)}
										/>
									))}
								</div>
							</Card>
						))}

					{!past && status !== 'no' && groupQs.length > 0 && (
						<Card>
							<div className="detail__qlabel">
								<Ic name="clipboard-list" size={17} /> Angaben zur Anmeldung
							</div>
							<div className="qf-stack">
								{groupQs.map((q) => (
									<QuestionField
										key={q.id}
										q={{ ...q, _scope: 'group' }}
										value={(answers.group || {})[q.id]}
										onChange={(val) => setAns('group', q.id, val)}
									/>
								))}
							</div>
						</Card>
					)}

					<div className="sec-label" style={{ marginTop: 4 }}>
						{past ? 'Finale Rückmeldungen' : 'Meldungen'}
					</div>
					<Card flush>
						{[
							{ k: 'yes', icon: 'check', label: 'Zugesagt', n: e.yes, fg: 'var(--status-yes-fg)' },
							{ k: 'no', icon: 'x', label: 'Abgesagt', n: e.no, fg: 'var(--status-no-fg)' },
							{
								k: 'open',
								icon: 'circle-help',
								label: 'Keine Meldung',
								n: e.open,
								fg: 'var(--ink-500)'
							}
						].map((r, i) => (
							<button
								key={r.k}
								className={'meld-row' + (i > 0 ? ' meld-row--div' : '')}
								onClick={() => onResponses && onResponses(e.id, r.k)}
							>
								<span className="meld-row__ic" style={{ color: r.fg }}>
									<Ic name={r.icon} size={20} />
								</span>
								<span className="meld-row__lbl">{r.label}</span>
								<span className="meld-row__n u-mono">{r.n}</span>
								<Ic name="chevron-right" size={18} color="var(--text-muted)" />
							</button>
						))}
					</Card>
					<div style={{ height: 96 }} />
				</div>
			</div>

			<div className="detail__cta">
				{past ? (
					<div className="rsvp-readonly">
						<Ic name="lock" size={16} /> Vergangener Termin — Rückmeldung geschlossen
					</div>
				) : (
					<React.Fragment>
						{status === 'open' && (
							<div className="rsvp-hint">
								<Ic name="circle-help" size={15} /> Noch keine Rückmeldung — bitte zu- oder absagen
							</div>
						)}
						<div className="rsvp" role="group" aria-label="Rückmeldung">
							<button
								type="button"
								className={'rsvp__opt rsvp__opt--yes' + (status === 'yes' ? ' is-on' : '')}
								style={
									status === 'yes'
										? {
												background: 'var(--primary)',
												borderColor: 'var(--primary)',
												color: 'var(--text-on-primary)'
											}
										: undefined
								}
								aria-pressed={status === 'yes'}
								onClick={() => setStatus('yes')}
							>
								<Ic name="check" size={20} /> Zusagen
							</button>
							<button
								type="button"
								className={'rsvp__opt rsvp__opt--no' + (status === 'no' ? ' is-on' : '')}
								style={
									status === 'no'
										? { background: 'var(--danger)', borderColor: 'var(--danger)', color: '#fff' }
										: undefined
								}
								aria-pressed={status === 'no'}
								onClick={() => setStatus('no')}
							>
								<Ic name="x" size={20} /> Absagen
							</button>
						</div>
					</React.Fragment>
				)}
			</div>
		</div>
	);
}
window.EventDetailScreen = EventDetailScreen;
