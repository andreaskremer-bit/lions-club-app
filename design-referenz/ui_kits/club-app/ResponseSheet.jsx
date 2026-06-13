// ResponseSheet — shared bottom sheet listing members per RSVP status,
// with a Lions-2.0 switcher between Zugesagt / Abgesagt / Offen.
// Opened from the list-card counters and the Termin-Detail "Meldungen" rows.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

const RS_META = {
  yes:  { label: 'Zugesagt',     icon: 'check',       fg: 'var(--status-yes-fg)', dot: 'var(--status-yes-dot)' },
  no:   { label: 'Abgesagt',     icon: 'x',           fg: 'var(--status-no-fg)',  dot: 'var(--status-no-dot)' },
  open: { label: 'Keine Meldung', icon: 'circle-help', fg: 'var(--ink-500)',       dot: 'var(--status-open-dot)' },
};
const RS_ORDER = ['yes', 'no', 'open'];

function ResponseSheet({ sheet, onClose, onStatus }) {
  const { Avatar } = LC;
  const { Ic } = window;
  const open = !!sheet;
  const ev = open ? window.LC_DATA.events.find(x => x.id === sheet.eventId) : null;
  const groups = ev ? window.LC_DATA.responsesFor(ev) : { yes: [], no: [], open: [] };
  const active = sheet ? sheet.status : 'yes';
  const list = groups[active] || [];
  const counts = { yes: ev ? ev.yes : 0, no: ev ? ev.no : 0, open: ev ? ev.open : 0 };

  return (
    <div className={'rs' + (open ? ' rs--open' : '')} aria-hidden={!open}>
      <button className="rs__scrim" aria-label="Schließen" onClick={onClose} tabIndex={open ? 0 : -1} />
      <div className="rs__panel" role="dialog" aria-label="Meldungen"
        style={{ transform: open ? 'translateY(0)' : 'translateY(101%)' }}>
        <div className="rs__grab" />
        <div className="rs__head">
          <div className="rs__hetxt">
            <div className="rs__eyebrow">Meldungen</div>
            <div className="rs__title">{ev ? ev.title : ''}</div>
          </div>
          <button className="rs__close" aria-label="Schließen" onClick={onClose}><Ic name="x" size={20} /></button>
        </div>

        <div className="rs__switch" role="tablist">
          {RS_ORDER.map(k => {
            const m = RS_META[k];
            const on = k === active;
            return (
              <button key={k} role="tab" aria-selected={on}
                className={'rs__tab' + (on ? ' rs__tab--on' : '')}
                style={on ? { '--rs-fg': m.fg } : undefined}
                onClick={() => onStatus(k)}>
                <span className="rs__tabdot" style={{ background: m.dot }} />
                <span className="rs__tablbl">{m.label}</span>
                <span className="rs__tabnum">{counts[k]}</span>
              </button>
            );
          })}
        </div>

        <div className="rs__list">
          {list.map((m, i) => (
            <div key={i} className="rs__row">
              <Avatar name={m.name} tone={m.tone} />
              <div className="rs__rowbody">
                <div className="rs__name">{m.name}</div>
                <div className="rs__role">{m.role}</div>
              </div>
              {m.companion
                ? <span className="rs__companion"><Ic name="user-plus" size={14} /> +1</span>
                : null}
            </div>
          ))}
          {list.length === 0 && <div className="rs__empty">Niemand in dieser Gruppe.</div>}
          <div style={{ height: 8 }} />
        </div>
      </div>
    </div>
  );
}
window.ResponseSheet = ResponseSheet;
