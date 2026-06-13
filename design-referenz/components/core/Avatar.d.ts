/**
 * Member avatar — round photo, or warm initials fallback when no
 * photo is on file. Used in the directory, attendance lists and the
 * app bar.
 */
export interface AvatarProps {
	/** Full name — drives the initials fallback and aria-label. */
	name?: string;
	/** Photo URL; falls back to initials when absent. */
	src?: string | null;
	/** @default "md" (44px) */
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
	/** Fallback chip color. @default "gold" */
	tone?: 'gold' | 'blue' | 'cream';
	className?: string;
}

export function Avatar(props: AvatarProps): JSX.Element;
