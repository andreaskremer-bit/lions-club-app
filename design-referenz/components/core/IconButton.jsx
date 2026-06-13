import React from 'react';

const CSS = `
.lc-iconbtn{
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid transparent; background: transparent;
  color: var(--text-secondary); cursor: pointer;
  border-radius: var(--radius-md);
  transition: background var(--dur-fast) var(--ease-standard),
              color var(--dur-fast) var(--ease-standard);
}
.lc-iconbtn svg{ width: 22px; height: 22px; display: block; }
.lc-iconbtn--sm{ width: 38px; height: 38px; }
.lc-iconbtn--md{ width: 44px; height: 44px; }
.lc-iconbtn--lg{ width: 48px; height: 48px; }
.lc-iconbtn:hover:not(:disabled){ background: var(--surface-fill); color: var(--text-strong); }
.lc-iconbtn:active:not(:disabled){ transform: translateY(1px); }
.lc-iconbtn:disabled{ opacity: .45; cursor: not-allowed; }
.lc-iconbtn--bordered{ border-color: var(--border-strong); background: var(--surface-card); }
.lc-iconbtn--primary{ color: var(--primary); }
.lc-iconbtn--primary:hover:not(:disabled){ background: var(--surface-blue); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-iconbtn-css')) {
  const el = document.createElement('style');
  el.id = 'lc-iconbtn-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function IconButton({
  icon,
  label,
  size = 'md',
  bordered = false,
  tone = 'default',
  className = '',
  ...rest
}) {
  const cls = [
    'lc-iconbtn',
    `lc-iconbtn--${size}`,
    bordered ? 'lc-iconbtn--bordered' : '',
    tone === 'primary' ? 'lc-iconbtn--primary' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type="button" className={cls} aria-label={label} title={label} {...rest}>
      {icon}
    </button>
  );
}
