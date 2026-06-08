/**
 * Centralized design tokens for the BenThanh Tourist app.
 *
 * NativeWind handles `className` styling; this palette exists for JS color props
 * (Ionicons `color`, LinearGradient `colors`, StatusBar) so brand colors live in
 * a single source of truth instead of being copy-pasted across screens.
 */
export const BRAND = {
  red: "#E51F27",
  redActive: "#C41A21",
  green: "#16A34A",
  greenDark: "#15803D",
  greenAccent: "#4CAF50",
  amber: "#F59E0B",
  star: "#F59E0B",
} as const;

export interface Palette {
  isDark: boolean;
  brand: string;
  gradient: readonly [string, string];
  screenBg: string;
  icon: string;
  iconMuted: string;
  star: string;
  spinner: string;
}

/** Resolve the active color palette from the current theme. */
export function getPalette(isDark: boolean): Palette {
  return {
    isDark,
    brand: BRAND.red,
    gradient: isDark
      ? (["#1E222B", "#111318"] as const)
      : (["#E0F2FE", "#F1F5F9"] as const),
    screenBg: isDark ? "#111318" : "#F1F5F9",
    icon: isDark ? "#93C5FD" : "#E51F27",
    iconMuted: isDark ? "#6B7280" : "#94A3B8",
    star: BRAND.star,
    spinner: isDark ? "#94A3B8" : "#E51F27",
  };
}
