import React from 'react';

const CSS = `
.lc-appbar{
  display: flex; align-items: center; gap: var(--space-2);
  min-height: 56px; padding: var(--space-2) var(--space-3);
  background: var(--surface-app);
  border-bottom: 1px solid transparent;
}
.lc-appbar--bordered{ border-bottom-color: var(--border-hairline); background: var(--surface-card); }
.lc-appbar__lead, .lc-appbar__trail{ flex: none; display: flex; align-items: center; gap: var(--space-1); }
.lc-appbar__title-wrap{ flex: 1; min-width: 0; display: flex; flex-direction: column; }
.lc-appbar__title{
  font-family: var(--font-display); font-weight: var(--fw-semibold);
  font-size: var(--text-xl); color: var(--text-strong); line-height: 1.15;
  letter-spacing: var(--tracking-tight);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.lc-appbar--center .lc-appbar__title-wrap{ align-items: center; text-align: center; }
.lc-appbar__eyebrow{ font-family: var(--font-mono); font-size: 11px; letter-spacing: var(--tracking-label); text-transform: uppercase; color: var(--text-secondary); }
.lc-appbar--large{ padding: var(--space-4) var(--space-4) var(--space-3); }
.lc-appbar--large .lc-appbar__title{ font-size: var(--text-2xl); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-appbar-css')) {
	const el = document.createElement('style');
	el.id = 'lc-appbar-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function AppBar({
	title,
	eyebrow,
	leading = null,
	trailing = null,
	bordered = false,
	center = false,
	large = false,
	className = ''
}) {
	const cls = [
		'lc-appbar',
		bordered ? 'lc-appbar--bordered' : '',
		center ? 'lc-appbar--center' : '',
		large ? 'lc-appbar--large' : '',
		className
	]
		.filter(Boolean)
		.join(' ');
	return (
		<header className={cls}>
			{leading ? <div className="lc-appbar__lead">{leading}</div> : null}
			<div className="lc-appbar__title-wrap">
				{eyebrow ? <span className="lc-appbar__eyebrow">{eyebrow}</span> : null}
				{title ? <span className="lc-appbar__title">{title}</span> : null}
			</div>
			{trailing ? <div className="lc-appbar__trail">{trailing}</div> : null}
		</header>
	);
}
