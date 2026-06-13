import React from 'react';

const CSS = `
.lc-field{ display: flex; flex-direction: column; gap: var(--space-2); }
.lc-field__label{
  font-family: var(--font-sans); font-size: var(--text-sm);
  font-weight: var(--fw-semibold); color: var(--text-strong);
}
.lc-field__req{ color: var(--clay-600); margin-left: 2px; }
.lc-field__hint{ font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }
.lc-input-wrap{ position: relative; display: flex; align-items: center; }
.lc-input{
  font-family: var(--font-sans); font-size: var(--text-base);
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  height: 48px; width: 100%; padding: 0 var(--space-4);
  transition: border-color var(--dur-fast) var(--ease-standard),
              box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-input::placeholder{ color: var(--text-muted); }
.lc-input:hover{ border-color: var(--border-strong); }
.lc-input:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-input--has-icon{ padding-left: 44px; }
.lc-input__icon{
  position: absolute; left: var(--space-4); display: inline-flex;
  color: var(--text-muted); pointer-events: none;
}
.lc-input__icon svg{ width: 20px; height: 20px; }
.lc-input--error{ border-color: var(--clay-600); }
.lc-input--error:focus{ box-shadow: 0 0 0 3px rgba(180,80,47,.22); }
.lc-field__error{
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-sm); color: var(--danger-fg); font-weight: var(--fw-medium); margin: 0;
}
textarea.lc-input{ height: auto; min-height: 96px; padding: var(--space-3) var(--space-4); resize: vertical; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-input-css')) {
  const el = document.createElement('style');
  el.id = 'lc-input-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function Input({
  label,
  hint,
  error,
  required = false,
  icon = null,
  id,
  multiline = false,
  className = '',
  ...rest
}) {
  const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const Tag = multiline ? 'textarea' : 'input';
  const inputCls = ['lc-input', icon ? 'lc-input--has-icon' : '', error ? 'lc-input--error' : ''].filter(Boolean).join(' ');
  return (
    <div className={['lc-field', className].filter(Boolean).join(' ')}>
      {label ? (
        <label className="lc-field__label" htmlFor={fieldId}>
          {label}{required ? <span className="lc-field__req">*</span> : null}
        </label>
      ) : null}
      <div className="lc-input-wrap">
        {icon ? <span className="lc-input__icon">{icon}</span> : null}
        <Tag id={fieldId} className={inputCls} aria-invalid={!!error} {...rest} />
      </div>
      {error ? <p className="lc-field__error">{error}</p> : hint ? <p className="lc-field__hint">{hint}</p> : null}
    </div>
  );
}
