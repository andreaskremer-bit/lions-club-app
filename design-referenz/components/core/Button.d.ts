import { ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Primary action button in modernized Lions Blue. Hairline secondary,
 * quiet ghost, and a gentle clay danger variant. Min 48px tall (md) to
 * respect the 44px touch-target rule.
 *
 * @startingPoint section="Core" subtitle="Primary / secondary / ghost / danger button" viewport="700x120"
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Size. md & lg meet the 44px touch target. @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Icon node rendered before the label (e.g. a Lucide <svg>). */
  iconLeft?: ReactNode;
  /** Icon node rendered after the label. */
  iconRight?: ReactNode;
  /** Stretch to container width — common for mobile CTAs. */
  fullWidth?: boolean;
  /** Render as another element, e.g. "a" for links. @default "button" */
  as?: 'button' | 'a';
  children?: ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
