/**
 * Design tokens — port 1:1 từ constants/theme.ts của app React Native, để giữ
 * đúng design language giữa 2 bản app. Dùng khi cần giá trị hex thật trong JS
 * (SVG fill, inline style); phần lớn UI nên dùng class Tailwind + CSS variables
 * trong src/css/app.scss thay vì import trực tiếp từ đây.
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
  bgLight: "#F5F6FA",
  bgDark: "#111318",
  textPrimary: "#1A1A2E",
  textSecondary: "#6B7280",
  textMuted: "#9CA3AF",
} as const;

/**
 * Chiều cao thật của BottomNavigation (zaui-bottom-navigation-content:
 * `calc(safe-area-inset-bottom + 48px)`) — các trang có tab bar (Home, Search,
 * History, Notifications, Profile) cần padding-bottom bằng giá trị này để nội
 * dung cuối trang không bị tab bar fixed đè lên.
 */
export const BOTTOM_NAV_SPACE = "calc(max(env(safe-area-inset-bottom), 12px) + 96px)";

export const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export interface Palette {
  isDark: boolean;
  brand: string;
  screenBg: string;
  icon: string;
  iconMuted: string;
  star: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  danger: string;
}

/** Resolve màu theo theme — tương đương getPalette() bên app React Native. */
export function getPalette(isDark: boolean): Palette {
  return {
    isDark,
    brand: BRAND.red,
    screenBg: isDark ? "#111318" : "#F5F6FA",
    icon: isDark ? "#93C5FD" : "#D0021B",
    iconMuted: isDark ? "#6B7280" : "#9CA3AF",
    star: BRAND.star,
    surface: isDark ? "#1E222B" : "#FFFFFF",
    surfaceAlt: isDark ? "#252A35" : "#F1F5F9",
    border: isDark ? "#334155" : "#E2E8F0",
    textPrimary: isDark ? "#F1F5F9" : BRAND.textPrimary,
    textSecondary: isDark ? "#94A3B8" : BRAND.textSecondary,
    textMuted: isDark ? "#64748B" : BRAND.textMuted,
    danger: isDark ? "#F87171" : "#EF4444",
  };
}
