/** Option for Select — a plain string or a {label, value} pair. */
export type SelectOption = string | { label: string; value: string };

/**
 * Native-backed dropdown with the system's field styling and a custom
 * chevron. Use for menu/course choice, role, status filters, etc.
 */
export interface SelectProps {
	/** Field label. */
	label?: string;
	/** Options as strings or {label, value}. */
	options?: SelectOption[];
	/** Disabled first option shown when nothing is selected. */
	placeholder?: string;
	value?: string;
	onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	className?: string;
}

export function Select(props: SelectProps): JSX.Element;
