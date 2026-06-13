// Mitgliedsprofil / Selbstpflege — eigene Stammdaten + Partner.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function ProfileScreen({ onBack }) {
  const { AppBar, IconButton, Button, Card, Avatar, Input, Switch } = LC;
  const { Ic } = window;
  const me = window.LC_DATA.members[0];
  const [edit, setEdit] = React.useState(false);

  return (
    <div className="screen">
      <AppBar large title="Mein Profil"
        leading={onBack ? <IconButton icon={<Ic name="chevron-left" size={22} />} label="Zurück" onClick={onBack} /> : null}
        trailing={<IconButton icon={<Ic name={edit ? 'check' : 'pencil'} size={20} />} label="Bearbeiten" tone="primary" onClick={() => setEdit(!edit)} />} />

      <div className="screen__scroll">
        <div className="profile__head">
          <Avatar name={me.name} tone="blue" size="xl" />
          <div className="profile__name">{me.name}</div>
          <div className="profile__role">{me.role} · seit 2014</div>
        </div>

        <div className="screen__pad detail__stack">
          <div className="sec-label">Kontaktdaten</div>
          <Card>
            <div className="form-stack">
              <Input label="E-Mail" defaultValue={me.email} disabled={!edit} icon={<Ic name="mail" size={20} />} />
              <Input label="Handy" defaultValue={me.phone} disabled={!edit} icon={<Ic name="phone" size={20} />} />
              <Input label="Geburtstag" defaultValue="14.03.1961" disabled={!edit} icon={<Ic name="cake" size={20} />} />
            </div>
          </Card>

          <div className="sec-label">Partner/in</div>
          <Card>
            <div className="form-stack">
              <Input label="Name" defaultValue={me.partner} disabled={!edit} />
              <Input label="Geburtstag" defaultValue="02.09.1963" disabled={!edit} />
              <Input label="E-Mail" defaultValue="b.kremer@example.de" disabled={!edit} />
            </div>
          </Card>

          <div className="sec-label">Benachrichtigungen</div>
          <Card>
            <div className="switch-stack">
              <div className="switch-row"><span>Push-Erinnerungen</span><Switch defaultChecked /></div>
              <div className="switch-row"><span>E-Mail-Fallback</span><Switch defaultChecked /></div>
              <div className="switch-row"><span>Geburtstags-Hinweise</span><Switch /></div>
            </div>
          </Card>

          {edit && <Button variant="primary" size="lg" fullWidth onClick={() => setEdit(false)}>Änderungen speichern</Button>}
          <button className="logout"><Ic name="log-out" size={18} /> Ausloggen</button>
          <div style={{ height: 12 }} />
        </div>
      </div>
    </div>
  );
}
window.ProfileScreen = ProfileScreen;
