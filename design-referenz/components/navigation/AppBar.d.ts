import { ReactNode } from 'react';

/**
 * Top app bar with a serif title, optional mono eyebrow, and leading /
 * trailing slots for back buttons and actions. `large` for screen
 * headers, `center` for detail views with a back button.
 */
export interface AppBarProps {
	/** Serif title text. */
	title?: ReactNode;
	/** Small uppercase mono line above the title. */
	eyebrow?: ReactNode;
	/** Left slot — back button / avatar. */
	leading?: ReactNode;
	/** Right slot — actions. */
	trailing?: ReactNode;
	/** Add a bottom hairline + card background. */
	bordered?: boolean;
	/** Center the title (detail screens). */
	center?: boolean;
	/** Larger title for top-level screens. */
	large?: boolean;
	className?: string;
}

export function AppBar(props: AppBarProps): JSX.Element;
