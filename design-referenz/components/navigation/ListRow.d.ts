import { ReactNode } from 'react';

/**
 * Generic list row: leading slot (status dot / avatar / icon), title +
 * subtitle, and a trailing slot with optional mono date and chevron.
 * The backbone of the member directory, attendance and "Mehr" menu.
 *
 * @startingPoint section="Navigation" subtitle="List row with status, title & mono date" viewport="440x140"
 */
export interface ListRowProps {
	/** Leading node — StatusBadge dot, Avatar or icon. */
	lead?: ReactNode;
	title?: ReactNode;
	subtitle?: ReactNode;
	/** Right-aligned mono date/time string. */
	date?: ReactNode;
	/** Extra trailing node (badge, switch, icon button). */
	trailing?: ReactNode;
	/** Show a trailing chevron. */
	chevron?: boolean;
	/** Render as a button with hover/press (default) or a static div. */
	interactive?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	className?: string;
}

export function ListRow(props: ListRowProps): JSX.Element;
