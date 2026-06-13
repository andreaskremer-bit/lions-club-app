import React from 'react';

const CSS = `
.lc-row{
  display: flex; align-items: center; gap: var(--space-3);
  width: 100%; text-align: left; background: transparent; border: none;
  padding: var(--space-3) var(--space-4); cursor: pointer; font-family: var(--font-sans);
  transition: background var(--dur-fast) var(--ease-standard);
}
.lc-row + .lc-row{ border-top: 1px solid var(--border-hairline); }
.lc-row:hover{ background: var(--cream-50); }
.lc-row:active{ background: var(--surface-fill); }
.lc-row--static{ cursor: default; }
.lc-row--static:hover{ background: transparent; }
.lc-row__lead{ flex: none; display: inline-flex; align-items: center; }
.lc-row__body{ flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
.lc-row__title{ font-size: var(--text-md); font-weight: var(--fw-semibold); color: var(--text-strong); line-height: 1.3; }
.lc-row__sub{ font-size: var(--text-sm); color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lc-row__trail{ flex: none; display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary); }
.lc-row__date{ font-family: var(--font-mono); font-size: var(--text-sm); font-variant-numeric: tabular-nums; color: var(--text-secondary); text-align: right; }
.lc-row__chev{ color: var(--text-muted); display: inline-flex; }
.lc-row__chev svg{ width: 20px; height: 20px; }
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-row-css')) {
	const el = document.createElement('style');
	el.id = 'lc-row-css';
	el.textContent = CSS;
	document.head.appendChild(el);
}

export function ListRow({
	lead = null,
	title,
	subtitle,
	date,
	trailing = null,
	chevron = false,
	interactive = true,
	className = '',
	...rest
}) {
	const Tag = interactive ? 'button' : 'div';
	const cls = ['lc-row', interactive ? '' : 'lc-row--static', className].filter(Boolean).join(' ');
	return (
		<Tag className={cls} type={interactive ? 'button' : undefined} {...rest}>
			{lead ? <span className="lc-row__lead">{lead}</span> : null}
			<span className="lc-row__body">
				{title ? <span className="lc-row__title">{title}</span> : null}
				{subtitle ? <span className="lc-row__sub">{subtitle}</span> : null}
			</span>
			{date || trailing || chevron ? (
				<span className="lc-row__trail">
					{date ? <span className="lc-row__date">{date}</span> : null}
					{trailing}
					{chevron ? (
						<span className="lc-row__chev">
							<svg
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="m9 18 6-6-6-6" />
							</svg>
						</span>
					) : null}
				</span>
			) : null}
		</Tag>
	);
}
