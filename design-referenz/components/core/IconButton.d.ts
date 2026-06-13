import { ReactNode } from 'react';

/**
 * Square, label-only-for-a11y icon button for toolbars, app bars and
 * row actions (call, mail, edit). Uses a Lucide <svg> as `icon`.
 */
export interface IconButtonProps {
  /** Icon node — typically a Lucide <svg>. */
  icon: ReactNode;
  /** Accessible label (aria-label + title); required. */
  label: string;
  /** @default "md" (44px) */
  size?: 'sm' | 'md' | 'lg';
  /** Show a hairline + card background (e.g. floating actions). */
  bordered?: boolean;
  /** "primary" tints the glyph Lions Blue. @default "default" */
  tone?: 'default' | 'primary';
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
}

export function IconButton(props: IconButtonProps): JSX.Element;
