import { ReactNode } from 'react';

/** A single bottom-tab destination. */
export interface TabItem {
  /** Unique id (matches `value`). */
  id: string;
  /** Short label under the icon. */
  label: string;
  /** Line icon node (Lucide <svg>). */
  icon: ReactNode;
  /** Optional filled/active icon variant. */
  iconActive?: ReactNode;
  /** Optional count badge. */
  badge?: string | number;
}

/**
 * Bottom tab bar — the app's primary mobile navigation. Line icons,
 * active destination in Lions Blue, respects the home-indicator safe
 * area. Core tabs: Termine · Mitglieder · News · Mehr.
 *
 * @startingPoint section="Navigation" subtitle="Mobile bottom tab bar" viewport="440x96"
 */
export interface TabBarProps {
  items?: TabItem[];
  /** Active tab id. */
  value?: string;
  /** Called with the chosen tab id. */
  onChange?: (id: string) => void;
  className?: string;
}

export function TabBar(props: TabBarProps): JSX.Element;
