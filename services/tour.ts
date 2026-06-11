import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";
import type { Departure } from "./departure";

export interface TourItem {
  id: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  /** @deprecated Backend đã xóa — giá lấy từ departures[].price */
  price?: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  hasVat: boolean;
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
  notes?: string;
  schedules?: TourSchedule[];
  singleRoomSupplement?: number;
}

export interface ListMeta {
  hasNext?: boolean;
  total?: number;
  page?: number;
}

export function getTours(page: number, limit: number) {
  return apiService.get(urls.URL_GetTours + `page=${page}&limit=${limit}`);
}

export function getTourById(id: string) {
  return apiService.get(urls.URL_GetTourById + id);
}

// Generic fallbacks so the "Thông tin chuyến đi" card always renders a complete
// block even when the backend omits the extended fields.
const DEFAULT_INCLUDED = [
  "Vé máy bay khứ hồi (theo chương trình)",
  "Khách sạn tiêu chuẩn & các bữa ăn theo lịch trình",
  "Hướng dẫn viên & xe du lịch suốt tuyến",
  "Vé tham quan các điểm trong chương trình",
  "Bảo hiểm du lịch theo quy định",
];
const DEFAULT_NOT_INCLUDED = [
  "Chi phí cá nhân, ăn uống ngoài chương trình",
  "Tip cho hướng dẫn viên & tài xế",
  "Các dịch vụ không được đề cập trong chương trình",
];
const DEFAULT_NOTES =
  "Giá tour có thể thay đổi vào dịp Lễ, Tết. Quý khách lẻ ghép đoàn, vui lòng liên hệ tổng đài để được tư vấn phụ thu phòng đơn.";

/**
 * Map a raw tour object into a fully-populated {@link TourDetail}, filling the
 * always-present fields (departure, transport, included/notIncluded, notes)
 * with sensible defaults and leaving genuinely tour-specific sections
 * (itinerary, highlights) undefined when absent so they can be hidden.
 */
export function normalizeTourDetail(
  raw: Partial<TourDetail> & TourItem,
): TourDetail {
  return {
    ...raw,
    departureFrom: raw.departureFrom || "TP. Hồ Chí Minh",
    transport: raw.transport || "Máy bay & xe du lịch",
    included: raw.included?.length ? raw.included : DEFAULT_INCLUDED,
    notIncluded: raw.notIncluded?.length
      ? raw.notIncluded
      : DEFAULT_NOT_INCLUDED,
    notes: raw.notes || DEFAULT_NOTES,
    highlights: raw.highlights?.length ? raw.highlights : undefined,
    schedules: raw.schedules?.length ? raw.schedules : undefined,
  };
}
