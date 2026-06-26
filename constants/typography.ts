/**
 * Typography scale for the BenThanh Tourist app.
 *
 * Hard rule: the smallest font size used anywhere in the app is 16px. Prefer
 * these tokens over hard-coded `fontSize` values so the minimum is enforced in
 * one place.
 */
export const FONT_SIZES_NORMAL = {
  card: 16,
  xs: 18,
  sm: 19,
  md: 20,
  lg: 22,
  xl: 24,
  xxl: 28,
  title: 32,
  hero: 36,
} as const;

export const FONT_SIZE = FONT_SIZES_NORMAL;

export type FontSizeKey = keyof typeof FONT_SIZES_NORMAL;

