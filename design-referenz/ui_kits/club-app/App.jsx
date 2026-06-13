// App controller — login gate, bottom tabs, and overlay screen stack.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function NewsScreen() {
  const { AppBar, Card, Tag, Avatar } = LC;
  const posts = [
    { id: 1, author: 'Dr. Jens Berg', role: 'Sekretär', tone: 'cream', time: 'vor 2 Std.', title: 'Protokoll Mai-Versammlung online', body: 'Das Protokoll der letzten Mitglieder-Versammlung steht jetzt unter Dokumente bereit.', tag: 'Protokoll' },
    { id: 2, author: 'Andreas Kremer', role: 'Präsident', tone: 'blue', time: 'gestern', title: 'Spendenübergabe Förderprojekt', body: 'Vielen Dank an alle — wir konnten € 4.200 an „Lesen macht stark“ übergeben.', tag: 'Activity' },
    { id: 3, author: 'Wolfgang Reuter', role: 'Clubmaster', tone: 'gold', time: '3 Tage', title: 'Anmeldung Club-Reise Toskana', body: 'Die Zimmerkontingente sind reserviert. Bitte bis Ende Juli anmelden.', tag: 'Reise' },
  ];
  return (
    <div className="screen">
      <AppBar large title="News" eyebrow="Vereinsnachrichten" />
      <div className="screen__scroll">
        <div className="screen__pad detail__stack" style={{ paddingTop: 8 }}>
          {posts.map(p => (
            <Card key={p.id}>
              <div className="news__head">
                <Avatar name={p.author} tone={p.tone} size="sm" />
                <div className="news__by"><span className="news__author">{p.author}</span><span className="news__meta">{p.role} · {p.time}</span></div>
                <Tag tone="blue" outline>{p.tag}</Tag>
              </div>
              <div className="news__title">{p.title}</div>
              <p className="news__body">{p.body}</p>
            </Card>
          ))}
          <div style={{ height: 12 }} />
        </div>
      </div>
    </div>
  );
}

function MoreScreen({ onNav }) {
  const { AppBar, Card, ListRow, Avatar, Tag } = LC;
  const { Ic } = window;
  const me = window.LC_DATA.me;
  const lead = n => <span className="more__ic"><Ic name={n} size={20} /></span>;
  return (
    <div className="screen">
      <AppBar large title="Mehr" />
      <div className="screen__scroll">
        <div className="screen__pad detail__stack" style={{ paddingTop: 6 }}>
          <Card interactive onClick={() => onNav('profile')} className="more__profile">
            <Avatar name={me.name} tone="blue" size="lg" />
            <div><div className="more__name">{me.name}</div><div className="more__role">{me.role} · Profil bearbeiten</div></div>
            <Ic name="chevron-right" size={20} color="var(--text-muted)" />
          </Card>

          <div className="sec-label">Vorstand</div>
          <Card flush>
            <ListRow lead={lead('clipboard-check')} title="Anwesenheit erfassen" subtitle="Nächster Club-Abend" chevron onClick={() => onNav('attendance')} />
            <ListRow lead={lead('coins')} title="Schatzmeister-Auswertung" subtitle="Abwesenheiten &amp; Beiträge" chevron onClick={() => onNav('treasurer')} />
            <ListRow lead={lead('calendar-plus')} title="Termine verwalten" subtitle="Jahresplanung" chevron trailing={<Tag tone="blue" outline>Admin</Tag>} onClick={() => onNav('admin')} />
          </Card>

          <div className="sec-label">Allgemein</div>
          <Card flush>
            <ListRow lead={lead('file-text')} title="Dokumente" subtitle="Protokolle, Satzung, Programm" chevron />
            <ListRow lead={lead('image')} title="Galerie" subtitle="Google-Share öffnen" trailing={<Ic name="external-link" size={17} color="var(--text-muted)" />} />
            <ListRow lead={lead('cake')} title="Geburtstage" subtitle="Diesen Monat: 3" chevron />
            <ListRow lead={lead('bell')} title="Benachrichtigungen" chevron onClick={() => onNav('profile')} />
          </Card>
          <div style={{ height: 12 }} />
        </div>
      </div>
    </div>
  );
}

function App() {
  const { TabBar } = LC;
  const { Ic, PhoneFrame, LoginScreen, EventListScreen, EventDetailScreen, MembersScreen, ProfileScreen, AttendanceScreen, TreasurerScreen, AdminScreen, ResponseSheet } = window;
  const [authed, setAuthed] = React.useState(false);
  const [tab, setTab] = React.useState('termine');
  const [overlay, setOverlay] = React.useState(null); // {type, id}
  const [sheet, setSheet] = React.useState(null); // {eventId, status}
  const showResponses = (eventId, status) => setSheet({ eventId, status });

  const tabs = [
    { id: 'termine', label: 'Termine', icon: <Ic name="calendar-days" size={24} /> },
    { id: 'mitglieder', label: 'Mitglieder', icon: <Ic name="users" size={24} /> },
    { id: 'news', label: 'News', icon: <Ic name="newspaper" size={24} />, badge: 2 },
    { id: 'mehr', label: 'Mehr', icon: <Ic name="menu" size={24} /> },
  ];

  if (!authed) {
    return <PhoneFrame><LoginScreen onLogin={() => setAuthed(true)} /></PhoneFrame>;
  }

  let body;
  if (overlay?.type === 'event') body = <EventDetailScreen eventId={overlay.id} onBack={() => setOverlay(null)} onResponses={showResponses} />;
  else if (overlay?.type === 'attendance') body = <AttendanceScreen onBack={() => setOverlay(null)} />;
  else if (overlay?.type === 'treasurer') body = <TreasurerScreen onBack={() => setOverlay(null)} />;
  else if (overlay?.type === 'admin') body = <AdminScreen onBack={() => setOverlay(null)} onOpen={id => setOverlay({ type: 'event', id })} onResponses={showResponses} />;
  else if (overlay?.type === 'profile') body = <ProfileScreen onBack={() => setOverlay(null)} />;
  else if (tab === 'termine') body = <EventListScreen onOpen={id => setOverlay({ type: 'event', id })} onResponses={showResponses} />;
  else if (tab === 'mitglieder') body = <MembersScreen onOpen={() => {}} />;
  else if (tab === 'news') body = <NewsScreen />;
  else body = <MoreScreen onNav={type => setOverlay({ type })} />;

  const showTabs = !overlay;

  return (
    <PhoneFrame>
      <div className="app">
        <div className="app__body">{body}</div>
        {showTabs && <TabBar items={tabs} value={tab} onChange={t => { setTab(t); setOverlay(null); }} />}
        <ResponseSheet sheet={sheet} onClose={() => setSheet(null)} onStatus={s => setSheet(x => ({ ...x, status: s }))} />
      </div>
    </PhoneFrame>
  );
}
window.App = App;
const _lcRootEl = document.getElementById('root');
window.__lcRoot = window.__lcRoot || ReactDOM.createRoot(_lcRootEl);
window.__lcRoot.render(<App />);
