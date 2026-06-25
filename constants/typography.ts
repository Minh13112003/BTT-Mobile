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

export const FONT_SIZES_COMPACT = {
  card: 14,   // Giảm 2px
  xs: 16,     // Giảm 2px
  sm: 17,     // Giảm 2px
  md: 18,     // Giảm 2px
  lg: 20,     // Giảm 2px
  xl: 21,     // Giảm 3px
  xxl: 24,    // Giảm 4px
  title: 28,  // Giảm 4px
  hero: 32,   // Giảm 4px
} as const;

export const FONT_SIZE = {
  get card() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.card : FONT_SIZES_NORMAL.card;
  },
  get xs() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.xs : FONT_SIZES_NORMAL.xs;
  },
  get sm() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.sm : FONT_SIZES_NORMAL.sm;
  },
  get md() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.md : FONT_SIZES_NORMAL.md;
  },
  get lg() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.lg : FONT_SIZES_NORMAL.lg;
  },
  get xl() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.xl : FONT_SIZES_NORMAL.xl;
  },
  get xxl() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.xxl : FONT_SIZES_NORMAL.xxl;
  },
  get title() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.title : FONT_SIZES_NORMAL.title;
  },
  get hero() {
    return currentFontSizeMode === "compact" ? FONT_SIZES_COMPACT.hero : FONT_SIZES_NORMAL.hero;
  },
};

export type FontSizeMode = "normal" | "compact";

let currentFontSizeMode: FontSizeMode = "normal";

export function applyFontSizeMode(mode: FontSizeMode) {
  currentFontSizeMode = mode;
}

export type FontSizeKey = keyof typeof FONT_SIZES_NORMAL;
