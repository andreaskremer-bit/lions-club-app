/**
 * Checkbox (or radio when `radio` is set) with optional label and
 * description. Blue fill when checked. Use for opt-ins, companion
 * person, and single-choice question groups.
 */
export interface CheckboxProps {
  /** Main label text. */
  label?: string;
  /** Smaller helper line under the label. */
  description?: string;
  /** Render as a radio (round) instead of a checkbox. */
  radio?: boolean;
  /** Radio group name. */
  name?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  value?: string;
  className?: string;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
