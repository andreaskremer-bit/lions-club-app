import { ReactNode } from 'react';

/**
 * The quiet container of the system: warm card surface with a single
 * hairline border — no drop shadow. Use for every grouped block:
 * event cards, member cards, form sections.
 *
 * @startingPoint section="Core" subtitle="Hairline card surface (no shadow)" viewport="700x180"
 */
export interface CardProps {
  children?: ReactNode;
  /** @default "md" */
  size?: 'md' | 'lg';
  /** Remove inner padding (for full-bleed list rows / media). */
  flush?: boolean;
  /** Slightly recessed cream surface. */
  sunken?: boolean;
  /** Make the whole card a button with hover/press feedback. */
  interactive?: boolean;
  /** Override the element tag. */
  as?: keyof JSX.IntrinsicElements;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export function Card(props: CardProps): JSX.Element;
