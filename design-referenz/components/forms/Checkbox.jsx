import React from 'react';

const CSS = `
.lc-check{ display: inline-flex; align-items: flex-start; gap: var(--space-3); cursor: pointer; user-select: none; }
.lc-check__box{
  flex: none; width: 24px; height: 24px; margin-top: 1px;
  border: 1.5px solid var(--border-field); border-radius: var(--radius-xs);
  background: var(--surface-card); display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-on-primary);
  transition: background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.lc-check__box svg{ width: 16px; height: 16px; opacity: 0; transform: scale(.6); transition: opacity var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.lc-check input{ position: absolute; opacity: 0; width: 0; height: 0; }
.lc-check input:checked + .lc-check__box{ background: var(--primary); border-color: var(--primary); }
.lc-check input:checked + .lc-check__box svg{ opacity: 1; transform: scale(1); }
.lc-check input:focus-visible + .lc-check__box{ box-shadow: var(--focus-ring); }
.lc-check--radio .lc-check__box{ border-radius: var(--radius-pill); }
.lc-check--radio .lc-check__dot{ width: 10px; height: 10px; border-radius: 50%; background: var(--text-on-primary); opacity: 0; transform: scale(.4); transition: opacity var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.lc-check--radio input:checked + .lc-check__box .lc-check__dot{ opacity: 1; transform: scale(1); }
.lc-check__text{ display: flex; flex-direction: column; gap: 1px; }
.lc-check__label{ font-size: var(--text-base); color: var(--text-strong); font-weight: var(--fw-medium); line-height: 1.35; }
.lc-check__desc{ font-size: var(--text-sm); color: var(--text-secondary); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-check-css')) {
  const el = document.createElement('style');
  el.id = 'lc-check-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Checkbox({ label, description, radio = false, name, className = '', ...rest }) {
  const cls = ['lc-check', radio ? 'lc-check--radio' : '', className].filter(Boolean).join(' ');
  return (
    <label className={cls}>
      <input type={radio ? 'radio' : 'checkbox'} name={name} {...rest} />
      <span className="lc-check__box">
        {radio
          ? <span className="lc-check__dot" />
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>}
      </span>
      {(label || description) ? (
        <span className="lc-check__text">
          {label ? <span className="lc-check__label">{label}</span> : null}
          {description ? <span className="lc-check__desc">{description}</span> : null}
        </span>
      ) : null}
    </label>
  );
}
