/**
 * Toggle switch for binary settings and the attendance present/absent
 * control. `tone="present"` turns the track sage when on.
 */
export interface SwitchProps {
  /** Trailing label. */
  label?: string;
  /** On-state color. @default "primary" */
  tone?: 'primary' | 'present';
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch(props: SwitchProps): JSX.Element;
