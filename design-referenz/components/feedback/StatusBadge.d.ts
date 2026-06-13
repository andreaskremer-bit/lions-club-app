import { ReactNode } from 'react';

/**
 * The signature status indicator: a member's registration state for an
 * event — Angemeldet (gold), Abgemeldet (clay), Offen (neutral) — plus
 * Anwesend (sage) for attendance. `dotOnly` renders just the status
 * circle for the left edge of list rows.
 *
 * @startingPoint section="Feedback" subtitle="Angemeldet / Abgemeldet / Offen status badge" viewport="700x120"
 */
export interface StatusBadgeProps {
	/** Registration / attendance state. @default "open" */
	status?: 'yes' | 'no' | 'open' | 'present';
	/** Override the default German label. */
	children?: ReactNode;
	/** Render only the colored circle (for list-row leading edge). */
	dotOnly?: boolean;
	className?: string;
}

export function StatusBadge(props: StatusBadgeProps): JSX.Element;
