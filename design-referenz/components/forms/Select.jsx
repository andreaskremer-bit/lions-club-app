import React from 'react';

const CSS = `
.lc-select-wrap{ position: relative; display: flex; flex-direction: column; gap: var(--space-2); }
.lc-select-field{ position: relative; display: flex; align-items: center; }
.lc-select{
  appearance: none; -webkit-appearance: none;
  font-family: var(--font-sans); font-size: var(--text-base);
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  height: 48px; width: 100%; padding: 0 44px 0 var(--space-4); cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-select:hover{ border-color: var(--border-strong); }
.lc-select:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-select__chev{
  position: absolute; right: var(--space-4); pointer-events: none;
  color: var(--text-secondary); display: inline-flex;
}
.lc-select__chev svg{ width: 18px; height: 18px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-select-css')) {
  const el = document.createElement('style');
  el.id = 'lc-select-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Select({
  label,
  options = [],
  placeholder,
  id,
  className = '',
  ...rest
}) {
  const fieldId = id || (label ? `s-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return (
    <div className={['lc-select-wrap', className].filter(Boolean).join(' ')}>
      {label ? <label className="lc-field__label" htmlFor={fieldId}>{label}</label> : null}
      <div className="lc-select-field">
        <select id={fieldId} className="lc-select" {...rest}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map(o => {
            const value = typeof o === 'string' ? o : o.value;
            const text = typeof o === 'string' ? o : o.label;
            return <option key={value} value={value}>{text}</option>;
          })}
        </select>
        <span className="lc-select__chev">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </span>
      </div>
    </div>
  );
}
