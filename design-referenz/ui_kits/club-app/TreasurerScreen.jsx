// Schatzmeister-Auswertung — Abwesenheiten je Mitglied, Summe, Export.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function TreasurerScreen({ onBack }) {
	const { AppBar, IconButton, Button, Card, Avatar, Select } = LC;
	const { Ic } = window;
	const rate = window.LC_DATA.donationRate;
	const rows = [...window.LC_DATA.donations].sort((a, b) => b.count - a.count);
	const totalAbsences = rows.reduce((s, r) => s + r.count, 0);
	const totalSum = totalAbsences * rate;
	const euro = (n) => n.toFixed(2).replace('.', ',') + ' €';

	return (
		<div className="screen">
			<AppBar
				center
				bordered
				title="Auswertung"
				leading={
					<IconButton icon={<Ic name="chevron-left" size={22} />} label="Zurück" onClick={onBack} />
				}
				trailing={
					<IconButton icon={<Ic name="download" size={20} />} label="Export" tone="primary" />
				}
			/>

			<div className="screen__scroll">
				<div className="screen__pad detail__stack" style={{ paddingTop: 14 }}>
					<Select
						label="Zeitraum"
						options={['Clubjahr 2025/26', '1. Halbjahr 2026', 'Juni 2026']}
						defaultValue="Clubjahr 2025/26"
					/>

					<div className="treas-totals">
						<Card>
							<div className="treas-stat__l">Abwesenheiten</div>
							<div className="treas-stat__n">{totalAbsences}</div>
						</Card>
						<Card>
							<div className="treas-stat__l">Summe · {euro(rate)}/Stk.</div>
							<div className="treas-stat__n u-mono" style={{ color: 'var(--gold-700)' }}>
								{euro(totalSum)}
							</div>
						</Card>
					</div>

					<div className="sec-label">Je Mitglied</div>
					<Card flush>
						{rows.map((r, i) => (
							<div key={r.id} className={'treas-row' + (i > 0 ? ' treas-row--div' : '')}>
								<Avatar name={r.name} size="sm" tone={r.count > 0 ? 'gold' : 'cream'} />
								<span className="treas-row__name">{r.name}</span>
								<span className="treas-row__count u-mono">{r.count}×</span>
								<span className="treas-row__sum u-mono">{euro(r.count * rate)}</span>
							</div>
						))}
					</Card>

					<div className="treas-note">
						<Ic name="info" size={15} /> Die App erfasst nur Abwesenheiten. Die Buchung erfolgt
						extern durch den Schatzmeister.
					</div>

					<div className="treas-actions">
						<Button variant="secondary" iconLeft={<Ic name="file-text" size={18} />}>
							PDF
						</Button>
						<Button variant="secondary" iconLeft={<Ic name="table" size={18} />}>
							CSV
						</Button>
					</div>
					<div style={{ height: 12 }} />
				</div>
			</div>
		</div>
	);
}
window.TreasurerScreen = TreasurerScreen;
