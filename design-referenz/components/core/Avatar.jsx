import React from 'react';

const CSS = `
.lc-avatar{
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-pill); overflow: hidden;
  background: var(--gold-100); color: var(--gold-700);
  font-family: var(--font-sans); font-weight: var(--fw-semibold);
  flex: none; user-select: none;
  border: 1px solid rgba(33,30,24,0.06);
}
.lc-avatar img{ width: 100%; height: 100%; object-fit: cover; display: block; }
.lc-avatar--xs{ width: 28px; height: 28px; font-size: 11px; }
.lc-avatar--sm{ width: 36px; height: 36px; font-size: 13px; }
.lc-avatar--md{ width: 44px; height: 44px; font-size: 16px; }
.lc-avatar--lg{ width: 56px; height: 56px; font-size: 20px; }
.lc-avatar--xl{ width: 80px; height: 80px; font-size: 28px; }
.lc-avatar--blue{ background: var(--blue-100); color: var(--blue-700); }
.lc-avatar--cream{ background: var(--cream-200); color: var(--ink-700); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-avatar-css')) {
	const el = document.createElement('style');
	el.id = 'lc-avatar-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

function initials(name = '') {
	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((w) => w[0] || '')
		.join('')
		.toUpperCase();
}

export function Avatar({
	name = '',
	src = null,
	size = 'md',
	tone = 'gold',
	className = '',
	...rest
}) {
	const cls = [
		'lc-avatar',
		`lc-avatar--${size}`,
		tone !== 'gold' ? `lc-avatar--${tone}` : '',
		className
	]
		.filter(Boolean)
		.join(' ');

	return (
		<span className={cls} aria-label={name || undefined} {...rest}>
			{src ? <img src={src} alt={name} /> : initials(name)}
		</span>
	);
}
