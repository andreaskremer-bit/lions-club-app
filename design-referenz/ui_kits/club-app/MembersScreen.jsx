// Mitgliederverzeichnis — Suche/Filter, Karten mit Foto, Direktaktionen.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function MembersScreen({ onOpen }) {
  const { AppBar, IconButton, Input, Avatar, Tag, ListRow } = LC;
  const { Ic } = window;
  const [q, setQ] = React.useState('');
  const members = window.LC_DATA.members;
  const filtered = members.filter(m => m.name.toLowerCase().includes(q.toLowerCase()) || m.role.toLowerCase().includes(q.toLowerCase()));
  const active = members.filter(m => m.status === 'aktiv').length;

  return (
    <div className="screen">
      <AppBar large title="Mitglieder" eyebrow={`${active} aktiv · ${members.length} gesamt`}
        trailing={<IconButton icon={<Ic name="user-plus" size={22} />} label="Mitglied einladen" tone="primary" />} />
      <div className="screen__pad" style={{ paddingTop: 4, paddingBottom: 10 }}>
        <Input icon={<Ic name="search" size={20} />} placeholder="Name oder Amt suchen…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="screen__scroll">
        <div className="card-list card-list--flush">
          {filtered.map(m => (
            <div key={m.id} className="mem-row" onClick={() => onOpen(m.id)}>
              <Avatar name={m.name} tone={m.tone} size="lg" />
              <div className="mem-row__body">
                <div className="mem-row__name">{m.name}</div>
                <div className="mem-row__role">
                  {m.role}
                  {m.status === 'Ehrenmitglied' && <Tag tone="gold" dot>Ehrenmitglied</Tag>}
                  {m.status === 'inaktiv' && <Tag outline>inaktiv</Tag>}
                </div>
              </div>
              <div className="mem-row__actions">
                <IconButton icon={<Ic name="phone" size={19} />} label="Anrufen" onClick={ev => ev.stopPropagation()} />
                <IconButton icon={<Ic name="mail" size={19} />} label="E-Mail" onClick={ev => ev.stopPropagation()} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}
window.MembersScreen = MembersScreen;
