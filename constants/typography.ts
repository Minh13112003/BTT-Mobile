/**
 * Typography scale for the BenThanh Tourist app.
 *
 * Hard rule: the smallest font size used anywhere in the app is 16px. Prefer
 * these tokens over hard-coded `fontSize` values so the minimum is enforced in
 * one place.
 */
export const FONT_SIZE = {
  card: 14, // chỉ dùng trong card membership
  xs: 16, // nhỏ nhất cho text thường
  sm: 17,
  md: 18,
  lg: 20,
  xl: 22,
  xxl: 26,
  title: 30,
  hero: 34,
} as const;

export type FontSizeKey = keyof typeof FONT_SIZE;
