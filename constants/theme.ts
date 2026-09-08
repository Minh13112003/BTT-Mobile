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

/**
 * Bo góc chuẩn hoá — dùng thay cho các giá trị borderRadius rời rạc (từng có
 * 18 giá trị khác nhau rải rác toàn app). Chọn 1 mức gần nhất thay vì bịa số mới.
 */
export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export interface ShadowStyle {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

/**
 * Bóng đổ chuẩn hoá theo theme. Dark mode dùng viền thay bóng (bóng đen không
 * đọc được trên nền tối) nên trả object gần như tắt hẳn — dùng cùng 1 hàm để
 * mọi nơi tắt/bật bóng nhất quán thay vì mỗi component tự viết object riêng.
 */
export function getShadow(
  isDark: boolean,
  level: "sm" | "md" | "lg" = "md"
): ShadowStyle {
  if (isDark) {
    return {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    };
  }
  const levels: Record<"sm" | "md" | "lg", ShadowStyle> = {
    sm: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    md: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: "#1A1A2E",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
    },
  };
  return levels[level];
}

export interface Palette {
  isDark: boolean;
  brand: string;
  gradient: readonly [string, string];
  screenBg: string;
  icon: string;
  iconMuted: string;
  star: string;
  spinner: string;
  /** Bề mặt card/sheet — thay literal "#fff"/"#1E222B" rải rác. */
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
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
    surface: isDark ? "#1E222B" : "#FFFFFF",
    surfaceAlt: isDark ? "#252A35" : "#F1F5F9",
    border: isDark ? "#334155" : "#E2E8F0",
    textPrimary: isDark ? "#F1F5F9" : BRAND.textPrimary,
    textSecondary: isDark ? "#94A3B8" : BRAND.textSecondary,
    textMuted: isDark ? "#64748B" : BRAND.textMuted,
    danger: isDark ? "#F87171" : "#EF4444",
  };
}
