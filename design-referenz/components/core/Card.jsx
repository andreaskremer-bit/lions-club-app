import React from 'react';

const CSS = `
.lc-card{
  background: var(--surface-card);
  border: 1px solid var(--border-hairline);
  border-radius: var(--radius-md);
  padding: var(--space-5);
}
.lc-card--lg{ border-radius: var(--radius-lg); padding: var(--space-6); }
.lc-card--flush{ padding: 0; }
.lc-card--sunken{ background: var(--surface-sunken); }
.lc-card--interactive{
  cursor: pointer; text-align: left; width: 100%; display: block;
  transition: border-color var(--dur-fast) var(--ease-standard),
              background var(--dur-fast) var(--ease-standard);
}
.lc-card--interactive:hover{ border-color: var(--border-strong); background: var(--cream-50); }
.lc-card--interactive:active{ transform: translateY(1px); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-card-css')) {
	const el = document.createElement('style');
	el.id = 'lc-card-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function Card({
	children,
	size = 'md',
	flush = false,
	sunken = false,
	interactive = false,
	as,
	className = '',
	...rest
}) {
	const Tag = as || (interactive ? 'button' : 'div');
	const cls = [
		'lc-card',
		size === 'lg' ? 'lc-card--lg' : '',
		flush ? 'lc-card--flush' : '',
		sunken ? 'lc-card--sunken' : '',
		interactive ? 'lc-card--interactive' : '',
		className
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Tag className={cls} {...rest}>
			{children}
		</Tag>
	);
}
