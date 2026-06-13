import React from 'react';

const CSS = `
.lc-hint{
  display: flex; gap: var(--space-3);
  background: var(--surface-card);
  border: 1px solid var(--border-hairline);
  border-left: 4px solid var(--tone-accent, var(--border-strong));
  border-radius: var(--radius-md);
  padding: var(--space-4);
}
.lc-hint__icon{ flex: none; color: var(--tone-accent); margin-top: 1px; }
.lc-hint__icon svg{ width: 20px; height: 20px; display: block; }
.lc-hint__body{ min-width: 0; }
.lc-hint__title{
  font-family: var(--font-sans); font-weight: var(--fw-semibold);
  font-size: var(--text-base); color: var(--text-strong);
  margin: 0 0 2px;
}
.lc-hint__text{ font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }
.lc-hint--info{ --tone-accent: var(--blue-600); background: var(--surface-blue); }
.lc-hint--accent{ --tone-accent: var(--gold-600); background: var(--surface-gold); }
.lc-hint--warning{ --tone-accent: var(--clay-600); background: var(--surface-clay); }
.lc-hint--neutral{ --tone-accent: var(--border-strong); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-hint-css')) {
	const el = document.createElement('style');
	el.id = 'lc-hint-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function HintCard({ children, title, tone = 'info', icon = null, className = '', ...rest }) {
	const cls = ['lc-hint', `lc-hint--${tone}`, className].filter(Boolean).join(' ');
	return (
		<div className={cls} role="note" {...rest}>
			{icon ? <span className="lc-hint__icon">{icon}</span> : null}
			<div className="lc-hint__body">
				{title ? <p className="lc-hint__title">{title}</p> : null}
				{children ? <p className="lc-hint__text">{children}</p> : null}
			</div>
		</div>
	);
}
