// Terminübersicht (Start) — Anstehend / Vergangen segment, list & navigable calendar.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

const TYPE_TONE = { clubabend: 'blue', versammlung: 'blue', gesellig: 'gold', lions: 'neutral', reise: 'sage' };
const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const MON_SHORT = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const WD_SHORT = ['So','Mo','Di','Mi','Do','Fr','Sa'];
const TODAY = '2026-06-13';

function ResponseCounts({ e, onPick }) {
  const { Ic } = window;
  const pick = (status) => (ev) => { ev.stopPropagation(); onPick && onPick(e.id, status); };
  return (
    <span className="rc" aria-label={`${e.yes} zugesagt, ${e.no} abgesagt, ${e.open} offen`}>
      <span className="rc__i rc__i--yes" role="button" tabIndex={0} title="Zugesagt anzeigen" onClick={pick('yes')}><Ic name="check" size={14} />{e.yes}</span>
      <span className="rc__i rc__i--no" role="button" tabIndex={0} title="Abgesagt anzeigen" onClick={pick('no')}><Ic name="x" size={14} />{e.no}</span>
      <span className="rc__i rc__i--open" role="button" tabIndex={0} title="Keine Meldung anzeigen" onClick={pick('open')}><Ic name="circle-help" size={13} />{e.open}</span>
    </span>
  );
}

function EventCard({ e, onOpen, onResponses }) {
  const { StatusBadge, Tag } = LC;
  const { Ic } = window;
  const past = e.phase === 'past';
  return (
    <button className={'ev-card' + (past ? ' ev-card--past' : '')} onClick={() => onOpen(e.id)}>
      <div className="ev-card__date">
        <span className="ev-card__wd">{e.weekday}</span>
        <span className="ev-card__d">{e.day}</span>
        <span className="ev-card__mon">{e.monShort}</span>
      </div>
      <div className="ev-card__body">
        <div className="ev-card__title">{e.title}</div>
        <div className="ev-card__meta">
          <Ic name="map-pin" size={14} /> {e.location} · <span className="u-mono">{e.time}</span>
        </div>
        <div className="ev-card__foot">
          <div className="ev-card__foot-l">
            <Tag tone={TYPE_TONE[e.typeKey]}>{e.type}</Tag>
            <StatusBadge status={e.status} />
          </div>
          {past && e.present != null
            ? <span className="ev-card__att" title="Erfasste Anwesenheit"><Ic name="user-check" size={14} /> {e.present} anwesend</span>
            : <ResponseCounts e={e} onPick={onResponses} />}
        </div>
      </div>
    </button>
  );
}

function EventListScreen({ onOpen, onResponses }) {
  const { AppBar, IconButton, SegmentedControl } = LC;
  const { Ic } = window;
  const [phase, setPhase] = React.useState('upcoming');
  const [calendar, setCalendar] = React.useState(false);
  const events = window.LC_DATA.events;

  // upcoming ascending (next first); past descending (most recent first)
  const list = events
    .filter(e => e.phase === phase)
    .sort((a, b) => phase === 'upcoming' ? a.iso.localeCompare(b.iso) : b.iso.localeCompare(a.iso));

  const groups = [];
  const seen = {};
  list.forEach(e => {
    if (!seen[e.month]) { seen[e.month] = []; groups.push([e.month, seen[e.month]]); }
    seen[e.month].push(e);
  });

  return (
    <div className="screen">
      <AppBar large title="Termine" eyebrow="Lions Club Bonn-Rheinaue"
        trailing={
          <IconButton icon={<Ic name={calendar ? 'list' : 'calendar'} size={22} />}
            label={calendar ? 'Liste' : 'Kalender'} tone={calendar ? 'primary' : 'default'}
            onClick={() => setCalendar(c => !c)} />
        } />

      {!calendar && (
        <div className="screen__pad" style={{ paddingTop: 4, paddingBottom: 12 }}>
          <SegmentedControl value={phase} onChange={setPhase}
            options={[{ label: 'Anstehend', value: 'upcoming' }, { label: 'Vergangen', value: 'past' }]} />
        </div>
      )}

      <div className="screen__scroll">
        {calendar ? (
          <div className="screen__pad"><CalendarView events={events} onOpen={onOpen} /></div>
        ) : (
          <React.Fragment>
            {groups.map(([month, items]) => (
              <div key={month} className="ev-group">
                <div className="ev-group__label">{month}</div>
                <div className="card-list">
                  {items.map(e => <EventCard key={e.id} e={e} onOpen={onOpen} onResponses={onResponses} />)}
                </div>
              </div>
            ))}
            {list.length === 0 && <div className="ev-empty">Keine {phase === 'past' ? 'vergangenen' : 'anstehenden'} Termine.</div>}
          </React.Fragment>
        )}
        <div style={{ height: 12 }} />
      </div>
    </div>
  );
}

function CalendarView({ events, onOpen }) {
  const { StatusBadge } = LC;
  const { Ic } = window;
  // freely navigable month cursor — starts on the current month
  const [cursor, setCursor] = React.useState({ y: 2026, m: 5 }); // m: 0-indexed (Juni)

  const evByDay = {};
  events.forEach(e => {
    const [y, m, d] = e.iso.split('-').map(Number);
    if (y === cursor.y && m - 1 === cursor.m) evByDay[d] = e;
  });

  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // Mon=0
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const todayParts = TODAY.split('-').map(Number);
  const isToday = (d) => todayParts[0] === cursor.y && todayParts[1] - 1 === cursor.m && todayParts[2] === d;

  const step = (delta) => setCursor(c => {
    let m = c.m + delta, y = c.y;
    if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    return { y, m };
  });

  const monthEvents = events
    .filter(e => { const [y, m] = e.iso.split('-').map(Number); return y === cursor.y && m - 1 === cursor.m; })
    .sort((a, b) => a.iso.localeCompare(b.iso));

  return (
    <div>
      <div className="cal-nav">
        <button className="cal-nav__btn" aria-label="Vorheriger Monat" onClick={() => step(-1)}><Ic name="chevron-left" size={20} /></button>
        <div className="cal-nav__title">{MONTHS_DE[cursor.m]} {cursor.y}</div>
        <button className="cal-nav__btn" aria-label="Nächster Monat" onClick={() => step(1)}><Ic name="chevron-right" size={20} /></button>
      </div>
      <div className="cal-grid">
        {['Mo','Di','Mi','Do','Fr','Sa','So'].map(w => <div key={w} className="cal-wd">{w}</div>)}
        {Array.from({ length: firstDow }).map((_, i) => <div key={'x'+i} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
          <div key={d}
               className={'cal-day' + (evByDay[d] ? ' cal-day--has' : '') + (isToday(d) ? ' cal-day--today' : '')}
               onClick={() => evByDay[d] && onOpen(evByDay[d].id)}>
            <span className="cal-day__n">{d}</span>
            {evByDay[d] && <span className="cal-day__dot" style={{ background: `var(--status-${evByDay[d].status}-dot)` }} />}
          </div>
        ))}
      </div>
      <div className="card-list" style={{ marginTop: 16 }}>
        {monthEvents.length === 0 && <div className="ev-empty" style={{ padding: '20px 0' }}>Keine Termine in diesem Monat.</div>}
        {monthEvents.map(e => (
          <button key={e.id} className="ev-mini" onClick={() => onOpen(e.id)}>
            <StatusBadge status={e.status} dotOnly />
            <span className="ev-mini__d u-mono">{e.date}</span>
            <span className="ev-mini__t">{e.title}</span>
            {e.phase === 'past' && <Ic name="lock" size={14} color="var(--text-muted)" />}
            <Ic name="chevron-right" size={16} color="var(--text-muted)" />
          </button>
        ))}
      </div>
    </div>
  );
}
window.EventListScreen = EventListScreen;
