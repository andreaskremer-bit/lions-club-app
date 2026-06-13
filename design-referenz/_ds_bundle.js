/* @ds-bundle: {"format":3,"namespace":"LionsClubBonnRheinaueDesignSystem_4b530e","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"HintCard","sourcePath":"components/feedback/HintCard.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"OtpInput","sourcePath":"components/forms/OtpInput.jsx"},{"name":"SegmentedControl","sourcePath":"components/forms/SegmentedControl.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"AppBar","sourcePath":"components/navigation/AppBar.jsx"},{"name":"ListRow","sourcePath":"components/navigation/ListRow.jsx"},{"name":"TabBar","sourcePath":"components/navigation/TabBar.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"9c5276ccc91f","components/core/Button.jsx":"185edf959413","components/core/Card.jsx":"fd2206f241fd","components/core/IconButton.jsx":"399208cebe61","components/core/Tag.jsx":"e65fcb0941d0","components/feedback/HintCard.jsx":"69b61a0e18db","components/feedback/StatusBadge.jsx":"53f713d881b4","components/forms/Checkbox.jsx":"05625e9021d5","components/forms/Input.jsx":"01b5f0e87512","components/forms/OtpInput.jsx":"922a870ec4a5","components/forms/SegmentedControl.jsx":"6ce0d548b7dc","components/forms/Select.jsx":"e19f5a144ba2","components/forms/Switch.jsx":"7edbb1c60e92","components/navigation/AppBar.jsx":"d32f34414394","components/navigation/ListRow.jsx":"e6f00f5f2c22","components/navigation/TabBar.jsx":"06ad3f311947","ui_kits/club-app/AdminScreen.jsx":"3358e45eb452","ui_kits/club-app/App.jsx":"151eaad9cc4c","ui_kits/club-app/AttendanceScreen.jsx":"8080d140a7a0","ui_kits/club-app/EventDetailScreen.jsx":"8022dc34d5f1","ui_kits/club-app/EventListScreen.jsx":"c955a8dc0a05","ui_kits/club-app/LoginScreen.jsx":"160b04ca985b","ui_kits/club-app/MembersScreen.jsx":"0c87e8f42c54","ui_kits/club-app/ProfileScreen.jsx":"fc3e68e1372b","ui_kits/club-app/QuestionField.jsx":"f34b8a68f919","ui_kits/club-app/ResponseSheet.jsx":"32c5a179d776","ui_kits/club-app/TreasurerScreen.jsx":"3f76b4e576e5","ui_kits/club-app/data.js":"75289bedb970","ui_kits/club-app/helpers.jsx":"8eb17701e423"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {
	const __ds_ns = (window.LionsClubBonnRheinaueDesignSystem_4b530e =
		window.LionsClubBonnRheinaueDesignSystem_4b530e || {});

	const __ds_scope = {};

	__ds_ns.__errors = __ds_ns.__errors || [];

	// components/core/Avatar.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function Avatar({
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
				return /*#__PURE__*/ React.createElement(
					'span',
					_extends(
						{
							className: cls,
							'aria-label': name || undefined
						},
						rest
					),
					src
						? /*#__PURE__*/ React.createElement('img', {
								src: src,
								alt: name
							})
						: initials(name)
				);
			}
			Object.assign(__ds_scope, { Avatar });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/core/Avatar.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/core/Button.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function Button({
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
				return /*#__PURE__*/ React.createElement(
					Tag,
					_extends(
						{
							className: cls
						},
						rest
					),
					iconLeft
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-btn__icon'
								},
								iconLeft
							)
						: null,
					children,
					iconRight
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-btn__icon'
								},
								iconRight
							)
						: null
				);
			}
			Object.assign(__ds_scope, { Button });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/core/Button.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/core/Card.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function Card({
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
				return /*#__PURE__*/ React.createElement(
					Tag,
					_extends(
						{
							className: cls
						},
						rest
					),
					children
				);
			}
			Object.assign(__ds_scope, { Card });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/core/Card.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/core/IconButton.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function IconButton({
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
					className
				]
					.filter(Boolean)
					.join(' ');
				return /*#__PURE__*/ React.createElement(
					'button',
					_extends(
						{
							type: 'button',
							className: cls,
							'aria-label': label,
							title: label
						},
						rest
					),
					icon
				);
			}
			Object.assign(__ds_scope, { IconButton });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/core/IconButton.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/core/Tag.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function Tag({
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
				return /*#__PURE__*/ React.createElement(
					'span',
					_extends(
						{
							className: cls
						},
						rest
					),
					dot
						? /*#__PURE__*/ React.createElement('span', {
								className: 'lc-tag__dot'
							})
						: null,
					icon,
					children
				);
			}
			Object.assign(__ds_scope, { Tag });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/core/Tag.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/feedback/HintCard.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function HintCard({ children, title, tone = 'info', icon = null, className = '', ...rest }) {
				const cls = ['lc-hint', `lc-hint--${tone}`, className].filter(Boolean).join(' ');
				return /*#__PURE__*/ React.createElement(
					'div',
					_extends(
						{
							className: cls,
							role: 'note'
						},
						rest
					),
					icon
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-hint__icon'
								},
								icon
							)
						: null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'lc-hint__body'
						},
						title
							? /*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'lc-hint__title'
									},
									title
								)
							: null,
						children
							? /*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'lc-hint__text'
									},
									children
								)
							: null
					)
				);
			}
			Object.assign(__ds_scope, { HintCard });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/feedback/HintCard.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/feedback/StatusBadge.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function StatusBadge({
				status = 'open',
				children,
				dotOnly = false,
				className = '',
				...rest
			}) {
				if (dotOnly) {
					return /*#__PURE__*/ React.createElement(
						'span',
						_extends(
							{
								className: ['lc-status-dot', `lc-status-dot--${status}`, className]
									.filter(Boolean)
									.join(' '),
								'aria-label': LABELS[status]
							},
							rest
						)
					);
				}
				return /*#__PURE__*/ React.createElement(
					'span',
					_extends(
						{
							className: ['lc-status', `lc-status--${status}`, className].filter(Boolean).join(' ')
						},
						rest
					),
					/*#__PURE__*/ React.createElement('span', {
						className: 'lc-status__dot'
					}),
					children || LABELS[status]
				);
			}
			Object.assign(__ds_scope, { StatusBadge });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/feedback/StatusBadge.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/Checkbox.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
			const CSS = `
.lc-check{ display: inline-flex; align-items: flex-start; gap: var(--space-3); cursor: pointer; user-select: none; }
.lc-check__box{
  flex: none; width: 24px; height: 24px; margin-top: 1px;
  border: 1.5px solid var(--border-field); border-radius: var(--radius-xs);
  background: var(--surface-card); display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-on-primary);
  transition: background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
}
.lc-check__box svg{ width: 16px; height: 16px; opacity: 0; transform: scale(.6); transition: opacity var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.lc-check input{ position: absolute; opacity: 0; width: 0; height: 0; }
.lc-check input:checked + .lc-check__box{ background: var(--primary); border-color: var(--primary); }
.lc-check input:checked + .lc-check__box svg{ opacity: 1; transform: scale(1); }
.lc-check input:focus-visible + .lc-check__box{ box-shadow: var(--focus-ring); }
.lc-check--radio .lc-check__box{ border-radius: var(--radius-pill); }
.lc-check--radio .lc-check__dot{ width: 10px; height: 10px; border-radius: 50%; background: var(--text-on-primary); opacity: 0; transform: scale(.4); transition: opacity var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.lc-check--radio input:checked + .lc-check__box .lc-check__dot{ opacity: 1; transform: scale(1); }
.lc-check__text{ display: flex; flex-direction: column; gap: 1px; }
.lc-check__label{ font-size: var(--text-base); color: var(--text-strong); font-weight: var(--fw-medium); line-height: 1.35; }
.lc-check__desc{ font-size: var(--text-sm); color: var(--text-secondary); }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-check-css')) {
				const el = document.createElement('style');
				el.id = 'lc-check-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function Checkbox({ label, description, radio = false, name, className = '', ...rest }) {
				const cls = ['lc-check', radio ? 'lc-check--radio' : '', className]
					.filter(Boolean)
					.join(' ');
				return /*#__PURE__*/ React.createElement(
					'label',
					{
						className: cls
					},
					/*#__PURE__*/ React.createElement(
						'input',
						_extends(
							{
								type: radio ? 'radio' : 'checkbox',
								name: name
							},
							rest
						)
					),
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'lc-check__box'
						},
						radio
							? /*#__PURE__*/ React.createElement('span', {
									className: 'lc-check__dot'
								})
							: /*#__PURE__*/ React.createElement(
									'svg',
									{
										viewBox: '0 0 24 24',
										fill: 'none',
										stroke: 'currentColor',
										strokeWidth: '3',
										strokeLinecap: 'round',
										strokeLinejoin: 'round'
									},
									/*#__PURE__*/ React.createElement('path', {
										d: 'M20 6 9 17l-5-5'
									})
								)
					),
					label || description
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-check__text'
								},
								label
									? /*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'lc-check__label'
											},
											label
										)
									: null,
								description
									? /*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'lc-check__desc'
											},
											description
										)
									: null
							)
						: null
				);
			}
			Object.assign(__ds_scope, { Checkbox });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/Checkbox.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/Input.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
			const CSS = `
.lc-field{ display: flex; flex-direction: column; gap: var(--space-2); }
.lc-field__label{
  font-family: var(--font-sans); font-size: var(--text-sm);
  font-weight: var(--fw-semibold); color: var(--text-strong);
}
.lc-field__req{ color: var(--clay-600); margin-left: 2px; }
.lc-field__hint{ font-size: var(--text-sm); color: var(--text-secondary); margin: 0; }
.lc-input-wrap{ position: relative; display: flex; align-items: center; }
.lc-input{
  font-family: var(--font-sans); font-size: var(--text-base);
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  height: 48px; width: 100%; padding: 0 var(--space-4);
  transition: border-color var(--dur-fast) var(--ease-standard),
              box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-input::placeholder{ color: var(--text-muted); }
.lc-input:hover{ border-color: var(--border-strong); }
.lc-input:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-input--has-icon{ padding-left: 44px; }
.lc-input__icon{
  position: absolute; left: var(--space-4); display: inline-flex;
  color: var(--text-muted); pointer-events: none;
}
.lc-input__icon svg{ width: 20px; height: 20px; }
.lc-input--error{ border-color: var(--clay-600); }
.lc-input--error:focus{ box-shadow: 0 0 0 3px rgba(180,80,47,.22); }
.lc-field__error{
  display: flex; align-items: center; gap: 6px;
  font-size: var(--text-sm); color: var(--danger-fg); font-weight: var(--fw-medium); margin: 0;
}
textarea.lc-input{ height: auto; min-height: 96px; padding: var(--space-3) var(--space-4); resize: vertical; }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-input-css')) {
				const el = document.createElement('style');
				el.id = 'lc-input-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function Input({
				label,
				hint,
				error,
				required = false,
				icon = null,
				id,
				multiline = false,
				className = '',
				...rest
			}) {
				const fieldId = id || (label ? `f-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
				const Tag = multiline ? 'textarea' : 'input';
				const inputCls = [
					'lc-input',
					icon ? 'lc-input--has-icon' : '',
					error ? 'lc-input--error' : ''
				]
					.filter(Boolean)
					.join(' ');
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: ['lc-field', className].filter(Boolean).join(' ')
					},
					label
						? /*#__PURE__*/ React.createElement(
								'label',
								{
									className: 'lc-field__label',
									htmlFor: fieldId
								},
								label,
								required
									? /*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'lc-field__req'
											},
											'*'
										)
									: null
							)
						: null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'lc-input-wrap'
						},
						icon
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'lc-input__icon'
									},
									icon
								)
							: null,
						/*#__PURE__*/ React.createElement(
							Tag,
							_extends(
								{
									id: fieldId,
									className: inputCls,
									'aria-invalid': !!error
								},
								rest
							)
						)
					),
					error
						? /*#__PURE__*/ React.createElement(
								'p',
								{
									className: 'lc-field__error'
								},
								error
							)
						: hint
							? /*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'lc-field__hint'
									},
									hint
								)
							: null
				);
			}
			Object.assign(__ds_scope, { Input });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/Input.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/OtpInput.jsx
	try {
		(() => {
			const CSS = `
.lc-otp{ display: flex; gap: var(--space-3); }
.lc-otp__cell{
  font-family: var(--font-mono); font-size: var(--text-xl);
  font-weight: var(--fw-medium); text-align: center;
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  width: 48px; height: 56px; padding: 0;
  font-variant-numeric: tabular-nums;
  transition: border-color var(--dur-fast) var(--ease-standard),
              box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-otp__cell:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-otp__cell--filled{ border-color: var(--border-strong); }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-otp-css')) {
				const el = document.createElement('style');
				el.id = 'lc-otp-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function OtpInput({ length = 6, value = '', onChange = () => {}, className = '' }) {
				const refs = React.useRef([]);
				const chars = value.padEnd(length, ' ').slice(0, length).split('');
				function setChar(i, ch) {
					const next = value.padEnd(length, ' ').split('');
					next[i] = ch || ' ';
					onChange(next.join('').replace(/ +$/, ''));
				}
				function handleKey(i, e) {
					if (e.key === 'Backspace' && !chars[i].trim() && i > 0) {
						refs.current[i - 1]?.focus();
					}
				}
				function handleInput(i, e) {
					const v = e.target.value.replace(/\D/g, '');
					if (!v) {
						setChar(i, '');
						return;
					}
					const digit = v[v.length - 1];
					setChar(i, digit);
					if (i < length - 1) refs.current[i + 1]?.focus();
				}
				function handlePaste(e) {
					const digits = (e.clipboardData.getData('text') || '')
						.replace(/\D/g, '')
						.slice(0, length);
					if (digits) {
						e.preventDefault();
						onChange(digits);
						refs.current[Math.min(digits.length, length - 1)]?.focus();
					}
				}
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: ['lc-otp', className].filter(Boolean).join(' '),
						onPaste: handlePaste
					},
					Array.from({
						length
					}).map((_, i) =>
						/*#__PURE__*/ React.createElement('input', {
							key: i,
							ref: (el) => (refs.current[i] = el),
							className: ['lc-otp__cell', chars[i].trim() ? 'lc-otp__cell--filled' : '']
								.filter(Boolean)
								.join(' '),
							inputMode: 'numeric',
							maxLength: 1,
							value: chars[i].trim(),
							'aria-label': `Ziffer ${i + 1}`,
							onChange: (e) => handleInput(i, e),
							onKeyDown: (e) => handleKey(i, e)
						})
					)
				);
			}
			Object.assign(__ds_scope, { OtpInput });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/OtpInput.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/SegmentedControl.jsx
	try {
		(() => {
			const CSS = `
.lc-seg{
  display: inline-flex; background: var(--surface-fill);
  border: 1px solid var(--border-hairline); border-radius: var(--radius-md);
  padding: 3px; gap: 2px; width: 100%;
}
.lc-seg__btn{
  flex: 1; appearance: none; border: none; cursor: pointer;
  font-family: var(--font-sans); font-size: var(--text-sm); font-weight: var(--fw-semibold);
  color: var(--text-secondary); background: transparent;
  border-radius: 9px; height: 38px; padding: 0 var(--space-3);
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  transition: color var(--dur-fast), background var(--dur-fast), box-shadow var(--dur-fast);
}
.lc-seg__btn svg{ width: 17px; height: 17px; }
.lc-seg__btn:hover{ color: var(--text-strong); }
.lc-seg__btn--active{ background: var(--surface-card); color: var(--text-strong); box-shadow: var(--shadow-sm); }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-seg-css')) {
				const el = document.createElement('style');
				el.id = 'lc-seg-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function SegmentedControl({ options = [], value, onChange = () => {}, className = '' }) {
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: ['lc-seg', className].filter(Boolean).join(' '),
						role: 'tablist'
					},
					options.map((o) => {
						const val = typeof o === 'string' ? o : o.value;
						const text = typeof o === 'string' ? o : o.label;
						const icon = typeof o === 'object' ? o.icon : null;
						const active = val === value;
						return /*#__PURE__*/ React.createElement(
							'button',
							{
								key: val,
								type: 'button',
								role: 'tab',
								'aria-selected': active,
								className: ['lc-seg__btn', active ? 'lc-seg__btn--active' : '']
									.filter(Boolean)
									.join(' '),
								onClick: () => onChange(val)
							},
							icon,
							text
						);
					})
				);
			}
			Object.assign(__ds_scope, { SegmentedControl });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/SegmentedControl.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/Select.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
			const CSS = `
.lc-select-wrap{ position: relative; display: flex; flex-direction: column; gap: var(--space-2); }
.lc-select-field{ position: relative; display: flex; align-items: center; }
.lc-select{
  appearance: none; -webkit-appearance: none;
  font-family: var(--font-sans); font-size: var(--text-base);
  color: var(--text-strong); background: var(--surface-card);
  border: 1px solid var(--border-field); border-radius: var(--radius-md);
  height: 48px; width: 100%; padding: 0 44px 0 var(--space-4); cursor: pointer;
  transition: border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
}
.lc-select:hover{ border-color: var(--border-strong); }
.lc-select:focus{ outline: none; border-color: var(--border-focus); box-shadow: var(--focus-ring); }
.lc-select__chev{
  position: absolute; right: var(--space-4); pointer-events: none;
  color: var(--text-secondary); display: inline-flex;
}
.lc-select__chev svg{ width: 18px; height: 18px; }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-select-css')) {
				const el = document.createElement('style');
				el.id = 'lc-select-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function Select({ label, options = [], placeholder, id, className = '', ...rest }) {
				const fieldId = id || (label ? `s-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: ['lc-select-wrap', className].filter(Boolean).join(' ')
					},
					label
						? /*#__PURE__*/ React.createElement(
								'label',
								{
									className: 'lc-field__label',
									htmlFor: fieldId
								},
								label
							)
						: null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'lc-select-field'
						},
						/*#__PURE__*/ React.createElement(
							'select',
							_extends(
								{
									id: fieldId,
									className: 'lc-select'
								},
								rest
							),
							placeholder
								? /*#__PURE__*/ React.createElement(
										'option',
										{
											value: '',
											disabled: true
										},
										placeholder
									)
								: null,
							options.map((o) => {
								const value = typeof o === 'string' ? o : o.value;
								const text = typeof o === 'string' ? o : o.label;
								return /*#__PURE__*/ React.createElement(
									'option',
									{
										key: value,
										value: value
									},
									text
								);
							})
						),
						/*#__PURE__*/ React.createElement(
							'span',
							{
								className: 'lc-select__chev'
							},
							/*#__PURE__*/ React.createElement(
								'svg',
								{
									viewBox: '0 0 24 24',
									fill: 'none',
									stroke: 'currentColor',
									strokeWidth: '2',
									strokeLinecap: 'round',
									strokeLinejoin: 'round'
								},
								/*#__PURE__*/ React.createElement('path', {
									d: 'm6 9 6 6 6-6'
								})
							)
						)
					)
				);
			}
			Object.assign(__ds_scope, { Select });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/Select.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/forms/Switch.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
			const CSS = `
.lc-switch{ display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer; user-select: none; }
.lc-switch input{ position: absolute; opacity: 0; width: 0; height: 0; }
.lc-switch__track{
  position: relative; width: 46px; height: 28px; flex: none;
  background: var(--cream-300); border-radius: var(--radius-pill);
  transition: background var(--dur-normal) var(--ease-standard);
}
.lc-switch__thumb{
  position: absolute; top: 3px; left: 3px; width: 22px; height: 22px;
  background: #fff; border-radius: 50%; box-shadow: var(--shadow-sm);
  transition: transform var(--dur-normal) var(--ease-out);
}
.lc-switch input:checked + .lc-switch__track{ background: var(--primary); }
.lc-switch input:checked + .lc-switch__track .lc-switch__thumb{ transform: translateX(18px); }
.lc-switch input:focus-visible + .lc-switch__track{ box-shadow: var(--focus-ring); }
.lc-switch input:disabled + .lc-switch__track{ opacity: .5; }
.lc-switch__label{ font-size: var(--text-base); color: var(--text-strong); font-weight: var(--fw-medium); }
.lc-switch--present input:checked + .lc-switch__track{ background: var(--present-dot); }
`;
			if (typeof document !== 'undefined' && !document.getElementById('lc-switch-css')) {
				const el = document.createElement('style');
				el.id = 'lc-switch-css';
				el.textContent = CSS;
				document.head.appendChild(el);
			}
			function Switch({ label, tone = 'primary', className = '', ...rest }) {
				const cls = ['lc-switch', tone === 'present' ? 'lc-switch--present' : '', className]
					.filter(Boolean)
					.join(' ');
				return /*#__PURE__*/ React.createElement(
					'label',
					{
						className: cls
					},
					/*#__PURE__*/ React.createElement(
						'input',
						_extends(
							{
								type: 'checkbox'
							},
							rest
						)
					),
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'lc-switch__track'
						},
						/*#__PURE__*/ React.createElement('span', {
							className: 'lc-switch__thumb'
						})
					),
					label
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-switch__label'
								},
								label
							)
						: null
				);
			}
			Object.assign(__ds_scope, { Switch });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/forms/Switch.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/navigation/AppBar.jsx
	try {
		(() => {
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
			function AppBar({
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
				return /*#__PURE__*/ React.createElement(
					'header',
					{
						className: cls
					},
					leading
						? /*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'lc-appbar__lead'
								},
								leading
							)
						: null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'lc-appbar__title-wrap'
						},
						eyebrow
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'lc-appbar__eyebrow'
									},
									eyebrow
								)
							: null,
						title
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'lc-appbar__title'
									},
									title
								)
							: null
					),
					trailing
						? /*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'lc-appbar__trail'
								},
								trailing
							)
						: null
				);
			}
			Object.assign(__ds_scope, { AppBar });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/navigation/AppBar.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/navigation/ListRow.jsx
	try {
		(() => {
			function _extends() {
				return (
					(_extends = Object.assign
						? Object.assign.bind()
						: function (n) {
								for (var e = 1; e < arguments.length; e++) {
									var t = arguments[e];
									for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
								}
								return n;
							}),
					_extends.apply(null, arguments)
				);
			}
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
			function ListRow({
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
				const cls = ['lc-row', interactive ? '' : 'lc-row--static', className]
					.filter(Boolean)
					.join(' ');
				return /*#__PURE__*/ React.createElement(
					Tag,
					_extends(
						{
							className: cls,
							type: interactive ? 'button' : undefined
						},
						rest
					),
					lead
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-row__lead'
								},
								lead
							)
						: null,
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'lc-row__body'
						},
						title
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'lc-row__title'
									},
									title
								)
							: null,
						subtitle
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'lc-row__sub'
									},
									subtitle
								)
							: null
					),
					date || trailing || chevron
						? /*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-row__trail'
								},
								date
									? /*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'lc-row__date'
											},
											date
										)
									: null,
								trailing,
								chevron
									? /*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'lc-row__chev'
											},
											/*#__PURE__*/ React.createElement(
												'svg',
												{
													viewBox: '0 0 24 24',
													fill: 'none',
													stroke: 'currentColor',
													strokeWidth: '2',
													strokeLinecap: 'round',
													strokeLinejoin: 'round'
												},
												/*#__PURE__*/ React.createElement('path', {
													d: 'm9 18 6-6-6-6'
												})
											)
										)
									: null
							)
						: null
				);
			}
			Object.assign(__ds_scope, { ListRow });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/navigation/ListRow.jsx',
			error: String((e && e.message) || e)
		});
	}

	// components/navigation/TabBar.jsx
	try {
		(() => {
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
			function TabBar({ items = [], value, onChange = () => {}, className = '' }) {
				return /*#__PURE__*/ React.createElement(
					'nav',
					{
						className: ['lc-tabbar', className].filter(Boolean).join(' ')
					},
					items.map((it) => {
						const active = it.id === value;
						return /*#__PURE__*/ React.createElement(
							'button',
							{
								key: it.id,
								type: 'button',
								className: ['lc-tabbar__item', active ? 'lc-tabbar__item--active' : '']
									.filter(Boolean)
									.join(' '),
								'aria-current': active ? 'page' : undefined,
								onClick: () => onChange(it.id)
							},
							/*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-tabbar__icon'
								},
								active && it.iconActive ? it.iconActive : it.icon
							),
							it.badge
								? /*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'lc-tabbar__badge'
										},
										it.badge
									)
								: null,
							/*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'lc-tabbar__label'
								},
								it.label
							)
						);
					})
				);
			}
			Object.assign(__ds_scope, { TabBar });
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'components/navigation/TabBar.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/AdminScreen.jsx
	try {
		(() => {
			// Jahresplanung (Admin) — Termine des Clubjahres verwalten.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			const ADMIN_TONE = {
				clubabend: 'blue',
				versammlung: 'blue',
				gesellig: 'gold',
				lions: 'neutral',
				reise: 'sage'
			};
			function AdminScreen({ onBack, onOpen, onResponses }) {
				const { AppBar, IconButton, Button, Card, Tag } = LC;
				const { Ic } = window;
				const events = window.LC_DATA.events;
				const groups = {};
				events.forEach((e) => {
					(groups[e.month] = groups[e.month] || []).push(e);
				});
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						center: true,
						bordered: true,
						title: 'Jahresplanung',
						leading: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-left',
								size: 22
							}),
							label: 'Zur\xFCck',
							onClick: onBack
						}),
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'plus',
								size: 22
							}),
							label: 'Termin anlegen',
							tone: 'primary'
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack',
								style: {
									paddingTop: 14
								}
							},
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'admin-head'
								},
								/*#__PURE__*/ React.createElement(
									'div',
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'admin-head__year'
										},
										'Clubjahr 2025/26'
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'admin-head__sub'
										},
										events.length,
										' Termine geplant'
									)
								),
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'secondary',
										size: 'sm',
										iconLeft: /*#__PURE__*/ React.createElement(Ic, {
											name: 'plus',
											size: 17
										})
									},
									'Termin'
								)
							),
							Object.keys(groups).map((month) =>
								/*#__PURE__*/ React.createElement(
									'div',
									{
										key: month
									},
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'sec-label'
										},
										month
									),
									/*#__PURE__*/ React.createElement(
										Card,
										{
											flush: true
										},
										groups[month].map((e, i) =>
											/*#__PURE__*/ React.createElement(
												'div',
												{
													key: e.id,
													className: 'admin-row' + (i > 0 ? ' admin-row--div' : ''),
													onClick: () => onOpen && onOpen(e.id)
												},
												/*#__PURE__*/ React.createElement(
													'div',
													{
														className: 'admin-row__date'
													},
													/*#__PURE__*/ React.createElement(
														'span',
														{
															className: 'admin-row__d'
														},
														e.day
													),
													/*#__PURE__*/ React.createElement(
														'span',
														{
															className: 'admin-row__mon'
														},
														e.monShort
													)
												),
												/*#__PURE__*/ React.createElement(
													'div',
													{
														className: 'admin-row__body'
													},
													/*#__PURE__*/ React.createElement(
														'div',
														{
															className: 'admin-row__title'
														},
														e.title
													),
													/*#__PURE__*/ React.createElement(
														'div',
														{
															className: 'admin-row__sub'
														},
														/*#__PURE__*/ React.createElement(
															Tag,
															{
																tone: ADMIN_TONE[e.typeKey]
															},
															e.type
														),
														/*#__PURE__*/ React.createElement(
															'span',
															{
																className: 'admin-row__loc'
															},
															e.location
														)
													)
												),
												/*#__PURE__*/ React.createElement(
													'div',
													{
														className: 'admin-row__resp'
													},
													/*#__PURE__*/ React.createElement(
														'span',
														{
															className: 'rc__i rc__i--yes',
															role: 'button',
															tabIndex: 0,
															title: 'Zugesagt anzeigen',
															onClick: (ev) => {
																ev.stopPropagation();
																onResponses && onResponses(e.id, 'yes');
															}
														},
														/*#__PURE__*/ React.createElement(Ic, {
															name: 'check',
															size: 13
														}),
														e.yes
													),
													/*#__PURE__*/ React.createElement(
														'span',
														{
															className: 'rc__i rc__i--open',
															role: 'button',
															tabIndex: 0,
															title: 'Keine Meldung anzeigen',
															onClick: (ev) => {
																ev.stopPropagation();
																onResponses && onResponses(e.id, 'open');
															}
														},
														/*#__PURE__*/ React.createElement(Ic, {
															name: 'circle-help',
															size: 12
														}),
														e.open
													)
												),
												/*#__PURE__*/ React.createElement(Ic, {
													name: 'pencil',
													size: 17,
													color: 'var(--text-muted)'
												})
											)
										)
									)
								)
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'treas-note'
								},
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'info',
									size: 15
								}),
								' R\xFCckmeldezahlen sind antippbar \u2014 der Status kann sich im laufenden Prozess noch \xE4ndern. Vorstand & Sekret\xE4r k\xF6nnen Termine anlegen, bearbeiten und R\xFCckmeldungen einsehen.'
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 12
								}
							})
						)
					)
				);
			}
			window.AdminScreen = AdminScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/AdminScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/App.jsx
	try {
		(() => {
			// App controller — login gate, bottom tabs, and overlay screen stack.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function NewsScreen() {
				const { AppBar, Card, Tag, Avatar } = LC;
				const posts = [
					{
						id: 1,
						author: 'Dr. Jens Berg',
						role: 'Sekretär',
						tone: 'cream',
						time: 'vor 2 Std.',
						title: 'Protokoll Mai-Versammlung online',
						body: 'Das Protokoll der letzten Mitglieder-Versammlung steht jetzt unter Dokumente bereit.',
						tag: 'Protokoll'
					},
					{
						id: 2,
						author: 'Andreas Kremer',
						role: 'Präsident',
						tone: 'blue',
						time: 'gestern',
						title: 'Spendenübergabe Förderprojekt',
						body: 'Vielen Dank an alle — wir konnten € 4.200 an „Lesen macht stark“ übergeben.',
						tag: 'Activity'
					},
					{
						id: 3,
						author: 'Wolfgang Reuter',
						role: 'Clubmaster',
						tone: 'gold',
						time: '3 Tage',
						title: 'Anmeldung Club-Reise Toskana',
						body: 'Die Zimmerkontingente sind reserviert. Bitte bis Ende Juli anmelden.',
						tag: 'Reise'
					}
				];
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						large: true,
						title: 'News',
						eyebrow: 'Vereinsnachrichten'
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack',
								style: {
									paddingTop: 8
								}
							},
							posts.map((p) =>
								/*#__PURE__*/ React.createElement(
									Card,
									{
										key: p.id
									},
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'news__head'
										},
										/*#__PURE__*/ React.createElement(Avatar, {
											name: p.author,
											tone: p.tone,
											size: 'sm'
										}),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'news__by'
											},
											/*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'news__author'
												},
												p.author
											),
											/*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'news__meta'
												},
												p.role,
												' \xB7 ',
												p.time
											)
										),
										/*#__PURE__*/ React.createElement(
											Tag,
											{
												tone: 'blue',
												outline: true
											},
											p.tag
										)
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'news__title'
										},
										p.title
									),
									/*#__PURE__*/ React.createElement(
										'p',
										{
											className: 'news__body'
										},
										p.body
									)
								)
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 12
								}
							})
						)
					)
				);
			}
			function MoreScreen({ onNav }) {
				const { AppBar, Card, ListRow, Avatar, Tag } = LC;
				const { Ic } = window;
				const me = window.LC_DATA.me;
				const lead = (n) =>
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'more__ic'
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: n,
							size: 20
						})
					);
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						large: true,
						title: 'Mehr'
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack',
								style: {
									paddingTop: 6
								}
							},
							/*#__PURE__*/ React.createElement(
								Card,
								{
									interactive: true,
									onClick: () => onNav('profile'),
									className: 'more__profile'
								},
								/*#__PURE__*/ React.createElement(Avatar, {
									name: me.name,
									tone: 'blue',
									size: 'lg'
								}),
								/*#__PURE__*/ React.createElement(
									'div',
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'more__name'
										},
										me.name
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'more__role'
										},
										me.role,
										' \xB7 Profil bearbeiten'
									)
								),
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'chevron-right',
									size: 20,
									color: 'var(--text-muted)'
								})
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Vorstand'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								{
									flush: true
								},
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('clipboard-check'),
									title: 'Anwesenheit erfassen',
									subtitle: 'N\xE4chster Club-Abend',
									chevron: true,
									onClick: () => onNav('attendance')
								}),
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('coins'),
									title: 'Schatzmeister-Auswertung',
									subtitle: 'Abwesenheiten & Beitr\xE4ge',
									chevron: true,
									onClick: () => onNav('treasurer')
								}),
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('calendar-plus'),
									title: 'Termine verwalten',
									subtitle: 'Jahresplanung',
									chevron: true,
									trailing: /*#__PURE__*/ React.createElement(
										Tag,
										{
											tone: 'blue',
											outline: true
										},
										'Admin'
									),
									onClick: () => onNav('admin')
								})
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Allgemein'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								{
									flush: true
								},
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('file-text'),
									title: 'Dokumente',
									subtitle: 'Protokolle, Satzung, Programm',
									chevron: true
								}),
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('image'),
									title: 'Galerie',
									subtitle: 'Google-Share \xF6ffnen',
									trailing: /*#__PURE__*/ React.createElement(Ic, {
										name: 'external-link',
										size: 17,
										color: 'var(--text-muted)'
									})
								}),
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('cake'),
									title: 'Geburtstage',
									subtitle: 'Diesen Monat: 3',
									chevron: true
								}),
								/*#__PURE__*/ React.createElement(ListRow, {
									lead: lead('bell'),
									title: 'Benachrichtigungen',
									chevron: true,
									onClick: () => onNav('profile')
								})
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 12
								}
							})
						)
					)
				);
			}
			function App() {
				const { TabBar } = LC;
				const {
					Ic,
					PhoneFrame,
					LoginScreen,
					EventListScreen,
					EventDetailScreen,
					MembersScreen,
					ProfileScreen,
					AttendanceScreen,
					TreasurerScreen,
					AdminScreen,
					ResponseSheet
				} = window;
				const [authed, setAuthed] = React.useState(false);
				const [tab, setTab] = React.useState('termine');
				const [overlay, setOverlay] = React.useState(null); // {type, id}
				const [sheet, setSheet] = React.useState(null); // {eventId, status}
				const showResponses = (eventId, status) =>
					setSheet({
						eventId,
						status
					});
				const tabs = [
					{
						id: 'termine',
						label: 'Termine',
						icon: /*#__PURE__*/ React.createElement(Ic, {
							name: 'calendar-days',
							size: 24
						})
					},
					{
						id: 'mitglieder',
						label: 'Mitglieder',
						icon: /*#__PURE__*/ React.createElement(Ic, {
							name: 'users',
							size: 24
						})
					},
					{
						id: 'news',
						label: 'News',
						icon: /*#__PURE__*/ React.createElement(Ic, {
							name: 'newspaper',
							size: 24
						}),
						badge: 2
					},
					{
						id: 'mehr',
						label: 'Mehr',
						icon: /*#__PURE__*/ React.createElement(Ic, {
							name: 'menu',
							size: 24
						})
					}
				];
				if (!authed) {
					return /*#__PURE__*/ React.createElement(
						PhoneFrame,
						null,
						/*#__PURE__*/ React.createElement(LoginScreen, {
							onLogin: () => setAuthed(true)
						})
					);
				}
				let body;
				if (overlay?.type === 'event')
					body = /*#__PURE__*/ React.createElement(EventDetailScreen, {
						eventId: overlay.id,
						onBack: () => setOverlay(null),
						onResponses: showResponses
					});
				else if (overlay?.type === 'attendance')
					body = /*#__PURE__*/ React.createElement(AttendanceScreen, {
						onBack: () => setOverlay(null)
					});
				else if (overlay?.type === 'treasurer')
					body = /*#__PURE__*/ React.createElement(TreasurerScreen, {
						onBack: () => setOverlay(null)
					});
				else if (overlay?.type === 'admin')
					body = /*#__PURE__*/ React.createElement(AdminScreen, {
						onBack: () => setOverlay(null),
						onOpen: (id) =>
							setOverlay({
								type: 'event',
								id
							}),
						onResponses: showResponses
					});
				else if (overlay?.type === 'profile')
					body = /*#__PURE__*/ React.createElement(ProfileScreen, {
						onBack: () => setOverlay(null)
					});
				else if (tab === 'termine')
					body = /*#__PURE__*/ React.createElement(EventListScreen, {
						onOpen: (id) =>
							setOverlay({
								type: 'event',
								id
							}),
						onResponses: showResponses
					});
				else if (tab === 'mitglieder')
					body = /*#__PURE__*/ React.createElement(MembersScreen, {
						onOpen: () => {}
					});
				else if (tab === 'news') body = /*#__PURE__*/ React.createElement(NewsScreen, null);
				else
					body = /*#__PURE__*/ React.createElement(MoreScreen, {
						onNav: (type) =>
							setOverlay({
								type
							})
					});
				const showTabs = !overlay;
				return /*#__PURE__*/ React.createElement(
					PhoneFrame,
					null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'app'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'app__body'
							},
							body
						),
						showTabs &&
							/*#__PURE__*/ React.createElement(TabBar, {
								items: tabs,
								value: tab,
								onChange: (t) => {
									setTab(t);
									setOverlay(null);
								}
							}),
						/*#__PURE__*/ React.createElement(ResponseSheet, {
							sheet: sheet,
							onClose: () => setSheet(null),
							onStatus: (s) =>
								setSheet((x) => ({
									...x,
									status: s
								}))
						})
					)
				);
			}
			window.App = App;
			const _lcRootEl = document.getElementById('root');
			window.__lcRoot = window.__lcRoot || ReactDOM.createRoot(_lcRootEl);
			window.__lcRoot.render(/*#__PURE__*/ React.createElement(App, null));
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/App.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/AttendanceScreen.jsx
	try {
		(() => {
			// Anwesenheitserfassung (Vorstand) — schnelle An-/Abwesend-Liste.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function AttendanceScreen({ onBack }) {
				const { AppBar, IconButton, Button, Avatar } = LC;
				const { Ic } = window;
				const members = window.LC_DATA.members.filter((m) => m.status === 'aktiv');
				const [present, setPresent] = React.useState(() => {
					const o = {};
					members.forEach((m, i) => (o[m.id] = i % 5 !== 2));
					return o;
				});
				const presentCount = Object.values(present).filter(Boolean).length;
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						center: true,
						bordered: true,
						title: 'Anwesenheit',
						leading: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-left',
								size: 22
							}),
							label: 'Zur\xFCck',
							onClick: onBack
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack',
								style: {
									paddingTop: 14
								}
							},
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'att-summary'
								},
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'att-summary__head'
									},
									/*#__PURE__*/ React.createElement(
										'div',
										null,
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'att-summary__t'
											},
											'Club-Abend'
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'att-summary__s'
											},
											/*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'u-mono'
												},
												'12.06.'
											),
											' \xB7 ',
											/*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'u-mono'
												},
												'19:00'
											),
											' \xB7 Restaurant Rheinblick'
										)
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'att-summary__count'
										},
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'att-summary__big',
												style: {
													color: 'var(--present-fg)'
												}
											},
											presentCount
										),
										/*#__PURE__*/ React.createElement('span', null, '/ ', members.length, ' da')
									)
								)
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'att-list'
							},
							members.map((m) =>
								/*#__PURE__*/ React.createElement(
									'label',
									{
										key: m.id,
										className: 'att-row' + (present[m.id] ? '' : ' att-row--absent')
									},
									/*#__PURE__*/ React.createElement(Avatar, {
										name: m.name,
										tone: m.tone
									}),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'att-row__body'
										},
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'att-row__name'
											},
											m.name
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'att-row__state'
											},
											present[m.id] ? 'Anwesend' : 'Abwesend'
										)
									),
									/*#__PURE__*/ React.createElement('input', {
										type: 'checkbox',
										className: 'att-toggle',
										checked: present[m.id],
										onChange: () =>
											setPresent((p) => ({
												...p,
												[m.id]: !p[m.id]
											}))
									}),
									/*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'att-switch'
										},
										/*#__PURE__*/ React.createElement('span', {
											className: 'att-switch__thumb'
										})
									)
								)
							)
						),
						/*#__PURE__*/ React.createElement('div', {
							style: {
								height: 96
							}
						})
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'detail__cta'
						},
						/*#__PURE__*/ React.createElement(
							Button,
							{
								variant: 'primary',
								size: 'lg',
								fullWidth: true,
								iconLeft: /*#__PURE__*/ React.createElement(Ic, {
									name: 'check-check',
									size: 20
								}),
								onClick: onBack
							},
							'Anwesenheit speichern'
						)
					)
				);
			}
			window.AttendanceScreen = AttendanceScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/AttendanceScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/EventDetailScreen.jsx
	try {
		(() => {
			// Termin-Detail + An-/Abmeldung, Begleitperson, generische Zusatzabfragen (Menü, Zimmerwunsch …).
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			const DETAIL_TONE = {
				clubabend: 'blue',
				versammlung: 'blue',
				gesellig: 'gold',
				lions: 'neutral',
				reise: 'sage'
			};
			function EventDetailScreen({ eventId, onBack, onResponses }) {
				const { AppBar, IconButton, Button, Card, Tag, StatusBadge, Input } = LC;
				const { Ic, QuestionField } = window;
				const e = window.LC_DATA.events.find((x) => x.id === eventId) || window.LC_DATA.events[0];
				const me = window.LC_DATA.me;
				const past = e.phase === 'past';
				const [status, setStatus] = React.useState(e.status);
				const [companions, setCompanions] = React.useState([]); // [{id, name}]
				const [answers, setAnswers] = React.useState({}); // answers[personId][questionId]

				const questions = e.questions || [];
				const personQs = questions.filter((q) => q.scope !== 'group');
				const groupQs = questions.filter((q) => q.scope === 'group');
				const persons = [
					{
						id: 'me',
						name: me.name,
						isMe: true
					},
					...companions
				];
				const setAns = (pid, qid, val) =>
					setAnswers((a) => ({
						...a,
						[pid]: {
							...(a[pid] || {}),
							[qid]: val
						}
					}));
				const addCompanion = () =>
					setCompanions((c) => [
						...c,
						{
							id: 'c' + Date.now(),
							name: ''
						}
					]);
				const renameCompanion = (id, name) =>
					setCompanions((c) =>
						c.map((x) =>
							x.id === id
								? {
										...x,
										name
									}
								: x
						)
					);
				const removeCompanion = (id) => {
					setCompanions((c) => c.filter((x) => x.id !== id));
					setAnswers((a) => {
						const n = {
							...a
						};
						delete n[id];
						return n;
					});
				};
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						center: true,
						bordered: true,
						title: past ? 'Vergangen' : 'Termin',
						leading: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-left',
								size: 22
							}),
							label: 'Zur\xFCck',
							onClick: onBack
						}),
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'calendar-plus',
								size: 20
							}),
							label: 'In Kalender'
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'detail__hero'
							},
							/*#__PURE__*/ React.createElement(
								Tag,
								{
									tone: DETAIL_TONE[e.typeKey]
								},
								e.type
							),
							/*#__PURE__*/ React.createElement(
								'h1',
								{
									className: 'detail__title'
								},
								e.title
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'detail__facts'
								},
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'fact'
									},
									/*#__PURE__*/ React.createElement(Ic, {
										name: 'calendar-days',
										size: 18
									}),
									/*#__PURE__*/ React.createElement(
										'span',
										null,
										e.weekday,
										', ',
										e.date,
										e.month.split(' ')[1],
										' \xB7 ',
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'u-mono'
											},
											e.time
										)
									)
								),
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'fact'
									},
									/*#__PURE__*/ React.createElement(Ic, {
										name: 'map-pin',
										size: 18
									}),
									/*#__PURE__*/ React.createElement('span', null, e.location, ', ', e.city)
								)
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack'
							},
							/*#__PURE__*/ React.createElement(
								Card,
								null,
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'detail__statusrow'
									},
									/*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'detail__statuslabel'
										},
										past ? 'Deine Meldung' : 'Dein Status'
									),
									/*#__PURE__*/ React.createElement(StatusBadge, {
										status: status
									})
								),
								/*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'detail__desc'
									},
									e.desc
								)
							),
							past &&
								e.present != null &&
								/*#__PURE__*/ React.createElement(
									Card,
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'att-final'
										},
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'att-final__ic'
											},
											/*#__PURE__*/ React.createElement(Ic, {
												name: 'user-check',
												size: 20
											})
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'att-final__body'
											},
											/*#__PURE__*/ React.createElement(
												'div',
												{
													className: 'att-final__t'
												},
												'Anwesenheit erfasst'
											),
											/*#__PURE__*/ React.createElement(
												'div',
												{
													className: 'att-final__s'
												},
												e.present,
												' von ',
												e.yes,
												' Zusagen anwesend'
											)
										),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'att-final__n'
											},
											e.present
										)
									)
								),
							!past &&
								status !== 'no' &&
								e.companion &&
								/*#__PURE__*/ React.createElement(
									Card,
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'detail__qlabel'
										},
										/*#__PURE__*/ React.createElement(Ic, {
											name: 'users',
											size: 17
										}),
										' Begleitpersonen'
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'comp-list'
										},
										companions.length === 0 &&
											/*#__PURE__*/ React.createElement(
												'p',
												{
													className: 'comp-empty'
												},
												'Nur ich \u2014 keine Begleitung angemeldet.'
											),
										companions.map((c, i) =>
											/*#__PURE__*/ React.createElement(
												'div',
												{
													key: c.id,
													className: 'comp-row'
												},
												/*#__PURE__*/ React.createElement(
													'div',
													{
														className: 'comp-row__field'
													},
													/*#__PURE__*/ React.createElement(Input, {
														placeholder: 'Name Begleitperson ' + (i + 1),
														value: c.name,
														onChange: (ev) => renameCompanion(c.id, ev.target.value)
													})
												),
												/*#__PURE__*/ React.createElement(IconButton, {
													icon: /*#__PURE__*/ React.createElement(Ic, {
														name: 'trash-2',
														size: 18
													}),
													label: 'Entfernen',
													onClick: () => removeCompanion(c.id)
												})
											)
										)
									),
									/*#__PURE__*/ React.createElement(
										'button',
										{
											type: 'button',
											className: 'comp-add',
											onClick: addCompanion
										},
										/*#__PURE__*/ React.createElement(Ic, {
											name: 'user-plus',
											size: 18
										}),
										' Begleitperson hinzuf\xFCgen'
									)
								),
							!past &&
								status !== 'no' &&
								personQs.length > 0 &&
								persons.map((p) =>
									/*#__PURE__*/ React.createElement(
										Card,
										{
											key: p.id
										},
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'qf-person'
											},
											/*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'qf-person__av'
												},
												(p.name || '?').trim().charAt(0).toUpperCase() || '?'
											),
											/*#__PURE__*/ React.createElement(
												'div',
												{
													className: 'qf-person__txt'
												},
												/*#__PURE__*/ React.createElement(
													'span',
													{
														className: 'qf-person__name'
													},
													p.isMe ? me.name : p.name || 'Begleitperson'
												),
												/*#__PURE__*/ React.createElement(
													'span',
													{
														className: 'qf-person__tag'
													},
													p.isMe ? 'Du' : 'Begleitung'
												)
											)
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'qf-stack'
											},
											personQs.map((q) =>
												/*#__PURE__*/ React.createElement(QuestionField, {
													key: q.id,
													q: {
														...q,
														_scope: p.id
													},
													value: (answers[p.id] || {})[q.id],
													onChange: (val) => setAns(p.id, q.id, val)
												})
											)
										)
									)
								),
							!past &&
								status !== 'no' &&
								groupQs.length > 0 &&
								/*#__PURE__*/ React.createElement(
									Card,
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'detail__qlabel'
										},
										/*#__PURE__*/ React.createElement(Ic, {
											name: 'clipboard-list',
											size: 17
										}),
										' Angaben zur Anmeldung'
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'qf-stack'
										},
										groupQs.map((q) =>
											/*#__PURE__*/ React.createElement(QuestionField, {
												key: q.id,
												q: {
													...q,
													_scope: 'group'
												},
												value: (answers.group || {})[q.id],
												onChange: (val) => setAns('group', q.id, val)
											})
										)
									)
								),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label',
									style: {
										marginTop: 4
									}
								},
								past ? 'Finale Rückmeldungen' : 'Meldungen'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								{
									flush: true
								},
								[
									{
										k: 'yes',
										icon: 'check',
										label: 'Zugesagt',
										n: e.yes,
										fg: 'var(--status-yes-fg)'
									},
									{
										k: 'no',
										icon: 'x',
										label: 'Abgesagt',
										n: e.no,
										fg: 'var(--status-no-fg)'
									},
									{
										k: 'open',
										icon: 'circle-help',
										label: 'Keine Meldung',
										n: e.open,
										fg: 'var(--ink-500)'
									}
								].map((r, i) =>
									/*#__PURE__*/ React.createElement(
										'button',
										{
											key: r.k,
											className: 'meld-row' + (i > 0 ? ' meld-row--div' : ''),
											onClick: () => onResponses && onResponses(e.id, r.k)
										},
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'meld-row__ic',
												style: {
													color: r.fg
												}
											},
											/*#__PURE__*/ React.createElement(Ic, {
												name: r.icon,
												size: 20
											})
										),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'meld-row__lbl'
											},
											r.label
										),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'meld-row__n u-mono'
											},
											r.n
										),
										/*#__PURE__*/ React.createElement(Ic, {
											name: 'chevron-right',
											size: 18,
											color: 'var(--text-muted)'
										})
									)
								)
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 96
								}
							})
						)
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'detail__cta'
						},
						past
							? /*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'rsvp-readonly'
									},
									/*#__PURE__*/ React.createElement(Ic, {
										name: 'lock',
										size: 16
									}),
									' Vergangener Termin \u2014 R\xFCckmeldung geschlossen'
								)
							: /*#__PURE__*/ React.createElement(
									React.Fragment,
									null,
									status === 'open' &&
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'rsvp-hint'
											},
											/*#__PURE__*/ React.createElement(Ic, {
												name: 'circle-help',
												size: 15
											}),
											' Noch keine R\xFCckmeldung \u2014 bitte zu- oder absagen'
										),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'rsvp',
											role: 'group',
											'aria-label': 'R\xFCckmeldung'
										},
										/*#__PURE__*/ React.createElement(
											'button',
											{
												type: 'button',
												className: 'rsvp__opt rsvp__opt--yes' + (status === 'yes' ? ' is-on' : ''),
												style:
													status === 'yes'
														? {
																background: 'var(--primary)',
																borderColor: 'var(--primary)',
																color: 'var(--text-on-primary)'
															}
														: undefined,
												'aria-pressed': status === 'yes',
												onClick: () => setStatus('yes')
											},
											/*#__PURE__*/ React.createElement(Ic, {
												name: 'check',
												size: 20
											}),
											' Zusagen'
										),
										/*#__PURE__*/ React.createElement(
											'button',
											{
												type: 'button',
												className: 'rsvp__opt rsvp__opt--no' + (status === 'no' ? ' is-on' : ''),
												style:
													status === 'no'
														? {
																background: 'var(--danger)',
																borderColor: 'var(--danger)',
																color: '#fff'
															}
														: undefined,
												'aria-pressed': status === 'no',
												onClick: () => setStatus('no')
											},
											/*#__PURE__*/ React.createElement(Ic, {
												name: 'x',
												size: 20
											}),
											' Absagen'
										)
									)
								)
					)
				);
			}
			window.EventDetailScreen = EventDetailScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/EventDetailScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/EventListScreen.jsx
	try {
		(() => {
			// Terminübersicht (Start) — Anstehend / Vergangen segment, list & navigable calendar.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			const TYPE_TONE = {
				clubabend: 'blue',
				versammlung: 'blue',
				gesellig: 'gold',
				lions: 'neutral',
				reise: 'sage'
			};
			const MONTHS_DE = [
				'Januar',
				'Februar',
				'März',
				'April',
				'Mai',
				'Juni',
				'Juli',
				'August',
				'September',
				'Oktober',
				'November',
				'Dezember'
			];
			const MON_SHORT = [
				'Jan',
				'Feb',
				'Mär',
				'Apr',
				'Mai',
				'Jun',
				'Jul',
				'Aug',
				'Sep',
				'Okt',
				'Nov',
				'Dez'
			];
			const WD_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
			const TODAY = '2026-06-13';
			function ResponseCounts({ e, onPick }) {
				const { Ic } = window;
				const pick = (status) => (ev) => {
					ev.stopPropagation();
					onPick && onPick(e.id, status);
				};
				return /*#__PURE__*/ React.createElement(
					'span',
					{
						className: 'rc',
						'aria-label': `${e.yes} zugesagt, ${e.no} abgesagt, ${e.open} offen`
					},
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'rc__i rc__i--yes',
							role: 'button',
							tabIndex: 0,
							title: 'Zugesagt anzeigen',
							onClick: pick('yes')
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: 'check',
							size: 14
						}),
						e.yes
					),
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'rc__i rc__i--no',
							role: 'button',
							tabIndex: 0,
							title: 'Abgesagt anzeigen',
							onClick: pick('no')
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: 'x',
							size: 14
						}),
						e.no
					),
					/*#__PURE__*/ React.createElement(
						'span',
						{
							className: 'rc__i rc__i--open',
							role: 'button',
							tabIndex: 0,
							title: 'Keine Meldung anzeigen',
							onClick: pick('open')
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: 'circle-help',
							size: 13
						}),
						e.open
					)
				);
			}
			function EventCard({ e, onOpen, onResponses }) {
				const { StatusBadge, Tag } = LC;
				const { Ic } = window;
				const past = e.phase === 'past';
				return /*#__PURE__*/ React.createElement(
					'button',
					{
						className: 'ev-card' + (past ? ' ev-card--past' : ''),
						onClick: () => onOpen(e.id)
					},
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'ev-card__date'
						},
						/*#__PURE__*/ React.createElement(
							'span',
							{
								className: 'ev-card__wd'
							},
							e.weekday
						),
						/*#__PURE__*/ React.createElement(
							'span',
							{
								className: 'ev-card__d'
							},
							e.day
						),
						/*#__PURE__*/ React.createElement(
							'span',
							{
								className: 'ev-card__mon'
							},
							e.monShort
						)
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'ev-card__body'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'ev-card__title'
							},
							e.title
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'ev-card__meta'
							},
							/*#__PURE__*/ React.createElement(Ic, {
								name: 'map-pin',
								size: 14
							}),
							' ',
							e.location,
							' \xB7 ',
							/*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'u-mono'
								},
								e.time
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'ev-card__foot'
							},
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'ev-card__foot-l'
								},
								/*#__PURE__*/ React.createElement(
									Tag,
									{
										tone: TYPE_TONE[e.typeKey]
									},
									e.type
								),
								/*#__PURE__*/ React.createElement(StatusBadge, {
									status: e.status
								})
							),
							past && e.present != null
								? /*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'ev-card__att',
											title: 'Erfasste Anwesenheit'
										},
										/*#__PURE__*/ React.createElement(Ic, {
											name: 'user-check',
											size: 14
										}),
										' ',
										e.present,
										' anwesend'
									)
								: /*#__PURE__*/ React.createElement(ResponseCounts, {
										e: e,
										onPick: onResponses
									})
						)
					)
				);
			}
			function EventListScreen({ onOpen, onResponses }) {
				const { AppBar, IconButton, SegmentedControl } = LC;
				const { Ic } = window;
				const [phase, setPhase] = React.useState('upcoming');
				const [calendar, setCalendar] = React.useState(false);
				const events = window.LC_DATA.events;

				// upcoming ascending (next first); past descending (most recent first)
				const list = events
					.filter((e) => e.phase === phase)
					.sort((a, b) =>
						phase === 'upcoming' ? a.iso.localeCompare(b.iso) : b.iso.localeCompare(a.iso)
					);
				const groups = [];
				const seen = {};
				list.forEach((e) => {
					if (!seen[e.month]) {
						seen[e.month] = [];
						groups.push([e.month, seen[e.month]]);
					}
					seen[e.month].push(e);
				});
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						large: true,
						title: 'Termine',
						eyebrow: 'Lions Club Bonn-Rheinaue',
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: calendar ? 'list' : 'calendar',
								size: 22
							}),
							label: calendar ? 'Liste' : 'Kalender',
							tone: calendar ? 'primary' : 'default',
							onClick: () => setCalendar((c) => !c)
						})
					}),
					!calendar &&
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad',
								style: {
									paddingTop: 4,
									paddingBottom: 12
								}
							},
							/*#__PURE__*/ React.createElement(SegmentedControl, {
								value: phase,
								onChange: setPhase,
								options: [
									{
										label: 'Anstehend',
										value: 'upcoming'
									},
									{
										label: 'Vergangen',
										value: 'past'
									}
								]
							})
						),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						calendar
							? /*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'screen__pad'
									},
									/*#__PURE__*/ React.createElement(CalendarView, {
										events: events,
										onOpen: onOpen
									})
								)
							: /*#__PURE__*/ React.createElement(
									React.Fragment,
									null,
									groups.map(([month, items]) =>
										/*#__PURE__*/ React.createElement(
											'div',
											{
												key: month,
												className: 'ev-group'
											},
											/*#__PURE__*/ React.createElement(
												'div',
												{
													className: 'ev-group__label'
												},
												month
											),
											/*#__PURE__*/ React.createElement(
												'div',
												{
													className: 'card-list'
												},
												items.map((e) =>
													/*#__PURE__*/ React.createElement(EventCard, {
														key: e.id,
														e: e,
														onOpen: onOpen,
														onResponses: onResponses
													})
												)
											)
										)
									),
									list.length === 0 &&
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'ev-empty'
											},
											'Keine ',
											phase === 'past' ? 'vergangenen' : 'anstehenden',
											' Termine.'
										)
								),
						/*#__PURE__*/ React.createElement('div', {
							style: {
								height: 12
							}
						})
					)
				);
			}
			function CalendarView({ events, onOpen }) {
				const { StatusBadge } = LC;
				const { Ic } = window;
				// freely navigable month cursor — starts on the current month
				const [cursor, setCursor] = React.useState({
					y: 2026,
					m: 5
				}); // m: 0-indexed (Juni)

				const evByDay = {};
				events.forEach((e) => {
					const [y, m, d] = e.iso.split('-').map(Number);
					if (y === cursor.y && m - 1 === cursor.m) evByDay[d] = e;
				});
				const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // Mon=0
				const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
				const todayParts = TODAY.split('-').map(Number);
				const isToday = (d) =>
					todayParts[0] === cursor.y && todayParts[1] - 1 === cursor.m && todayParts[2] === d;
				const step = (delta) =>
					setCursor((c) => {
						let m = c.m + delta,
							y = c.y;
						if (m < 0) {
							m = 11;
							y--;
						}
						if (m > 11) {
							m = 0;
							y++;
						}
						return {
							y,
							m
						};
					});
				const monthEvents = events
					.filter((e) => {
						const [y, m] = e.iso.split('-').map(Number);
						return y === cursor.y && m - 1 === cursor.m;
					})
					.sort((a, b) => a.iso.localeCompare(b.iso));
				return /*#__PURE__*/ React.createElement(
					'div',
					null,
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'cal-nav'
						},
						/*#__PURE__*/ React.createElement(
							'button',
							{
								className: 'cal-nav__btn',
								'aria-label': 'Vorheriger Monat',
								onClick: () => step(-1)
							},
							/*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-left',
								size: 20
							})
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'cal-nav__title'
							},
							MONTHS_DE[cursor.m],
							' ',
							cursor.y
						),
						/*#__PURE__*/ React.createElement(
							'button',
							{
								className: 'cal-nav__btn',
								'aria-label': 'N\xE4chster Monat',
								onClick: () => step(1)
							},
							/*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-right',
								size: 20
							})
						)
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'cal-grid'
						},
						['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((w) =>
							/*#__PURE__*/ React.createElement(
								'div',
								{
									key: w,
									className: 'cal-wd'
								},
								w
							)
						),
						Array.from({
							length: firstDow
						}).map((_, i) =>
							/*#__PURE__*/ React.createElement('div', {
								key: 'x' + i
							})
						),
						Array.from(
							{
								length: daysInMonth
							},
							(_, i) => i + 1
						).map((d) =>
							/*#__PURE__*/ React.createElement(
								'div',
								{
									key: d,
									className:
										'cal-day' +
										(evByDay[d] ? ' cal-day--has' : '') +
										(isToday(d) ? ' cal-day--today' : ''),
									onClick: () => evByDay[d] && onOpen(evByDay[d].id)
								},
								/*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'cal-day__n'
									},
									d
								),
								evByDay[d] &&
									/*#__PURE__*/ React.createElement('span', {
										className: 'cal-day__dot',
										style: {
											background: `var(--status-${evByDay[d].status}-dot)`
										}
									})
							)
						)
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'card-list',
							style: {
								marginTop: 16
							}
						},
						monthEvents.length === 0 &&
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'ev-empty',
									style: {
										padding: '20px 0'
									}
								},
								'Keine Termine in diesem Monat.'
							),
						monthEvents.map((e) =>
							/*#__PURE__*/ React.createElement(
								'button',
								{
									key: e.id,
									className: 'ev-mini',
									onClick: () => onOpen(e.id)
								},
								/*#__PURE__*/ React.createElement(StatusBadge, {
									status: e.status,
									dotOnly: true
								}),
								/*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'ev-mini__d u-mono'
									},
									e.date
								),
								/*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'ev-mini__t'
									},
									e.title
								),
								e.phase === 'past' &&
									/*#__PURE__*/ React.createElement(Ic, {
										name: 'lock',
										size: 14,
										color: 'var(--text-muted)'
									}),
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'chevron-right',
									size: 16,
									color: 'var(--text-muted)'
								})
							)
						)
					)
				);
			}
			window.EventListScreen = EventListScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/EventListScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/LoginScreen.jsx
	try {
		(() => {
			// Login — e-mail OTP, one step per screen.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function LoginScreen({ onLogin }) {
				const { Button, Input, OtpInput } = LC;
				const { Ic } = window;
				const [step, setStep] = React.useState('email');
				const [email, setEmail] = React.useState('a.kremer@example.de');
				const [code, setCode] = React.useState('');
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'login'
					},
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'login__top'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'brand'
							},
							/*#__PURE__*/ React.createElement('img', {
								className: 'brand__emblem',
								src:
									(window.__resources && window.__resources.lionsEmblem) ||
									'../../assets/lions-emblem.png',
								alt: 'Lions Clubs International Emblem'
							}),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'brand__name'
								},
								'Lions Club',
								/*#__PURE__*/ React.createElement('br', null),
								'Bonn-Rheinaue'
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'brand__sub'
								},
								'We Serve'
							)
						)
					),
					step === 'email'
						? /*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'login__card'
								},
								/*#__PURE__*/ React.createElement(
									'h1',
									{
										className: 'login__h'
									},
									'Willkommen zur\xFCck'
								),
								/*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'login__p'
									},
									'Melde dich mit deiner E-Mail-Adresse an. Wir senden dir einen 6-stelligen Code.'
								),
								/*#__PURE__*/ React.createElement(Input, {
									label: 'E-Mail',
									type: 'email',
									icon: /*#__PURE__*/ React.createElement(Ic, {
										name: 'mail',
										size: 20
									}),
									value: email,
									onChange: (e) => setEmail(e.target.value),
									placeholder: 'name@example.de'
								}),
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'primary',
										size: 'lg',
										fullWidth: true,
										iconRight: /*#__PURE__*/ React.createElement(Ic, {
											name: 'arrow-right',
											size: 20
										}),
										onClick: () => setStep('code'),
										style: {
											marginTop: 4
										}
									},
									'Code anfordern'
								)
							)
						: /*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'login__card'
								},
								/*#__PURE__*/ React.createElement(
									'button',
									{
										className: 'login__back',
										onClick: () => setStep('email')
									},
									/*#__PURE__*/ React.createElement(Ic, {
										name: 'chevron-left',
										size: 18
									}),
									' Zur\xFCck'
								),
								/*#__PURE__*/ React.createElement(
									'h1',
									{
										className: 'login__h'
									},
									'Code eingeben'
								),
								/*#__PURE__*/ React.createElement(
									'p',
									{
										className: 'login__p'
									},
									'Wir haben einen Code an',
									/*#__PURE__*/ React.createElement('br', null),
									/*#__PURE__*/ React.createElement('strong', null, email),
									' gesendet.'
								),
								/*#__PURE__*/ React.createElement(OtpInput, {
									value: code,
									onChange: setCode
								}),
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'primary',
										size: 'lg',
										fullWidth: true,
										disabled: code.length < 6,
										onClick: onLogin,
										style: {
											marginTop: 20
										}
									},
									'Anmelden'
								),
								/*#__PURE__*/ React.createElement(
									'button',
									{
										className: 'login__resend'
									},
									'Code erneut senden'
								)
							)
				);
			}
			window.LoginScreen = LoginScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/LoginScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/MembersScreen.jsx
	try {
		(() => {
			// Mitgliederverzeichnis — Suche/Filter, Karten mit Foto, Direktaktionen.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function MembersScreen({ onOpen }) {
				const { AppBar, IconButton, Input, Avatar, Tag, ListRow } = LC;
				const { Ic } = window;
				const [q, setQ] = React.useState('');
				const members = window.LC_DATA.members;
				const filtered = members.filter(
					(m) =>
						m.name.toLowerCase().includes(q.toLowerCase()) ||
						m.role.toLowerCase().includes(q.toLowerCase())
				);
				const active = members.filter((m) => m.status === 'aktiv').length;
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						large: true,
						title: 'Mitglieder',
						eyebrow: `${active} aktiv · ${members.length} gesamt`,
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'user-plus',
								size: 22
							}),
							label: 'Mitglied einladen',
							tone: 'primary'
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__pad',
							style: {
								paddingTop: 4,
								paddingBottom: 10
							}
						},
						/*#__PURE__*/ React.createElement(Input, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'search',
								size: 20
							}),
							placeholder: 'Name oder Amt suchen\u2026',
							value: q,
							onChange: (e) => setQ(e.target.value)
						})
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'card-list card-list--flush'
							},
							filtered.map((m) =>
								/*#__PURE__*/ React.createElement(
									'div',
									{
										key: m.id,
										className: 'mem-row',
										onClick: () => onOpen(m.id)
									},
									/*#__PURE__*/ React.createElement(Avatar, {
										name: m.name,
										tone: m.tone,
										size: 'lg'
									}),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'mem-row__body'
										},
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'mem-row__name'
											},
											m.name
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'mem-row__role'
											},
											m.role,
											m.status === 'Ehrenmitglied' &&
												/*#__PURE__*/ React.createElement(
													Tag,
													{
														tone: 'gold',
														dot: true
													},
													'Ehrenmitglied'
												),
											m.status === 'inaktiv' &&
												/*#__PURE__*/ React.createElement(
													Tag,
													{
														outline: true
													},
													'inaktiv'
												)
										)
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'mem-row__actions'
										},
										/*#__PURE__*/ React.createElement(IconButton, {
											icon: /*#__PURE__*/ React.createElement(Ic, {
												name: 'phone',
												size: 19
											}),
											label: 'Anrufen',
											onClick: (ev) => ev.stopPropagation()
										}),
										/*#__PURE__*/ React.createElement(IconButton, {
											icon: /*#__PURE__*/ React.createElement(Ic, {
												name: 'mail',
												size: 19
											}),
											label: 'E-Mail',
											onClick: (ev) => ev.stopPropagation()
										})
									)
								)
							)
						),
						/*#__PURE__*/ React.createElement('div', {
							style: {
								height: 12
							}
						})
					)
				);
			}
			window.MembersScreen = MembersScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/MembersScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/ProfileScreen.jsx
	try {
		(() => {
			// Mitgliedsprofil / Selbstpflege — eigene Stammdaten + Partner.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function ProfileScreen({ onBack }) {
				const { AppBar, IconButton, Button, Card, Avatar, Input, Switch } = LC;
				const { Ic } = window;
				const me = window.LC_DATA.members[0];
				const [edit, setEdit] = React.useState(false);
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						large: true,
						title: 'Mein Profil',
						leading: onBack
							? /*#__PURE__*/ React.createElement(IconButton, {
									icon: /*#__PURE__*/ React.createElement(Ic, {
										name: 'chevron-left',
										size: 22
									}),
									label: 'Zur\xFCck',
									onClick: onBack
								})
							: null,
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: edit ? 'check' : 'pencil',
								size: 20
							}),
							label: 'Bearbeiten',
							tone: 'primary',
							onClick: () => setEdit(!edit)
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'profile__head'
							},
							/*#__PURE__*/ React.createElement(Avatar, {
								name: me.name,
								tone: 'blue',
								size: 'xl'
							}),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'profile__name'
								},
								me.name
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'profile__role'
								},
								me.role,
								' \xB7 seit 2014'
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack'
							},
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Kontaktdaten'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								null,
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'form-stack'
									},
									/*#__PURE__*/ React.createElement(Input, {
										label: 'E-Mail',
										defaultValue: me.email,
										disabled: !edit,
										icon: /*#__PURE__*/ React.createElement(Ic, {
											name: 'mail',
											size: 20
										})
									}),
									/*#__PURE__*/ React.createElement(Input, {
										label: 'Handy',
										defaultValue: me.phone,
										disabled: !edit,
										icon: /*#__PURE__*/ React.createElement(Ic, {
											name: 'phone',
											size: 20
										})
									}),
									/*#__PURE__*/ React.createElement(Input, {
										label: 'Geburtstag',
										defaultValue: '14.03.1961',
										disabled: !edit,
										icon: /*#__PURE__*/ React.createElement(Ic, {
											name: 'cake',
											size: 20
										})
									})
								)
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Partner/in'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								null,
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'form-stack'
									},
									/*#__PURE__*/ React.createElement(Input, {
										label: 'Name',
										defaultValue: me.partner,
										disabled: !edit
									}),
									/*#__PURE__*/ React.createElement(Input, {
										label: 'Geburtstag',
										defaultValue: '02.09.1963',
										disabled: !edit
									}),
									/*#__PURE__*/ React.createElement(Input, {
										label: 'E-Mail',
										defaultValue: 'b.kremer@example.de',
										disabled: !edit
									})
								)
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Benachrichtigungen'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								null,
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'switch-stack'
									},
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'switch-row'
										},
										/*#__PURE__*/ React.createElement('span', null, 'Push-Erinnerungen'),
										/*#__PURE__*/ React.createElement(Switch, {
											defaultChecked: true
										})
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'switch-row'
										},
										/*#__PURE__*/ React.createElement('span', null, 'E-Mail-Fallback'),
										/*#__PURE__*/ React.createElement(Switch, {
											defaultChecked: true
										})
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'switch-row'
										},
										/*#__PURE__*/ React.createElement('span', null, 'Geburtstags-Hinweise'),
										/*#__PURE__*/ React.createElement(Switch, null)
									)
								)
							),
							edit &&
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'primary',
										size: 'lg',
										fullWidth: true,
										onClick: () => setEdit(false)
									},
									'\xC4nderungen speichern'
								),
							/*#__PURE__*/ React.createElement(
								'button',
								{
									className: 'logout'
								},
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'log-out',
									size: 18
								}),
								' Ausloggen'
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 12
								}
							})
						)
					)
				);
			}
			window.ProfileScreen = ProfileScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/ProfileScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/QuestionField.jsx
	try {
		(() => {
			// QuestionField — flexible Zusatzabfrage renderer (Phase-2 survey engine, used inline at the event).
			// kinds: single | multi | text | bool | number. Controlled via value/onChange.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function NumberStepper({ value, onChange, min = 0, max = 99, unit }) {
				const { Ic } = window;
				const v = typeof value === 'number' ? value : min || 0;
				const set = (n) => onChange(Math.max(min, Math.min(max, n)));
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'qf-num'
					},
					/*#__PURE__*/ React.createElement(
						'button',
						{
							type: 'button',
							className: 'qf-num__btn',
							'aria-label': 'Weniger',
							disabled: v <= min,
							onClick: () => set(v - 1)
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: 'minus',
							size: 18
						})
					),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'qf-num__val'
						},
						/*#__PURE__*/ React.createElement(
							'span',
							{
								className: 'u-mono'
							},
							v
						),
						unit
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'qf-num__unit'
									},
									unit
								)
							: null
					),
					/*#__PURE__*/ React.createElement(
						'button',
						{
							type: 'button',
							className: 'qf-num__btn',
							'aria-label': 'Mehr',
							disabled: v >= max,
							onClick: () => set(v + 1)
						},
						/*#__PURE__*/ React.createElement(Ic, {
							name: 'plus',
							size: 18
						})
					)
				);
			}
			function QuestionField({ q, value, onChange }) {
				const { Checkbox, Input, SegmentedControl } = LC;
				const { Ic } = window;
				let control = null;
				if (q.kind === 'single') {
					control = /*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'qf-choices'
						},
						q.options.map((opt) =>
							/*#__PURE__*/ React.createElement(Checkbox, {
								key: opt,
								radio: true,
								name: 'q-' + q.id + '-' + (q._scope || ''),
								label: opt,
								checked: value === opt,
								onChange: () => onChange(opt)
							})
						)
					);
				} else if (q.kind === 'multi') {
					const arr = Array.isArray(value) ? value : [];
					const toggle = (opt) =>
						onChange(arr.includes(opt) ? arr.filter((x) => x !== opt) : [...arr, opt]);
					control = /*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'qf-choices'
						},
						q.options.map((opt) =>
							/*#__PURE__*/ React.createElement(Checkbox, {
								key: opt,
								label: opt,
								checked: arr.includes(opt),
								onChange: () => toggle(opt)
							})
						)
					);
				} else if (q.kind === 'bool') {
					control = /*#__PURE__*/ React.createElement(SegmentedControl, {
						value: value === true ? 'ja' : value === false ? 'nein' : '',
						onChange: (v) => onChange(v === 'ja'),
						options: [
							{
								label: 'Ja',
								value: 'ja'
							},
							{
								label: 'Nein',
								value: 'nein'
							}
						]
					});
				} else if (q.kind === 'number') {
					control = /*#__PURE__*/ React.createElement(NumberStepper, {
						value: value,
						onChange: onChange,
						min: q.min,
						max: q.max,
						unit: q.unit
					});
				} else {
					// text
					control = /*#__PURE__*/ React.createElement(Input, {
						multiline: q.multiline,
						placeholder: q.placeholder,
						value: value || '',
						onChange: (e) => onChange(e.target.value)
					});
				}
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'qf'
					},
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'qf__label'
						},
						q.icon
							? /*#__PURE__*/ React.createElement(
									'span',
									{
										className: 'qf__ic'
									},
									/*#__PURE__*/ React.createElement(Ic, {
										name: q.icon,
										size: 16
									})
								)
							: null,
						/*#__PURE__*/ React.createElement(
							'span',
							null,
							q.label,
							q.required
								? /*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'qf__req'
										},
										'*'
									)
								: null
						)
					),
					control
				);
			}
			window.QuestionField = QuestionField;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/QuestionField.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/ResponseSheet.jsx
	try {
		(() => {
			// ResponseSheet — shared bottom sheet listing members per RSVP status,
			// with a Lions-2.0 switcher between Zugesagt / Abgesagt / Offen.
			// Opened from the list-card counters and the Termin-Detail "Meldungen" rows.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			const RS_META = {
				yes: {
					label: 'Zugesagt',
					icon: 'check',
					fg: 'var(--status-yes-fg)',
					dot: 'var(--status-yes-dot)'
				},
				no: {
					label: 'Abgesagt',
					icon: 'x',
					fg: 'var(--status-no-fg)',
					dot: 'var(--status-no-dot)'
				},
				open: {
					label: 'Keine Meldung',
					icon: 'circle-help',
					fg: 'var(--ink-500)',
					dot: 'var(--status-open-dot)'
				}
			};
			const RS_ORDER = ['yes', 'no', 'open'];
			function ResponseSheet({ sheet, onClose, onStatus }) {
				const { Avatar } = LC;
				const { Ic } = window;
				const open = !!sheet;
				const ev = open ? window.LC_DATA.events.find((x) => x.id === sheet.eventId) : null;
				const groups = ev
					? window.LC_DATA.responsesFor(ev)
					: {
							yes: [],
							no: [],
							open: []
						};
				const active = sheet ? sheet.status : 'yes';
				const list = groups[active] || [];
				const counts = {
					yes: ev ? ev.yes : 0,
					no: ev ? ev.no : 0,
					open: ev ? ev.open : 0
				};
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'rs' + (open ? ' rs--open' : ''),
						'aria-hidden': !open
					},
					/*#__PURE__*/ React.createElement('button', {
						className: 'rs__scrim',
						'aria-label': 'Schlie\xDFen',
						onClick: onClose,
						tabIndex: open ? 0 : -1
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'rs__panel',
							role: 'dialog',
							'aria-label': 'Meldungen',
							style: {
								transform: open ? 'translateY(0)' : 'translateY(101%)'
							}
						},
						/*#__PURE__*/ React.createElement('div', {
							className: 'rs__grab'
						}),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'rs__head'
							},
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'rs__hetxt'
								},
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'rs__eyebrow'
									},
									'Meldungen'
								),
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'rs__title'
									},
									ev ? ev.title : ''
								)
							),
							/*#__PURE__*/ React.createElement(
								'button',
								{
									className: 'rs__close',
									'aria-label': 'Schlie\xDFen',
									onClick: onClose
								},
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'x',
									size: 20
								})
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'rs__switch',
								role: 'tablist'
							},
							RS_ORDER.map((k) => {
								const m = RS_META[k];
								const on = k === active;
								return /*#__PURE__*/ React.createElement(
									'button',
									{
										key: k,
										role: 'tab',
										'aria-selected': on,
										className: 'rs__tab' + (on ? ' rs__tab--on' : ''),
										style: on
											? {
													'--rs-fg': m.fg
												}
											: undefined,
										onClick: () => onStatus(k)
									},
									/*#__PURE__*/ React.createElement('span', {
										className: 'rs__tabdot',
										style: {
											background: m.dot
										}
									}),
									/*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'rs__tablbl'
										},
										m.label
									),
									/*#__PURE__*/ React.createElement(
										'span',
										{
											className: 'rs__tabnum'
										},
										counts[k]
									)
								);
							})
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'rs__list'
							},
							list.map((m, i) =>
								/*#__PURE__*/ React.createElement(
									'div',
									{
										key: i,
										className: 'rs__row'
									},
									/*#__PURE__*/ React.createElement(Avatar, {
										name: m.name,
										tone: m.tone
									}),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'rs__rowbody'
										},
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'rs__name'
											},
											m.name
										),
										/*#__PURE__*/ React.createElement(
											'div',
											{
												className: 'rs__role'
											},
											m.role
										)
									),
									m.companion
										? /*#__PURE__*/ React.createElement(
												'span',
												{
													className: 'rs__companion'
												},
												/*#__PURE__*/ React.createElement(Ic, {
													name: 'user-plus',
													size: 14
												}),
												' +1'
											)
										: null
								)
							),
							list.length === 0 &&
								/*#__PURE__*/ React.createElement(
									'div',
									{
										className: 'rs__empty'
									},
									'Niemand in dieser Gruppe.'
								),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 8
								}
							})
						)
					)
				);
			}
			window.ResponseSheet = ResponseSheet;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/ResponseSheet.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/TreasurerScreen.jsx
	try {
		(() => {
			// Schatzmeister-Auswertung — Abwesenheiten je Mitglied, Summe, Export.
			const LC = window.LionsClubBonnRheinaueDesignSystem_4b530e;
			function TreasurerScreen({ onBack }) {
				const { AppBar, IconButton, Button, Card, Avatar, Select } = LC;
				const { Ic } = window;
				const rate = window.LC_DATA.donationRate;
				const rows = [...window.LC_DATA.donations].sort((a, b) => b.count - a.count);
				const totalAbsences = rows.reduce((s, r) => s + r.count, 0);
				const totalSum = totalAbsences * rate;
				const euro = (n) => n.toFixed(2).replace('.', ',') + ' €';
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'screen'
					},
					/*#__PURE__*/ React.createElement(AppBar, {
						center: true,
						bordered: true,
						title: 'Auswertung',
						leading: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'chevron-left',
								size: 22
							}),
							label: 'Zur\xFCck',
							onClick: onBack
						}),
						trailing: /*#__PURE__*/ React.createElement(IconButton, {
							icon: /*#__PURE__*/ React.createElement(Ic, {
								name: 'download',
								size: 20
							}),
							label: 'Export',
							tone: 'primary'
						})
					}),
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'screen__scroll'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'screen__pad detail__stack',
								style: {
									paddingTop: 14
								}
							},
							/*#__PURE__*/ React.createElement(Select, {
								label: 'Zeitraum',
								options: ['Clubjahr 2025/26', '1. Halbjahr 2026', 'Juni 2026'],
								defaultValue: 'Clubjahr 2025/26'
							}),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'treas-totals'
								},
								/*#__PURE__*/ React.createElement(
									Card,
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'treas-stat__l'
										},
										'Abwesenheiten'
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'treas-stat__n'
										},
										totalAbsences
									)
								),
								/*#__PURE__*/ React.createElement(
									Card,
									null,
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'treas-stat__l'
										},
										'Summe \xB7 ',
										euro(rate),
										'/Stk.'
									),
									/*#__PURE__*/ React.createElement(
										'div',
										{
											className: 'treas-stat__n u-mono',
											style: {
												color: 'var(--gold-700)'
											}
										},
										euro(totalSum)
									)
								)
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'sec-label'
								},
								'Je Mitglied'
							),
							/*#__PURE__*/ React.createElement(
								Card,
								{
									flush: true
								},
								rows.map((r, i) =>
									/*#__PURE__*/ React.createElement(
										'div',
										{
											key: r.id,
											className: 'treas-row' + (i > 0 ? ' treas-row--div' : '')
										},
										/*#__PURE__*/ React.createElement(Avatar, {
											name: r.name,
											size: 'sm',
											tone: r.count > 0 ? 'gold' : 'cream'
										}),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'treas-row__name'
											},
											r.name
										),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'treas-row__count u-mono'
											},
											r.count,
											'\xD7'
										),
										/*#__PURE__*/ React.createElement(
											'span',
											{
												className: 'treas-row__sum u-mono'
											},
											euro(r.count * rate)
										)
									)
								)
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'treas-note'
								},
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'info',
									size: 15
								}),
								' Die App erfasst nur Abwesenheiten. Die Buchung erfolgt extern durch den Schatzmeister.'
							),
							/*#__PURE__*/ React.createElement(
								'div',
								{
									className: 'treas-actions'
								},
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'secondary',
										iconLeft: /*#__PURE__*/ React.createElement(Ic, {
											name: 'file-text',
											size: 18
										})
									},
									'PDF'
								),
								/*#__PURE__*/ React.createElement(
									Button,
									{
										variant: 'secondary',
										iconLeft: /*#__PURE__*/ React.createElement(Ic, {
											name: 'table',
											size: 18
										})
									},
									'CSV'
								)
							),
							/*#__PURE__*/ React.createElement('div', {
								style: {
									height: 12
								}
							})
						)
					)
				);
			}
			window.TreasurerScreen = TreasurerScreen;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/TreasurerScreen.jsx',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/data.js
	try {
		(() => {
			// Sample club data for the Lions Club Bonn-Rheinaue UI kit.
			// Fictional members & events — illustrative only.
			window.LC_DATA = {
				me: {
					id: 'm1',
					name: 'Andreas Kremer',
					role: 'Präsident',
					initials: 'AK'
				},
				members: [
					{
						id: 'm1',
						name: 'Andreas Kremer',
						role: 'Präsident',
						status: 'aktiv',
						tone: 'blue',
						phone: '+49 170 1234567',
						email: 'a.kremer@example.de',
						partner: 'Birgit Kremer'
					},
					{
						id: 'm2',
						name: 'Maria Vogt',
						role: 'Schatzmeisterin',
						status: 'aktiv',
						tone: 'gold',
						phone: '+49 171 2345678',
						email: 'm.vogt@example.de',
						partner: 'Klaus Vogt'
					},
					{
						id: 'm3',
						name: 'Dr. Jens Berg',
						role: 'Sekretär',
						status: 'aktiv',
						tone: 'cream',
						phone: '+49 172 3456789',
						email: 'j.berg@example.de',
						partner: ''
					},
					{
						id: 'm4',
						name: 'Petra Lindner',
						role: 'Vizepräsidentin',
						status: 'aktiv',
						tone: 'blue',
						phone: '+49 173 4567890',
						email: 'p.lindner@example.de',
						partner: 'Thomas Lindner'
					},
					{
						id: 'm5',
						name: 'Wolfgang Reuter',
						role: 'Clubmaster',
						status: 'aktiv',
						tone: 'gold',
						phone: '+49 174 5678901',
						email: 'w.reuter@example.de',
						partner: 'Sabine Reuter'
					},
					{
						id: 'm6',
						name: 'Heinz Albers',
						role: 'Mitglied',
						status: 'Ehrenmitglied',
						tone: 'cream',
						phone: '+49 175 6789012',
						email: 'h.albers@example.de',
						partner: 'Inge Albers'
					},
					{
						id: 'm7',
						name: 'Claudia Brandt',
						role: 'Mitglied',
						status: 'aktiv',
						tone: 'blue',
						phone: '+49 176 7890123',
						email: 'c.brandt@example.de',
						partner: ''
					},
					{
						id: 'm8',
						name: 'Michael Sommer',
						role: 'Webmaster',
						status: 'aktiv',
						tone: 'gold',
						phone: '+49 177 8901234',
						email: 'm.sommer@example.de',
						partner: 'Eva Sommer'
					},
					{
						id: 'm9',
						name: 'Renate Hofmann',
						role: 'Mitglied',
						status: 'inaktiv',
						tone: 'cream',
						phone: '+49 178 9012345',
						email: 'r.hofmann@example.de',
						partner: 'Peter Hofmann'
					},
					{
						id: 'm10',
						name: 'Frank Wolff',
						role: 'Past-Präsident',
						status: 'aktiv',
						tone: 'blue',
						phone: '+49 179 0123456',
						email: 'f.wolff@example.de',
						partner: 'Anna Wolff'
					},
					{
						id: 'm11',
						name: 'Ursula Krämer',
						role: 'Mitglied',
						status: 'aktiv',
						tone: 'gold',
						phone: '+49 160 1112233',
						email: 'u.kraemer@example.de',
						partner: ''
					},
					{
						id: 'm12',
						name: 'Bernd Schäfer',
						role: 'Mitglied',
						status: 'aktiv',
						tone: 'cream',
						phone: '+49 161 2223344',
						email: 'b.schaefer@example.de',
						partner: 'Marion Schäfer'
					}
				],
				// NOTE: `title` = program/theme of the evening; `type` is shown only as a badge.
				// `questions` drives the per-event Zusatzabfragen on the detail screen.
				//   kind: 'single' | 'multi' | 'text' | 'bool' | 'number'
				//   scope: 'person' (default — asked for the member AND each Begleitperson)
				//          'group'  (asked once for the whole booking, e.g. room/travel)
				events: [
					{
						id: 'e1',
						title: 'Thalia Buchhandlung – gestern, heute, morgen',
						type: 'Club-Abend',
						typeKey: 'clubabend',
						date: '12.06.',
						day: '12',
						monShort: 'Jun',
						weekday: 'Do',
						time: '19:00',
						month: 'Juni 2026',
						iso: '2026-06-12',
						phase: 'past',
						location: 'Restaurant Rheinblick',
						city: 'Bonn',
						companion: true,
						status: 'yes',
						yes: 21,
						no: 4,
						open: 9,
						present: 19,
						desc: 'Vortrag von Frau Sander (Thalia Bonn) über den Wandel des stationären Buchhandels. Anschließend gemeinsames Essen.',
						questions: [
							{
								id: 'menu',
								kind: 'single',
								label: 'Menüauswahl',
								icon: 'utensils',
								required: true,
								options: ['Rinderfilet', 'Lachsfilet', 'Vegetarische Variante']
							},
							{
								id: 'allergy',
								kind: 'text',
								label: 'Unverträglichkeiten',
								icon: 'info',
								placeholder: 'z. B. Nüsse, Laktose … (optional)'
							}
						]
					},
					{
						id: 'e2',
						title: 'Jahreshauptversammlung & Vorstandswahl',
						type: 'Versammlung',
						typeKey: 'versammlung',
						date: '26.06.',
						day: '26',
						monShort: 'Jun',
						weekday: 'Do',
						time: '19:00',
						month: 'Juni 2026',
						iso: '2026-06-26',
						phase: 'upcoming',
						location: 'Restaurant Rheinblick',
						city: 'Bonn',
						companion: false,
						status: 'open',
						yes: 12,
						no: 2,
						open: 20,
						desc: 'Wahl des neuen Vorstands, Kassenbericht und Jahresplanung. Findet statt eines Clubabends statt.',
						questions: []
					},
					{
						id: 'e3',
						title: 'Sommerfest im Garten',
						type: 'Gesellig',
						typeKey: 'gesellig',
						date: '06.07.',
						day: '06',
						monShort: 'Jul',
						weekday: 'Mo',
						time: '16:00',
						month: 'Juli 2026',
						iso: '2026-07-06',
						phase: 'upcoming',
						location: 'Garten Familie Kremer',
						city: 'Bonn-Bad Godesberg',
						companion: true,
						status: 'yes',
						yes: 28,
						no: 1,
						open: 5,
						desc: 'Sommerfest mit Familien und Partnern. Für Grillgut ist gesorgt — bitte etwas zum Buffet beisteuern.',
						questions: [
							{
								id: 'buffet',
								kind: 'multi',
								label: 'Was bringst du mit?',
								icon: 'utensils',
								options: ['Salat', 'Nachtisch', 'Getränke', 'Fingerfood']
							},
							{
								id: 'veggie',
								kind: 'bool',
								label: 'Vegetarisches Essen gewünscht?',
								icon: 'leaf'
							},
							{
								id: 'guests',
								kind: 'number',
								label: 'Kinder',
								icon: 'users',
								min: 0,
								max: 6,
								unit: 'Kind/er',
								scope: 'group'
							}
						]
					},
					{
						id: 'e4',
						title: 'Distriktversammlung 111-RN',
						type: 'Lions-Termin',
						typeKey: 'lions',
						date: '28.06.',
						day: '28',
						monShort: 'Jun',
						weekday: 'So',
						time: '10:00',
						month: 'Juni 2026',
						iso: '2026-06-28',
						phase: 'upcoming',
						location: 'Maritim Hotel',
						city: 'Köln',
						companion: false,
						status: 'no',
						yes: 6,
						no: 8,
						open: 20,
						desc: 'Offizielle Distriktversammlung 111-RN mit Delegierten der Region. Anmeldung über das Distriktbüro.',
						questions: []
					},
					{
						id: 'e5',
						title: 'Club-Reise in die Toskana',
						type: 'Club-Reise',
						typeKey: 'reise',
						date: '18.09.',
						day: '18',
						monShort: 'Sep',
						weekday: 'Fr',
						time: '08:00',
						month: 'September 2026',
						iso: '2026-09-18',
						phase: 'upcoming',
						location: 'Abfahrt Bonn Hbf',
						city: 'Toskana, IT',
						companion: true,
						status: 'open',
						yes: 14,
						no: 3,
						open: 17,
						desc: 'Viertägige Clubreise in die Toskana mit Weingut-Besuch und Florenz-Tag. Bitte Zimmerwunsch und Anreise angeben.',
						questions: [
							{
								id: 'menu',
								kind: 'single',
								label: 'Menü Gala-Abend',
								icon: 'utensils',
								required: true,
								options: ['Fleisch', 'Fisch', 'Vegetarisch']
							},
							{
								id: 'room',
								kind: 'single',
								label: 'Zimmerwunsch',
								icon: 'bed-double',
								required: true,
								scope: 'group',
								options: ['Einzelzimmer', 'Doppelzimmer', 'Doppelzimmer zur Einzelnutzung']
							},
							{
								id: 'travel',
								kind: 'single',
								label: 'Anreise',
								icon: 'bus',
								scope: 'group',
								options: ['Bus ab Bonn Hbf', 'Eigene Anreise']
							},
							{
								id: 'nights',
								kind: 'number',
								label: 'Zusätzliche Nächte',
								icon: 'moon',
								min: 0,
								max: 4,
								unit: 'Nacht/Nächte',
								scope: 'group'
							},
							{
								id: 'wishes',
								kind: 'text',
								label: 'Besondere Wünsche',
								icon: 'message-square',
								placeholder: 'Optional …',
								scope: 'group'
							}
						]
					},
					{
						id: 'e6',
						title: 'Maiausflug zum Drachenfels',
						type: 'Gesellig',
						typeKey: 'gesellig',
						date: '24.05.',
						day: '24',
						monShort: 'Mai',
						weekday: 'So',
						time: '11:00',
						month: 'Mai 2026',
						iso: '2026-05-24',
						phase: 'past',
						location: 'Drachenfels',
						city: 'Königswinter',
						companion: true,
						status: 'yes',
						yes: 26,
						no: 5,
						open: 3,
						present: 25,
						desc: 'Gemeinsame Wanderung auf den Drachenfels mit Einkehr. Bei gutem Wetter Familien willkommen.',
						extras: []
					},
					{
						id: 'e7',
						title: 'Benefizkonzert „Klassik am Rhein“',
						type: 'Activity',
						typeKey: 'lions',
						date: '08.05.',
						day: '08',
						monShort: 'Mai',
						weekday: 'Fr',
						time: '19:30',
						month: 'Mai 2026',
						iso: '2026-05-08',
						phase: 'past',
						location: 'Stadthalle',
						city: 'Bad Godesberg',
						companion: true,
						status: 'yes',
						yes: 30,
						no: 2,
						open: 2,
						present: 29,
						desc: 'Benefizkonzert zugunsten des Förderprojekts „Lesen macht stark“. Erlös € 4.200.',
						extras: []
					},
					{
						id: 'e8',
						title: 'Club-Abend April – Jahresbericht',
						type: 'Club-Abend',
						typeKey: 'clubabend',
						date: '17.04.',
						day: '17',
						monShort: 'Apr',
						weekday: 'Do',
						time: '19:00',
						month: 'April 2026',
						iso: '2026-04-17',
						phase: 'past',
						location: 'Restaurant Rheinblick',
						city: 'Bonn',
						companion: false,
						status: 'no',
						yes: 22,
						no: 9,
						open: 3,
						present: 22,
						desc: 'Halbjahres-Bericht des Präsidenten und Vorschau auf die Sommeraktivitäten.',
						extras: []
					}
				],
				donations: [
					{
						id: 'm1',
						name: 'Andreas Kremer',
						count: 0
					},
					{
						id: 'm5',
						name: 'Wolfgang Reuter',
						count: 2
					},
					{
						id: 'm7',
						name: 'Claudia Brandt',
						count: 1
					},
					{
						id: 'm11',
						name: 'Ursula Krämer',
						count: 3
					},
					{
						id: 'm12',
						name: 'Bernd Schäfer',
						count: 1
					},
					{
						id: 'm3',
						name: 'Dr. Jens Berg',
						count: 0
					},
					{
						id: 'm4',
						name: 'Petra Lindner',
						count: 2
					}
				],
				donationRate: 25
			};

			// 34-person roster for the response sheets (who is in which group).
			window.LC_ROSTER = [
				{
					name: 'Andreas Kremer',
					role: 'Präsident',
					tone: 'blue'
				},
				{
					name: 'Maria Vogt',
					role: 'Schatzmeisterin',
					tone: 'gold'
				},
				{
					name: 'Dr. Jens Berg',
					role: 'Sekretär',
					tone: 'cream'
				},
				{
					name: 'Petra Lindner',
					role: 'Vizepräsidentin',
					tone: 'blue'
				},
				{
					name: 'Wolfgang Reuter',
					role: 'Clubmaster',
					tone: 'gold'
				},
				{
					name: 'Heinz Albers',
					role: 'Ehrenmitglied',
					tone: 'cream'
				},
				{
					name: 'Claudia Brandt',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Michael Sommer',
					role: 'Webmaster',
					tone: 'gold'
				},
				{
					name: 'Renate Hofmann',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Frank Wolff',
					role: 'Past-Präsident',
					tone: 'blue'
				},
				{
					name: 'Ursula Krämer',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Bernd Schäfer',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Thomas Engel',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Sabine Reuter',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Klaus Vogt',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Inge Albers',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Dieter Hahn',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Gabriele Roth',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Werner Krause',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Monika Lang',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Jürgen Beck',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Brigitte Falk',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Helmut Sauer',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Christa Neumann',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Rolf Zimmermann',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Andrea Pohl',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Günter Frey',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Elke Busch',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Norbert Kuhn',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Marion Schäfer',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Peter Hofmann',
					role: 'Mitglied',
					tone: 'blue'
				},
				{
					name: 'Anna Wolff',
					role: 'Mitglied',
					tone: 'gold'
				},
				{
					name: 'Stefan Götz',
					role: 'Mitglied',
					tone: 'cream'
				},
				{
					name: 'Karin Vogel',
					role: 'Mitglied',
					tone: 'blue'
				}
			];

			// Deterministic per-event grouping that matches each event's yes/no/open counts.
			// Rotates the roster by a per-event offset so groups differ between events,
			// and flags a few companions (+1) on club evenings / trips.
			window.LC_DATA.responsesFor = function (ev) {
				const R = window.LC_ROSTER;
				const n = R.length;
				const off = (parseInt(ev.day, 10) * 5) % n;
				const rot = R.slice(off).concat(R.slice(0, off));
				const tag = (arr, status) =>
					arr.map((m, i) => ({
						...m,
						status,
						companion: status === 'yes' && ev.companion && i % 5 === 1
					}));
				const yes = tag(rot.slice(0, ev.yes), 'yes');
				const no = tag(rot.slice(ev.yes, ev.yes + ev.no), 'no');
				const open = tag(rot.slice(ev.yes + ev.no, ev.yes + ev.no + ev.open), 'open');
				return {
					yes,
					no,
					open
				};
			};
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/data.js',
			error: String((e && e.message) || e)
		});
	}

	// ui_kits/club-app/helpers.jsx
	try {
		(() => {
			// Shared helpers for the club-app UI kit: Lucide icon wrapper + phone frame.
			// Exported to window so the per-screen babel scripts can use them.

			function Ic({ name, size = 22, color, className = '', style = {} }) {
				const ref = React.useRef(null);
				React.useEffect(() => {
					const node = ref.current;
					if (node && window.lucide) {
						node.innerHTML = `<i data-lucide="${name}"></i>`;
						window.lucide.createIcons();
					}
				}, [name]);
				return /*#__PURE__*/ React.createElement('span', {
					ref: ref,
					className: 'lc-ic ' + className,
					style: {
						display: 'inline-flex',
						width: size,
						height: size,
						color,
						...style
					}
				});
			}

			// Lightweight PWA-style phone frame (cream status bar, no heavy bezel).
			function PhoneFrame({ children, statusDark = false }) {
				const time = '9:41';
				return /*#__PURE__*/ React.createElement(
					'div',
					{
						className: 'pf'
					},
					/*#__PURE__*/ React.createElement(
						'div',
						{
							className: 'pf__screen'
						},
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'pf__status' + (statusDark ? ' pf__status--dark' : '')
							},
							/*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'pf__time'
								},
								time
							),
							/*#__PURE__*/ React.createElement(
								'span',
								{
									className: 'pf__icons'
								},
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'signal',
									size: 16
								}),
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'wifi',
									size: 16
								}),
								/*#__PURE__*/ React.createElement(Ic, {
									name: 'battery-full',
									size: 18
								})
							)
						),
						/*#__PURE__*/ React.createElement(
							'div',
							{
								className: 'pf__body'
							},
							children
						)
					)
				);
			}
			window.Ic = Ic;
			window.PhoneFrame = PhoneFrame;
		})();
	} catch (e) {
		__ds_ns.__errors.push({
			path: 'ui_kits/club-app/helpers.jsx',
			error: String((e && e.message) || e)
		});
	}

	__ds_ns.Avatar = __ds_scope.Avatar;

	__ds_ns.Button = __ds_scope.Button;

	__ds_ns.Card = __ds_scope.Card;

	__ds_ns.IconButton = __ds_scope.IconButton;

	__ds_ns.Tag = __ds_scope.Tag;

	__ds_ns.HintCard = __ds_scope.HintCard;

	__ds_ns.StatusBadge = __ds_scope.StatusBadge;

	__ds_ns.Checkbox = __ds_scope.Checkbox;

	__ds_ns.Input = __ds_scope.Input;

	__ds_ns.OtpInput = __ds_scope.OtpInput;

	__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

	__ds_ns.Select = __ds_scope.Select;

	__ds_ns.Switch = __ds_scope.Switch;

	__ds_ns.AppBar = __ds_scope.AppBar;

	__ds_ns.ListRow = __ds_scope.ListRow;

	__ds_ns.TabBar = __ds_scope.TabBar;
})();
