/**
 * Six-cell one-time-code entry for the e-mail OTP login — the app's
 * only authentication step. Mono digits, auto-advance, paste support.
 */
export interface OtpInputProps {
	/** Number of digits. @default 6 */
	length?: number;
	/** Current code value (controlled). */
	value?: string;
	/** Called with the new code string on every change. */
	onChange?: (value: string) => void;
	className?: string;
}

export function OtpInput(props: OtpInputProps): JSX.Element;
