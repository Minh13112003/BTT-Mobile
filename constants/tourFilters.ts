/**
 * Filter taxonomy for Home sections and the Search screen.
 *
 * Mirrors the backend contract in `tour-type-query.md`:
 *  - `domestic` => GET /tours/by-type?country=Trong nước
 *  - `foreign`  => GET /tours/by-type?country=Nước ngoài
 * `region` values must be sent EXACTLY (dấu + hoa thường) to match the API.
 */
export type SearchMode =
  | "newest"
  | "hot"
  | "popular"
  | "domestic"
  | "foreign"
  | "tour_of_the_year_2026"
  | "tour_cao_cap"
  | "tour_mice"
  | "tour_he"
  | "tour_du_lich_xanh";

/** Khu vực hợp lệ cho country = "Trong nước". */
export const DOMESTIC_REGIONS = ["Miền Bắc", "Miền Trung", "Miền Nam"] as const;

/** Khu vực (châu lục) hợp lệ cho country = "Nước ngoài". */
export const FOREIGN_REGIONS = ["Châu Á", "Châu Âu", "Châu Phi"] as const;

/** Tiêu đề section trên màn Home. */
export const SECTION_LABELS: Record<SearchMode, string> = {
  newest: "Tour mới nhất",
  hot: "Tour hot nhất",
  popular: "Tour bán chạy nhất",
  domestic: "Tour trong nước",
  foreign: "Tour quốc tế",
  tour_of_the_year_2026: "TOUR OF THE YEAR 2026",
  tour_cao_cap: "TOUR CAO CẤP",
  tour_mice: "TOUR MICE",
  tour_he: "TOUR HÈ",
  tour_du_lich_xanh: "DU LỊCH XANH",
};

/** Badge nhỏ cạnh tiêu đề section (pill chữ hoặc emoji), bỏ trống nếu không có. */
export const SECTION_BADGES: Partial<Record<SearchMode, string>> = {
  newest: "HOT",
  hot: "🔥",
  popular: "🔥",
};

/** Nhãn ngắn cho chip lọc trên màn Search. */
export const MODE_CHIP_LABELS: Record<SearchMode, string> = {
  newest: "Mới nhất",
  hot: "Đang hot",
  popular: "Bán chạy",
  domestic: "Trong nước",
  foreign: "Quốc tế",
  tour_of_the_year_2026: "TOUR OF THE YEAR 2026",
  tour_cao_cap: "TOUR CAO CẤP",
  tour_mice: "TOUR MICE",
  tour_he: "TOUR HÈ",
  tour_du_lich_xanh: "DU LỊCH XANH",
};

/** Thứ tự hiển thị các section trên Home & thứ tự chip trên Search. */
export const SECTION_ORDER: SearchMode[] = [
  "newest",
  "hot",
  "popular",
  "domestic",
  "foreign",
  "tour_of_the_year_2026",
  "tour_cao_cap",
  "tour_mice",
  "tour_he",
  "tour_du_lich_xanh",
];

/** Giá trị `country` gửi lên API cho 2 mode theo vị trí. */
export const MODE_COUNTRY: Partial<Record<SearchMode, string>> = {
  domestic: "Trong nước",
  foreign: "Nước ngoài",
};

/** Ánh xạ SearchMode sang chuỗi TourType trong database. */
export const MODE_TOUR_TYPE: Partial<Record<SearchMode, string>> = {
  tour_of_the_year_2026: "TOUR OF THE YEAR 2026",
  tour_cao_cap: "TOUR CAO CẤP",
  tour_mice: "TOUR MICE",
  tour_he: "TOUR HÈ",
  tour_du_lich_xanh: "DU LỊCH XANH",
};

/** Mode có sub-filter khu vực hay không. */
export function regionsForMode(mode: SearchMode): readonly string[] | null {
  if (mode === "domestic") return DOMESTIC_REGIONS;
  if (mode === "foreign") return FOREIGN_REGIONS;
  return null;
}
