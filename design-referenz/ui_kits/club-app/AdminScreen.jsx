// Jahresplanung (Admin) — Termine des Clubjahres verwalten.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
const ADMIN_TONE = {
	clubabend: 'blue',
	versammlung: 'blue',
	gesellig: 'gold',
	lions: 'neutral',
	reise: 'sage'
};

function AdminScreen({ onBack, onOpen, onResponses }) {
	const { AppBar, IconButton, Button, Card, Tag } = LC;
	const { Ic } = window;
	const events = window.LC_DATA.events;

	const groups = {};
	events.forEach((e) => {
		(groups[e.month] = groups[e.month] || []).push(e);
	});

	return (
		<div className="screen">
			<AppBar
				center
				bordered
				title="Jahresplanung"
				leading={
					<IconButton icon={<Ic name="chevron-left" size={22} />} label="Zurück" onClick={onBack} />
				}
				trailing={
					<IconButton icon={<Ic name="plus" size={22} />} label="Termin anlegen" tone="primary" />
				}
			/>

			<div className="screen__scroll">
				<div className="screen__pad detail__stack" style={{ paddingTop: 14 }}>
					<div className="admin-head">
						<div>
							<div className="admin-head__year">Clubjahr 2025/26</div>
							<div className="admin-head__sub">{events.length} Termine geplant</div>
						</div>
						<Button variant="secondary" size="sm" iconLeft={<Ic name="plus" size={17} />}>
							Termin
						</Button>
					</div>

					{Object.keys(groups).map((month) => (
						<div key={month}>
							<div className="sec-label">{month}</div>
							<Card flush>
								{groups[month].map((e, i) => (
									<div
										key={e.id}
										className={'admin-row' + (i > 0 ? ' admin-row--div' : '')}
										onClick={() => onOpen && onOpen(e.id)}
									>
										<div className="admin-row__date">
											<span className="admin-row__d">{e.day}</span>
											<span className="admin-row__mon">{e.monShort}</span>
										</div>
										<div className="admin-row__body">
											<div className="admin-row__title">{e.title}</div>
											<div className="admin-row__sub">
												<Tag tone={ADMIN_TONE[e.typeKey]}>{e.type}</Tag>
												<span className="admin-row__loc">{e.location}</span>
											</div>
										</div>
										<div className="admin-row__resp">
											<span
												className="rc__i rc__i--yes"
												role="button"
												tabIndex={0}
												title="Zugesagt anzeigen"
												onClick={(ev) => {
													ev.stopPropagation();
													onResponses && onResponses(e.id, 'yes');
												}}
											>
												<Ic name="check" size={13} />
												{e.yes}
											</span>
											<span
												className="rc__i rc__i--open"
												role="button"
												tabIndex={0}
												title="Keine Meldung anzeigen"
												onClick={(ev) => {
													ev.stopPropagation();
													onResponses && onResponses(e.id, 'open');
												}}
											>
												<Ic name="circle-help" size={12} />
												{e.open}
											</span>
										</div>
										<Ic name="pencil" size={17} color="var(--text-muted)" />
									</div>
								))}
							</Card>
						</div>
					))}

					<div className="treas-note">
						<Ic name="info" size={15} /> Rückmeldezahlen sind antippbar — der Status kann sich im
						laufenden Prozess noch ändern. Vorstand &amp; Sekretär können Termine anlegen,
						bearbeiten und Rückmeldungen einsehen.
					</div>
					<div style={{ height: 12 }} />
				</div>
			</div>
		</div>
	);
}
window.AdminScreen = AdminScreen;
