import React from 'react';

const CSS = `
.lc-tag{
  display: inline-flex; align-items: center; gap: var(--space-1);
  font-family: var(--font-sans); font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  padding: 3px var(--space-3); border-radius: var(--radius-pill);
  background: var(--surface-fill); color: var(--text-body);
  border: 1px solid transparent; white-space: nowrap;
}
.lc-tag--outline{ background: transparent; border-color: var(--border-hairline); color: var(--text-secondary); }
.lc-tag--blue{ background: var(--blue-50); color: var(--blue-700); }
.lc-tag--gold{ background: var(--gold-50); color: var(--gold-700); }
.lc-tag--clay{ background: var(--clay-50); color: var(--clay-700); }
.lc-tag--sage{ background: var(--sage-50); color: var(--sage-700); }
.lc-tag__dot{ width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
.lc-tag svg{ width: 14px; height: 14px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-tag-css')) {
	const el = document.createElement('style');
	el.id = 'lc-tag-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function Tag({
	children,
	tone = 'neutral',
	outline = false,
	dot = false,
	icon = null,
	className = '',
	...rest
}) {
	const cls = [
		'lc-tag',
		outline ? 'lc-tag--outline' : '',
		tone !== 'neutral' ? `lc-tag--${tone}` : '',
		className
	]
		.filter(Boolean)
		.join(' ');

	return (
		<span className={cls} {...rest}>
			{dot ? <span className="lc-tag__dot" /> : null}
			{icon}
			{children}
		</span>
	);
}
