import React from 'react';

const CSS = `
.lc-switch{ display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer; user-select: none; }
.lc-switch input{ position: absolute; opacity: 0; width: 0; height: 0; }
.lc-switch__track{
  position: relative; width: 46px; height: 28px; flex: none;
  background: var(--cream-300); border-radius: var(--radius-pill);
  transition: background var(--dur-normal) var(--ease-standard);
}
.lc-switch__thumb{
  position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
  background: #fff; border-radius: 50%; box-shadow: var(--shadow-sm);
  transition: transform var(--dur-normal) var(--ease-out);
}
.lc-switch input:checked + .lc-switch__track{ background: var(--primary); }
.lc-switch input:checked + .lc-switch__track .lc-switch__thumb{ transform: translateX(18px); }
.lc-switch input:focus-visible + .lc-switch__track{ box-shadow: var(--focus-ring); }
.lc-switch input:disabled + .lc-switch__track{ opacity: .5; }
.lc-switch__label{ font-size: var(--text-base); color: var(--text-strong); font-weight: var(--fw-medium); }
.lc-switch--present input:checked + .lc-switch__track{ background: var(--present-dot); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-switch-css')) {
  const el = document.createElement('style');
  el.id = 'lc-switch-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Switch({ label, tone = 'primary', className = '', ...rest }) {
  const cls = ['lc-switch', tone === 'present' ? 'lc-switch--present' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input type="checkbox" {...rest} />
      <span className="lc-switch__track"><span className="lc-switch__thumb" /></span>
      {label ? <span className="lc-switch__label">{label}</span> : null}
    </label>
  );
}
