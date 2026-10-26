import * as urls from "./api/constants";
import { apiService, apiServiceLaravel } from "./api/interceptor";
import type { Departure } from "./departure";

export interface TourItem {
  id: string;
  /**
   * Chỉ có ở tour nguồn NestJS (vd `/tours/newest`) — `tour_key` thật của
   * Laravel nếu đối chiếu được, `null` nếu tour đó không có bản tương ứng
   * đang sống trên benthanhtourist.com. `undefined` ở tour nguồn Laravel
   * (vì lúc đó chính `id` đã là tour_key rồi, không cần field riêng).
   */
  tourKey?: string | null;
  name: string;
  imageUrl: string[];
  imagePublicId: string[];
  /** @deprecated Backend đã xóa — giá lấy từ departures[].price */
  price?: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  hasVat: boolean;
  // Loại hình / điểm đến — dùng cho lọc & hiển thị (xem tour-type-query.md)
  departureFrom?: string;
  transport?: string;
  included?: string[];
  notIncluded?: string[];
  notes?: string | null;
  tourCountry?: string | null;
  tourRegion?: string | null;
  tourCity?: string | null;
  tourType?: string | null;
  /** Một tour có thể thuộc nhiều loại (Cao cấp + Độc lạ…); dùng cho lọc theo ô loại tour. */
  tourTypes?: string[];
  /** Chỉ có ở API /tours/popular; các API khác trả undefined */
  bookingCount?: number;
  schedules?: TourSchedule[];
  departures?: Departure[];
}

export interface TourSchedule {
  id: string;
  tourId: string;
  dayNumber: number;
  title: string;
  morning?: string | null;
  noon?: string | null;
  afternoon?: string | null;
  evening?: string | null;
  night?: string | null;
  meals: string[];
}

/**
 * Extended tour fields returned by the API for the tour detail screen.
 * Detail fields are optional so the UI degrades gracefully when the backend
 * has not populated them yet (see {@link normalizeTourDetail}).
 */
export interface TourDetail extends TourItem {
  code?: string;
  description?: string;
  departureFrom?: string;
  departureDates?: string[];
  transport?: string;
  highlights?: string[];
  included?: string[];
  notIncluded?: string[];
  notes?: string | null;
  schedules?: TourSchedule[];
  singleRoomSupplement?: number;
  /**
   * Lịch trình dạng HTML thô/ngày — chỉ có ở tour nguồn Laravel (field `plans[]`
   * của `/api/tour/item`, xem docs/laravel-tour-api-samples.md bên app RN). Không
   * tương thích cấu trúc sáng/trưa/chiều/tối của {@link TourSchedule} nên tách
   * field riêng — render theo field nào có dữ liệu.
   */
  htmlPlans?: TourPlanLaravel[];
  /** Điều khoản/lưu ý dạng HTML thô — chỉ có ở tour nguồn Laravel. */
  htmlTerms?: TourTermsLaravel;
  /** "Giá tour bao gồm" dạng HTML thô — tách khỏi htmlTerms, dùng cho card riêng. */
  htmlPriceIncluded?: string;
  /** "Giá tour không bao gồm" dạng HTML thô — tách khỏi htmlTerms, dùng cho card riêng. */
  htmlPriceNotIncluded?: string;
  /** "Điểm nổi bật" dạng HTML thô — chỉ có ở tour nguồn Laravel (field `featured_description`). */
  htmlFeaturedDescription?: string;
}

/** 1 ngày trong lịch trình tour Laravel — `content` là HTML thô. */
export interface TourPlanLaravel {
  day: string;
  title: string;
  eats: string[];
  main_vehicles: string[];
  content: string;
}

/**
 * Các khối điều khoản/lưu ý dạng HTML thô của tour Laravel.
 * `priceIncluded`/`priceNotIncluded` nằm ở `TourDetail.htmlPriceIncluded`/`htmlPriceNotIncluded`.
 */
export interface TourTermsLaravel {
  warningNote: string;
  /** Lưu ý riêng cho tour có yêu cầu visa (field `warning_note_visa`) — rỗng nếu tour không cần visa. */
  warningNoteVisa: string;
  cancelBooking: string;
  paymentInstructions: string;
  cancelPenalty: string;
}

export interface ListMeta {
  hasNext?: boolean;
  total?: number;
  page?: number;
}

/** Envelope phân trang dùng chung cho /newest, /hot, /popular, /by-type. */
export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginatedMeta;
}

/** Tham số cho GET /tours/by-type (tất cả độc lập, không bắt buộc). */
export interface TourTypeQuery {
  country?: string;
  region?: string;
  city?: string;
  tourType?: string;
  page?: number;
  limit?: number;
}

export function getTours(page: number, limit: number) {
  return apiService.get(urls.URL_GetTours + `page=${page}&limit=${limit}`);
}

export function getTourById(id: string) {
  return apiService.get(urls.URL_GetTourById + id);
}

/** Tour mới nhất theo createdAt giảm dần. */
export function getNewestTours(page = 1, limit = 10) {
  return apiService.get(urls.URL_GetNewestTours, { page, limit });
}

/** Tour rating cao nhất ("đang hot"). */
export function getHotTours(page = 1, limit = 10) {
  return apiService.get(urls.URL_GetHotTours, { page, limit });
}

/** Tour nhiều booking nhất ("bán chạy"). Trả thêm bookingCount. */
export function getPopularTours(page = 1, limit = 10) {
  return apiService.get(urls.URL_GetPopularTours, { page, limit });
}

/**
 * Lọc tour theo loại hình. `country`/`region` khớp chính xác, `city` là
 * tìm-chứa-chuỗi không phân biệt hoa thường. Tham số undefined được bỏ qua.
 * @deprecated Đang migrate sang Laravel — xem {@link getTourCategories} / {@link getToursByCategory}.
 */
export function getToursByType(params: TourTypeQuery) {
  const { page = 1, limit = 10, ...rest } = params;
  return apiService.get(urls.URL_GetToursByType, { ...rest, page, limit });
}

// ==================== TOUR APIs (Laravel) ====================

/** 1 thể loại tour trả về từ Laravel — trộn lẫn loại tour, vùng miền, tỉnh/quốc gia trong 1 danh sách phẳng. */
export interface TourCategoryLaravel {
  hash: number;
  name: string;
}

/** 1 tour rút gọn trong danh sách theo category (Laravel). */
export interface TourItemLaravel {
  id: string;
  code: string;
  name: string;
  image: string;
  departure_place: string;
  destination_place: string;
  days: number;
  nights: number;
  departure_date: string;
  destination_date: string;
  price: number;
  is_available: boolean;
}

export interface TourCategoryListMetaLaravel {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface TourCategoryListResponseLaravel {
  data: TourItemLaravel[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: TourCategoryListMetaLaravel;
  error: boolean;
  message: string | null;
}

/** Danh sách toàn bộ thể loại tour (loại + vùng miền + tỉnh/quốc gia), không phân trang. */
export function getTourCategories() {
  return apiServiceLaravel.get<{
    error: boolean;
    data: TourCategoryLaravel[];
    message: string | null;
  }>(urls.URL_GetTourCategories);
}

/**
 * Danh sách tour thuộc 1 category_id (hash), có phân trang chuẩn Laravel.
 * Một tour có thể thuộc nhiều category_id cùng lúc — đây không phải cây cha-con.
 */
export function getToursByCategory(categoryId: number, page = 1) {
  return apiServiceLaravel.get<TourCategoryListResponseLaravel>(
    urls.URL_GetToursByCategory,
    { category_id: categoryId, page },
  );
}

function normalizeCategoryName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .trim();
}

// Module-level cache — tránh gọi lại /api/tour/categories mỗi lần cần resolve hash.
let categoryNameToHashCache: Map<string, number> | null = null;
let categoryFetchPromise: Promise<Map<string, number>> | null = null;

/**
 * Trả về map "tên đã normalize" -> hash, fetch 1 lần và cache ở module-level.
 * Dùng để chuyển tên hiển thị hiện có sang category_id thật của Laravel mà
 * không cần hardcode — nếu Laravel đổi hash, map vẫn đúng.
 */
async function getCategoryNameToHashMap(): Promise<Map<string, number>> {
  if (categoryNameToHashCache) return categoryNameToHashCache;
  if (!categoryFetchPromise) {
    categoryFetchPromise = getTourCategories().then((res) => {
      const list = res.data?.data ?? [];
      const map = new Map<string, number>();
      for (const item of list) {
        map.set(normalizeCategoryName(item.name), item.hash);
      }
      categoryNameToHashCache = map;
      return map;
    });
  }
  return categoryFetchPromise;
}

/** Resolve tên hiển thị sang category_id (hash) của Laravel. */
export async function resolveCategoryHashByName(name: string): Promise<number | null> {
  const map = await getCategoryNameToHashMap();
  return map.get(normalizeCategoryName(name)) ?? null;
}

/**
 * Map 1 tour rút gọn từ Laravel sang {@link TourItem} để UI (TourCard, search results...)
 * không cần đổi gì. Laravel không trả `rating`/`reviewsCount` ở endpoint category —
 * để 0 và UI tự fallback (không hiện sao). `departures` chỉ có đúng 1 phần tử vì
 * endpoint category không trả `tour_days[]`, chỉ có ở `/api/tour/item`.
 */
function mapTourItemLaravelToTourItem(item: TourItemLaravel): TourItem {
  return {
    id: item.id,
    name: item.name,
    imageUrl: [item.image],
    imagePublicId: [],
    duration: `${item.days} ngày ${item.nights} đêm`,
    rating: 0,
    reviewsCount: 0,
    hasVat: false,
    departures: [
      {
        id: item.id,
        tourId: item.id,
        departureDate: item.departure_date,
        price: item.price,
        availableSeats: item.is_available ? 1 : 0,
      },
    ],
  };
}

/**
 * Danh sách tour theo category (Laravel), đã map sang {@link TourItem}.
 * Trả kèm meta phân trang gốc của Laravel.
 */
export async function getToursByCategoryMapped(categoryId: number, page = 1) {
  const res = await getToursByCategory(categoryId, page);
  const items = (res.data?.data ?? []).map(mapTourItemLaravelToTourItem);
  return { items, meta: res.data?.meta ?? null };
}

/**
 * Tour hot (Laravel) — KHÔNG phân trang, trả cố định 1 mảng ngắn. Dùng cho
 * Featured Carousel trên Home.
 */
export function getTourHot() {
  return apiServiceLaravel.get<{
    data: TourItemLaravel[];
    error: boolean;
    message: string | null;
  }>(urls.URL_GetTourHot);
}

/** Tour hot (Laravel), đã map sang {@link TourItem}. */
export async function getTourHotMapped() {
  const res = await getTourHot();
  return (res.data?.data ?? []).map(mapTourItemLaravelToTourItem);
}

/** Tour sắp khởi hành (Laravel) — CÓ phân trang chuẩn Laravel (`links`/`meta`). */
export function getTourList(page = 1) {
  return apiServiceLaravel.get<TourCategoryListResponseLaravel>(
    urls.URL_GetTourList,
    { page },
  );
}

/** Tour sắp khởi hành (Laravel), đã map sang {@link TourItem}. Trả kèm meta phân trang gốc. */
export async function getTourListMapped(page = 1) {
  const res = await getTourList(page);
  const items = (res.data?.data ?? []).map(mapTourItemLaravelToTourItem);
  return { items, meta: res.data?.meta ?? null };
}

/** 1 đợt khởi hành trong `tour_days[]`. */
export interface TourDayLaravel {
  id: string;
  code: string;
  departure_place: string;
  destination_place: string;
  departure_date: string;
  destination_date: string;
  stock_qty: number;
  price: number;
}

/** Response đầy đủ của GET /api/tour/item — xem docs/laravel-tour-api-samples.md bên app RN. */
export interface TourItemDetailLaravel {
  id: string;
  code: string;
  name: string;
  image: string;
  images: string[];
  departure_place: string;
  destination_place: string;
  days: number;
  nights: number;
  departure_date: string;
  destination_date: string;
  stock_qty: number;
  price: number;
  is_available: boolean;
  tour_days: TourDayLaravel[];
  plans: TourPlanLaravel[];
  tour_price_included: string;
  tour_price_not_included: string;
  warning_note: string;
  cancel_booking: string;
  tuts_booking_payment: string;
  punishment_cancel_booking: string;
  warning_note_visa: string;
  featured_description: string;
}

/** Chi tiết 1 tour theo tour_key (Laravel). */
export function getTourItem(tourKey: string) {
  return apiServiceLaravel.get<{
    data: TourItemDetailLaravel;
    error: boolean;
    message: string | null;
  }>(urls.URL_GetTourItem, { tour_key: tourKey });
}

/**
 * Map `tour_days[]` (nhiều đợt khởi hành thật) sang {@link Departure}[]. Luôn gộp
 * thêm đợt top-level (`departure_date`/`code`/`price`/`stock_qty`) nếu nó chưa có
 * mặt trong `tour_days[]` — dữ liệu Laravel thực tế cho thấy 2 nguồn này có thể lệch
 * nhau, nên bỏ qua đợt top-level sẽ làm mất 1 lựa chọn ngày hợp lệ.
 */
function mapTourDaysToDepartures(detail: TourItemDetailLaravel): Departure[] {
  const fromTourDays: Departure[] = (detail.tour_days ?? []).map((d) => ({
    id: d.id,
    tourId: detail.id,
    departureDate: d.departure_date,
    price: d.price,
    availableSeats: d.stock_qty,
    code: d.code,
    returnDate: d.destination_date,
  }));

  const hasTopLevelDate = fromTourDays.some(
    (d) => d.departureDate === detail.departure_date,
  );

  if (!detail.departure_date || hasTopLevelDate) {
    return fromTourDays;
  }

  const topLevel: Departure = {
    id: detail.id,
    tourId: detail.id,
    departureDate: detail.departure_date,
    price: detail.price,
    availableSeats: detail.stock_qty,
    code: detail.code,
    returnDate: detail.destination_date,
  };

  return [topLevel, ...fromTourDays].sort(
    (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime(),
  );
}

/** Map response chi tiết Laravel sang {@link TourDetail} — UI dùng chung interface. */
function mapTourItemDetailLaravelToTourDetail(detail: TourItemDetailLaravel): TourDetail {
  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    imageUrl: detail.images?.length ? detail.images : [detail.image],
    imagePublicId: [],
    duration: `${detail.days} ngày ${detail.nights} đêm`,
    rating: 0,
    reviewsCount: 0,
    // Laravel không trả field has_vat riêng — suy ra từ việc "Dịch vụ bao gồm"
    // có nhắc tới VAT hay không (dòng đó được chuẩn hoá thành "Bao gồm VAT" ở
    // card Dịch vụ tour trong pages/tour-detail).
    hasVat: /vat/i.test(detail.tour_price_included ?? ""),
    departureFrom: detail.departure_place,
    departures: mapTourDaysToDepartures(detail),
    htmlPlans: detail.plans,
    htmlTerms: {
      warningNote: detail.warning_note,
      warningNoteVisa: detail.warning_note_visa,
      cancelBooking: detail.cancel_booking,
      paymentInstructions: detail.tuts_booking_payment,
      cancelPenalty: detail.punishment_cancel_booking,
    },
    htmlPriceIncluded: detail.tour_price_included,
    htmlPriceNotIncluded: detail.tour_price_not_included,
    htmlFeaturedDescription: detail.featured_description,
  };
}

/** Chi tiết tour (Laravel), đã map sang {@link TourDetail} để dùng chung UI với luồng NestJS. */
export async function getTourItemMapped(tourKey: string): Promise<TourDetail> {
  const res = await getTourItem(tourKey);
  return mapTourItemDetailLaravelToTourDetail(res.data.data);
}

/**
 * Tách HTML thô dạng `<ul><li>...</li></ul>` thành mảng HTML của từng `<li>` cấp
 * ngoài cùng, dùng để gắn icon tick/dấu (PriceIncludedCard) thay vì render 1 khối
 * HTML liền. Đếm độ sâu thẻ `<li>` để KHÔNG tách vỡ `<ul><li>` lồng bên trong 1 item.
 */
export function splitTopLevelListItems(html: string): string[] {
  const outerMatch = html.match(/^\s*<ul[^>]*>([\s\S]*)<\/ul>\s*$/i);
  const inner = outerMatch ? outerMatch[1] : html;

  const items: string[] = [];
  const tagRe = /<li[^>]*>|<\/li>/gi;
  let depth = 0;
  let itemStart = -1;
  let match: RegExpExecArray | null;
  while ((match = tagRe.exec(inner))) {
    const isOpenTag = match[0].toLowerCase().startsWith("<li");
    if (isOpenTag) {
      if (depth === 0) itemStart = tagRe.lastIndex;
      depth++;
    } else {
      depth--;
      if (depth === 0 && itemStart !== -1) {
        items.push(inner.substring(itemStart, match.index).trim());
        itemStart = -1;
      }
    }
  }
  return items;
}

const DEFAULT_NOTES =
  "Giá tour có thể thay đổi vào dịp Lễ, Tết. Quý khách lẻ ghép đoàn, vui lòng liên hệ tổng đài để được tư vấn phụ thu phòng đơn.";

/**
 * Map a raw tour object into a fully-populated {@link TourDetail}, filling the
 * always-present fields (departure, transport, notes) with sensible defaults
 * and leaving genuinely tour-specific sections (itinerary, highlights)
 * undefined when absent so they can be hidden.
 */
export function normalizeTourDetail(
  raw: Partial<TourDetail> & TourItem,
): TourDetail {
  return {
    ...raw,
    departureFrom: raw.departureFrom || "TP. Hồ Chí Minh",
    transport: raw.transport || "Máy bay & xe du lịch",
    notes: raw.notes || DEFAULT_NOTES,
    highlights: raw.highlights?.length ? raw.highlights : undefined,
    schedules: raw.schedules?.length ? raw.schedules : undefined,
  };
}
