// QuestionField — flexible Zusatzabfrage renderer (Phase-2 survey engine, used inline at the event).
// kinds: single | multi | text | bool | number. Controlled via value/onChange.
const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;

function NumberStepper({ value, onChange, min = 0, max = 99, unit }) {
  const { Ic } = window;
  const v = typeof value === 'number' ? value : (min || 0);
  const set = (n) => onChange(Math.max(min, Math.min(max, n)));
  return (
    <div className="qf-num">
      <button type="button" className="qf-num__btn" aria-label="Weniger" disabled={v <= min} onClick={() => set(v - 1)}><Ic name="minus" size={18} /></button>
      <div className="qf-num__val"><span className="u-mono">{v}</span>{unit ? <span className="qf-num__unit">{unit}</span> : null}</div>
      <button type="button" className="qf-num__btn" aria-label="Mehr" disabled={v >= max} onClick={() => set(v + 1)}><Ic name="plus" size={18} /></button>
    </div>
  );
}

function QuestionField({ q, value, onChange }) {
  const { Checkbox, Input, SegmentedControl } = LC;
  const { Ic } = window;

  let control = null;
  if (q.kind === 'single') {
    control = (
      <div className="qf-choices">
        {q.options.map(opt => (
          <Checkbox key={opt} radio name={'q-' + q.id + '-' + (q._scope || '')} label={opt}
            checked={value === opt} onChange={() => onChange(opt)} />
        ))}
      </div>
    );
  } else if (q.kind === 'multi') {
    const arr = Array.isArray(value) ? value : [];
    const toggle = (opt) => onChange(arr.includes(opt) ? arr.filter(x => x !== opt) : [...arr, opt]);
    control = (
      <div className="qf-choices">
        {q.options.map(opt => (
          <Checkbox key={opt} label={opt} checked={arr.includes(opt)} onChange={() => toggle(opt)} />
        ))}
      </div>
    );
  } else if (q.kind === 'bool') {
    control = (
      <SegmentedControl value={value === true ? 'ja' : value === false ? 'nein' : ''}
        onChange={v => onChange(v === 'ja')}
        options={[{ label: 'Ja', value: 'ja' }, { label: 'Nein', value: 'nein' }]} />
    );
  } else if (q.kind === 'number') {
    control = <NumberStepper value={value} onChange={onChange} min={q.min} max={q.max} unit={q.unit} />;
  } else { // text
    control = <Input multiline={q.multiline} placeholder={q.placeholder} value={value || ''} onChange={e => onChange(e.target.value)} />;
  }

  return (
    <div className="qf">
      <div className="qf__label">
        {q.icon ? <span className="qf__ic"><Ic name={q.icon} size={16} /></span> : null}
        <span>{q.label}{q.required ? <span className="qf__req">*</span> : null}</span>
      </div>
      {control}
    </div>
  );
}

window.QuestionField = QuestionField;
