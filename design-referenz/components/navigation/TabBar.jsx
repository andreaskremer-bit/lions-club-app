import React from 'react';

const CSS = `
.lc-tabbar{
  display: flex; align-items: stretch;
  background: var(--surface-card);
  border-top: 1px solid var(--border-hairline);
  padding: 6px 6px calc(6px + env(safe-area-inset-bottom, 0px));
  min-height: var(--tabbar-h);
}
.lc-tabbar__item{
  flex: 1; appearance: none; border: none; background: transparent; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  font-family: var(--font-sans); font-size: 11px; font-weight: var(--fw-semibold);
  color: var(--text-muted); padding: 6px 2px; border-radius: var(--radius-sm);
  transition: color var(--dur-fast) var(--ease-standard);
  position: relative; min-height: 52px;
}
.lc-tabbar__icon{ display: inline-flex; }
.lc-tabbar__icon svg{ width: 24px; height: 24px; stroke-width: 1.9; }
.lc-tabbar__item:hover{ color: var(--text-secondary); }
.lc-tabbar__item--active{ color: var(--primary); }
.lc-tabbar__item--active .lc-tabbar__icon svg{ stroke-width: 2.2; }
.lc-tabbar__badge{
  position: absolute; top: 4px; left: calc(50% + 8px);
  min-width: 16px; height: 16px; padding: 0 4px; border-radius: var(--radius-pill);
  background: var(--clay-600); color: #fff; font-size: 10px; font-weight: var(--fw-bold);
  display: inline-flex; align-items: center; justify-content: center;
}
`;

if (typeof document !== 'undefined' && !document.getElementById('lc-tabbar-css')) {
  const el = document.createElement('style');
  el.id = 'lc-tabbar-css';
  el.textContent = CSS;
  document.head.appendChild(el);
}

export function TabBar({ items = [], value, onChange = () => {}, className = '' }) {
  return (
    <nav className={['lc-tabbar', className].filter(Boolean).join(' ')}>
      {items.map(it => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            className={['lc-tabbar__item', active ? 'lc-tabbar__item--active' : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(it.id)}
          >
            <span className="lc-tabbar__icon">{active && it.iconActive ? it.iconActive : it.icon}</span>
            {it.badge ? <span className="lc-tabbar__badge">{it.badge}</span> : null}
            <span className="lc-tabbar__label">{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
