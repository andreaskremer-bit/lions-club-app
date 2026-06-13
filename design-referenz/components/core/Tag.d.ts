import { ReactNode } from 'react';

/**
 * Small pill label for categories and event types (Club-Abend,
 * Club-Reise, Ehrenmitglied …). For an event registration state use
 * StatusBadge instead.
 */
export interface TagProps {
	children?: ReactNode;
	/** Color tone. @default "neutral" */
	tone?: 'neutral' | 'blue' | 'gold' | 'clay' | 'sage';
	/** Transparent fill with a hairline. */
	outline?: boolean;
	/** Show a small leading dot in the current color. */
	dot?: boolean;
	/** Optional leading icon node (Lucide <svg>). */
	icon?: ReactNode;
	className?: string;
}

export function Tag(props: TagProps): JSX.Element;
