/**
 * Typography scale — port 1:1 từ constants/typography.ts của app React Native.
 * Hard rule (giữ nguyên bên RN): không size nào nhỏ hơn 16px.
 */
export const FONT_SIZE = {
  card: 16,
  xxs: 16,
  xs: 18,
  sm: 19,
  md: 20,
  lg: 22,
  xl: 24,
  xxl: 28,
  title: 32,
  hero: 36,
} as const;

export type FontSizeKey = keyof typeof FONT_SIZE;
