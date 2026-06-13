import React from 'react';

const CSS = `
.lc-seg{
  display: inline-flex; background: var(--surface-fill);
  border: 1px solid var(--border-hairline); border-radius: var(--radius-md);
  padding: 3px; gap: 2px; width: 100%;
}
.lc-seg__btn{
  flex: 1; appearance: none; border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: var(--text-sm); font-weight: var(--fw-semibold);
  color: var(--text-secondary); background: transparent;
  border-radius: 9px; height: 38px; padding: 0 var(--space-3);
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  transition: color var(--dur-fast), background var(--dur-fast), box-shadow var(--dur-fast);
}
.lc-seg__btn svg{ width: 17px; height: 17px; }
.lc-seg__btn:hover{ color: var(--text-strong); }
.lc-seg__btn--active{ background: var(--surface-card); color: var(--text-strong); box-shadow: var(--shadow-sm); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-seg-css')) {
  const el = document.createElement('style');
  el.id = 'lc-seg-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function SegmentedControl({ options = [], value, onChange = () => {}, className = '' }) {
  return (
    <div className={['lc-seg', className].filter(Boolean).join(' ')} role="tablist">
      {options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const text = typeof o === 'string' ? o : o.label;
        const icon = typeof o === 'object' ? o.icon : null;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={active}
            className={['lc-seg__btn', active ? 'lc-seg__btn--active' : ''].filter(Boolean).join(' ')}
            onClick={() => onChange(val)}
          >
            {icon}{text}
          </button>
        );
      })}
    </div>
  );
}
