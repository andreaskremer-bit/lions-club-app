import React from 'react';

const CSS = `
.lc-btn{
  font-family: var(--font-sans);
  font-weight: var(--fw-semibold);
  display: inline-flex; align-items: center; justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-decoration: none;
  line-height: 1;
  transition: background var(--dur-fast) var(--ease-standard),
              border-color var(--dur-fast) var(--ease-standard),
              color var(--dur-fast) var(--ease-standard),
              transform var(--dur-fast) var(--ease-standard);
  white-space: nowrap;
}
.lc-btn:active{ transform: translateY(1px); }
.lc-btn:disabled{ cursor: not-allowed; opacity: .5; transform: none; }
.lc-btn--full{ width: 100%; }

/* sizes — all >= 44px touch target on md/lg */
.lc-btn--sm{ height: 38px; padding: 0 var(--space-4); font-size: var(--text-sm); }
.lc-btn--md{ height: 48px; padding: 0 var(--space-5); font-size: var(--text-base); }
.lc-btn--lg{ height: 54px; padding: 0 var(--space-6); font-size: var(--text-md); border-radius: var(--radius-lg); }

/* primary */
.lc-btn--primary{ background: var(--primary); color: var(--text-on-primary); }
.lc-btn--primary:hover:not(:disabled){ background: var(--primary-hover); }
.lc-btn--primary:active:not(:disabled){ background: var(--primary-press); }

/* secondary — hairline on card */
.lc-btn--secondary{ background: var(--surface-card); color: var(--text-strong); border-color: var(--border-strong); }
.lc-btn--secondary:hover:not(:disabled){ background: var(--surface-fill); }

/* ghost */
.lc-btn--ghost{ background: transparent; color: var(--primary); }
.lc-btn--ghost:hover:not(:disabled){ background: var(--surface-blue); }

/* danger */
.lc-btn--danger{ background: transparent; color: var(--danger-fg); border-color: var(--clay-100); }
.lc-btn--danger:hover:not(:disabled){ background: var(--danger-bg); }

.lc-btn__icon{ display: inline-flex; }
.lc-btn__icon svg{ width: 1.15em; height: 1.15em; display: block; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-button-css')) {
	const el = document.createElement('style');
	el.id = 'lc-button-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function Button({
	children,
	variant = 'primary',
	size = 'md',
	iconLeft = null,
	iconRight = null,
	fullWidth = false,
	as = 'button',
	className = '',
	...rest
}) {
	const Tag = as;
	const cls = [
		'lc-btn',
		`lc-btn--${variant}`,
		`lc-btn--${size}`,
		fullWidth ? 'lc-btn--full' : '',
		className
	]
		.filter(Boolean)
		.join(' ');

	return (
		<Tag className={cls} {...rest}>
			{iconLeft ? <span className="lc-btn__icon">{iconLeft}</span> : null}
			{children}
			{iconRight ? <span className="lc-btn__icon">{iconRight}</span> : null}
		</Tag>
	);
}
