import { InputHTMLAttributes, ReactNode } from 'react';

/**
 * Labeled text field with optional leading icon, hint and a clear
 * inline error message (errors are explicit per the brief). Set
 * `multiline` for a textarea (e.g. event comments).
 *
 * @startingPoint section="Forms" subtitle="Labeled input with hint & error states" viewport="700x200"
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	/** Field label rendered above the control. */
	label?: string;
	/** Helper text below the field. */
	hint?: string;
	/** Error message — replaces hint and turns the border clay. */
	error?: string;
	/** Show the required asterisk. */
	required?: boolean;
	/** Leading icon node (Lucide <svg>). */
	icon?: ReactNode;
	/** Render a resizable textarea instead of an input. */
	multiline?: boolean;
}

export function Input(props: InputProps): JSX.Element;
