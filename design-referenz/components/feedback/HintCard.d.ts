import { ReactNode } from 'react';

/**
 * Gentle inline notice with a colored 4px left stripe — the brand's
 * way of flagging context without alarm. Use for the donation hint on
 * attendance, info on official events, or soft warnings.
 */
export interface HintCardProps {
  /** Bold first line. */
  title?: ReactNode;
  /** Supporting text. */
  children?: ReactNode;
  /** Stripe + tint color. @default "info" */
  tone?: 'info' | 'accent' | 'warning' | 'neutral';
  /** Optional leading icon (Lucide <svg>). */
  icon?: ReactNode;
  className?: string;
}

export function HintCard(props: HintCardProps): JSX.Element;
