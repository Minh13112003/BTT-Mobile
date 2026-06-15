/**
 * Centralized design tokens for the BenThanh Tourist app.
 *
 * NativeWind handles `className` styling; this palette exists for JS color props
 * (Ionicons `color`, LinearGradient `colors`, StatusBar) so brand colors live in
 * a single source of truth instead of being copy-pasted across screens.
 */
export const BRAND = {
  red: "#D0021B",
  redActive: "#A80016",
  redLight: "#FF1F37",
  gold: "#E8A020",
  goldLight: "#FFF3DC",
  green: "#16A34A",
  greenDark: "#15803D",
  greenAccent: "#4CAF50",
  amber: "#F59E0B",
  star: "#F59E0B",
  /** Flat screen background (light) — matches the redesign mockup. */
  bgLight: "#F5F6FA",
  bgDark: "#111318",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
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
    // Light theme uses a flat near-white background with a hair of vertical
    // fade so the red curved header reads cleanly against it (matches mockup).
    gradient: isDark
      ? (["#1E222B", "#111318"] as const)
      : (["#F5F6FA", "#F5F6FA"] as const),
    screenBg: isDark ? "#111318" : "#F5F6FA",
    icon: isDark ? "#93C5FD" : "#D0021B",
    iconMuted: isDark ? "#6B7280" : "#9CA3AF",
    star: BRAND.star,
    spinner: isDark ? "#94A3B8" : "#D0021B",
  };
}
