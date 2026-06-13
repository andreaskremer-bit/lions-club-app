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
	return (
		<span
			ref={ref}
			className={'lc-ic ' + className}
			style={{ display: 'inline-flex', width: size, height: size, color, ...style }}
		/>
	);
}

// Lightweight PWA-style phone frame (cream status bar, no heavy bezel).
function PhoneFrame({ children, statusDark = false }) {
	const time = '9:41';
	return (
		<div className="pf">
			<div className="pf__screen">
				<div className={'pf__status' + (statusDark ? ' pf__status--dark' : '')}>
					<span className="pf__time">{time}</span>
					<span className="pf__icons">
						<Ic name="signal" size={16} />
						<Ic name="wifi" size={16} />
						<Ic name="battery-full" size={18} />
					</span>
				</div>
				<div className="pf__body">{children}</div>
			</div>
		</div>
	);
}

window.Ic = Ic;
window.PhoneFrame = PhoneFrame;
