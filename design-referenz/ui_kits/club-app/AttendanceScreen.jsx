// Anwesenheitserfassung (Vorstand) — schnelle An-/Abwesend-Liste.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function AttendanceScreen({ onBack }) {
	const { AppBar, IconButton, Button, Avatar } = LC;
	const { Ic } = window;
	const members = window.LC_DATA.members.filter((m) => m.status === 'aktiv');
	const [present, setPresent] = React.useState(() => {
		const o = {};
		members.forEach((m, i) => (o[m.id] = i % 5 !== 2));
		return o;
	});
	const presentCount = Object.values(present).filter(Boolean).length;

	return (
		<div className="screen">
			<AppBar
				center
				bordered
				title="Anwesenheit"
				leading={
					<IconButton icon={<Ic name="chevron-left" size={22} />} label="Zurück" onClick={onBack} />
				}
			/>

			<div className="screen__scroll">
				<div className="screen__pad detail__stack" style={{ paddingTop: 14 }}>
					<div className="att-summary">
						<div className="att-summary__head">
							<div>
								<div className="att-summary__t">Club-Abend</div>
								<div className="att-summary__s">
									<span className="u-mono">12.06.</span> · <span className="u-mono">19:00</span> ·
									Restaurant Rheinblick
								</div>
							</div>
							<div className="att-summary__count">
								<span className="att-summary__big" style={{ color: 'var(--present-fg)' }}>
									{presentCount}
								</span>
								<span>/ {members.length} da</span>
							</div>
						</div>
					</div>
				</div>

				<div className="att-list">
					{members.map((m) => (
						<label key={m.id} className={'att-row' + (present[m.id] ? '' : ' att-row--absent')}>
							<Avatar name={m.name} tone={m.tone} />
							<div className="att-row__body">
								<div className="att-row__name">{m.name}</div>
								<div className="att-row__state">{present[m.id] ? 'Anwesend' : 'Abwesend'}</div>
							</div>
							<input
								type="checkbox"
								className="att-toggle"
								checked={present[m.id]}
								onChange={() => setPresent((p) => ({ ...p, [m.id]: !p[m.id] }))}
							/>
							<span className="att-switch">
								<span className="att-switch__thumb" />
							</span>
						</label>
					))}
				</div>
				<div style={{ height: 96 }} />
			</div>

			<div className="detail__cta">
				<Button
					variant="primary"
					size="lg"
					fullWidth
					iconLeft={<Ic name="check-check" size={20} />}
					onClick={onBack}
				>
					Anwesenheit speichern
				</Button>
			</div>
		</div>
	);
}
window.AttendanceScreen = AttendanceScreen;
