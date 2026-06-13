import React from 'react';

const CSS = `
.lc-otp{ display: flex; gap: var(--space-3); }
.lc-otp__cell{
  font-family: var(--font-mono); font-size: var(--text-xl);
  font-weight: var(--fw-medium); text-align: center;
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  width: 48px; height: 56px; padding: 0;
  font-variant-numeric: tabular-nums;
  transition: border-color var(--dur-fast) var(--ease-standard),
              box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-otp__cell:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-otp__cell--filled{ border-color: var(--border-strong); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-otp-css')) {
  const el = document.createElement('style');
  el.id = 'lc-otp-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function OtpInput({ length = 6, value = '', onChange = () => {}, className = '' }) {
  const refs = React.useRef([]);
  const chars = value.padEnd(length, ' ').slice(0, length).split('');

  function setChar(i, ch) {
    const next = value.padEnd(length, ' ').split('');
    next[i] = ch || ' ';
    onChange(next.join('').replace(/ +$/, ''));
  }

  function handleKey(i, e) {
    if (e.key === 'Backspace' && !chars[i].trim() && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handleInput(i, e) {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) { setChar(i, ''); return; }
    const digit = v[v.length - 1];
    setChar(i, digit);
    if (i < length - 1) refs.current[i + 1]?.focus();
  }

  function handlePaste(e) {
    const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (digits) { e.preventDefault(); onChange(digits); refs.current[Math.min(digits.length, length - 1)]?.focus(); }
  }

  return (
    <div className={['lc-otp', className].filter(Boolean).join(' ')} onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          className={['lc-otp__cell', chars[i].trim() ? 'lc-otp__cell--filled' : ''].filter(Boolean).join(' ')}
          inputMode="numeric"
          maxLength={1}
          value={chars[i].trim()}
          aria-label={`Ziffer ${i + 1}`}
          onChange={e => handleInput(i, e)}
          onKeyDown={e => handleKey(i, e)}
        />
      ))}
    </div>
  );
}
