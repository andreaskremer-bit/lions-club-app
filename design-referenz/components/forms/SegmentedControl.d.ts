import { ReactNode } from 'react';

/** Option for SegmentedControl. */
export type SegmentOption = string | { label: string; value: string; icon?: ReactNode };

/**
 * Two-or-three-way inline toggle — the Liste/Kalender switch on the
 * event overview, and short single-choice filters.
 */
export interface SegmentedControlProps {
  /** Options as strings or {label, value, icon}. */
  options?: SegmentOption[];
  /** Currently selected value. */
  value?: string;
  /** Called with the chosen value. */
  onChange?: (value: string) => void;
  className?: string;
}

export function SegmentedControl(props: SegmentedControlProps): JSX.Element;
