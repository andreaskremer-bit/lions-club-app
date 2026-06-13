import React from 'react';

const CSS = `
.lc-status{
  display: inline-flex; align-items: center; gap: var(--space-2);
  font-family: var(--font-sans); font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  padding: 4px var(--space-3) 4px var(--space-2);
  border-radius: var(--radius-pill); white-space: nowrap;
  line-height: 1;
}
.lc-status__dot{ width: 9px; height: 9px; border-radius: 50%; flex: none; }
.lc-status--yes{ background: var(--status-yes-bg); color: var(--status-yes-fg); }
.lc-status--yes .lc-status__dot{ background: var(--status-yes-dot); }
.lc-status--no{ background: var(--status-no-bg); color: var(--status-no-fg); }
.lc-status--no .lc-status__dot{ background: var(--status-no-dot); }
.lc-status--open{ background: var(--status-open-bg); color: var(--status-open-fg); }
.lc-status--open .lc-status__dot{ background: var(--status-open-dot); }
.lc-status--present{ background: var(--present-bg); color: var(--present-fg); }
.lc-status--present .lc-status__dot{ background: var(--present-dot); }

/* dot-only variant for dense list rows */
.lc-status-dot{ width: 12px; height: 12px; border-radius: 50%; flex: none; display: inline-block; border: 2px solid transparent; }
.lc-status-dot--yes{ background: var(--status-yes-dot); }
.lc-status-dot--no{ background: var(--status-no-dot); }
.lc-status-dot--open{ background: transparent; border-color: var(--status-open-dot); }
.lc-status-dot--present{ background: var(--present-dot); }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-status-css')) {
	const el = document.createElement('style');
	el.id = 'lc-status-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

const LABELS = {
	yes: 'Zugesagt',
	no: 'Abgesagt',
	open: 'Offen',
	present: 'Anwesend'
};

export function StatusBadge({
	status = 'open',
	children,
	dotOnly = false,
	className = '',
	...rest
}) {
	if (dotOnly) {
		return (
			<span
				className={['lc-status-dot', `lc-status-dot--${status}`, className]
					.filter(Boolean)
					.join(' ')}
				aria-label={LABELS[status]}
				{...rest}
			/>
		);
	}
	return (
		<span
			className={['lc-status', `lc-status--${status}`, className].filter(Boolean).join(' ')}
			{...rest}
		>
			<span className="lc-status__dot" />
			{children || LABELS[status]}
		</span>
	);
}
