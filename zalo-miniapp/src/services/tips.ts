import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface TravelTip {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  destination: string;
  tags: string[];
  date: string;
  relatedSearchQuery?: string;
}

export interface TipsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TipsListResponse {
  items: TravelTip[];
  meta: TipsMeta;
}

/** Constant dùng khi API chưa trả về destinations */
export const TIPS_DESTINATIONS = [
  "Tất cả",
  "Nhật Bản",
  "Hàn Quốc",
  "Trung Quốc",
  "Thái Lan",
  "Singapore",
  "Phú Quốc",
];

function mapTip(raw: any): TravelTip {
  return {
    id: raw.id,
    title: raw.title,
    excerpt: raw.excerpt ?? "",
    content: raw.content ?? "",
    imageUrl: raw.imageUrl,
    destination: raw.destination,
    tags: raw.tags ?? [],
    date: raw.publishedAt
      ? new Date(raw.publishedAt).toLocaleDateString("vi-VN")
      : raw.date ?? "",
    relatedSearchQuery: raw.relatedSearchQuery || undefined,
  };
}

/** Lấy danh sách mẹo du lịch (paginated, filter by destination) */
export const getTips = async (destination?: string, page = 1, limit = 10): Promise<{ data: TravelTip[] }> => {
  try {
    const query = new URLSearchParams();
    if (destination && destination !== "Tất cả") query.set("destination", destination);
    query.set("page", String(page));
    query.set("limit", String(limit));

    const url = `${urls.URL_GetTravelTips}?${query.toString()}`;
    const res = await apiService.get(url);
    const data = res?.data?.data ?? res?.data ?? { items: [] };
    return { data: (data.items ?? []).map(mapTip) };
  } catch {
    return { data: [] };
  }
};

/** Lấy chi tiết một mẹo theo id */
export const getTipById = async (id: string): Promise<{ data: TravelTip | null }> => {
  try {
    const res = await apiService.get(`${urls.URL_GetTravelTipById}${id}`);
    const raw = res?.data?.data ?? res?.data;
    return { data: raw ? mapTip(raw) : null };
  } catch {
    return { data: null };
  }
};

/** Lấy danh sách các điểm đến có tip từ API */
export const getTipDestinations = async (): Promise<string[]> => {
  try {
    const res = await apiService.get(urls.URL_GetTravelTipDestinations);
    const list: string[] = res?.data?.data ?? res?.data ?? [];
    return ["Tất cả", ...list];
  } catch {
    return TIPS_DESTINATIONS;
  }
};
