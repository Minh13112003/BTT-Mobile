import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  imageUrl: string;
  date: string;
  category: "COMPANY" | "PROMOTION" | "DESTINATION" | "OTHER";
  isPublished?: boolean;
  publishedAt?: string;
}

export interface NewsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface NewsListResponse {
  items: NewsItem[];
  meta: NewsMeta;
}

function mapNewsItem(raw: any): NewsItem {
  return {
    id: raw.id,
    slug: raw.slug ?? raw.id,
    title: raw.title,
    excerpt: raw.excerpt ?? "",
    content: raw.content,
    imageUrl: raw.imageUrl,
    date: raw.publishedAt
      ? new Date(raw.publishedAt).toLocaleDateString("vi-VN")
      : raw.date ?? "",
    category: raw.category ?? "OTHER",
    isPublished: raw.isPublished,
    publishedAt: raw.publishedAt,
  };
}

/** Lấy danh sách tin tức (paginated) — dùng trên màn hình News list */
export const getNewsList = async (params?: {
  category?: string;
  page?: number;
  limit?: number;
}): Promise<NewsListResponse> => {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all")
    query.set("category", params.category.toUpperCase());
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));

  const url = `${urls.URL_GetNews}?${query.toString()}`;
  const res = await apiService.get(url);
  const data = res?.data?.data ?? res?.data ?? { items: [], meta: {} };

  return {
    items: (data.items ?? []).map(mapNewsItem),
    meta: data.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0, hasNext: false, hasPrevious: false },
  };
};

/** Lấy tối đa 5 tin tức mới nhất cho carousel trang chủ */
export const getNews = async (): Promise<{ data: NewsItem[] }> => {
  try {
    const res = await getNewsList({ limit: 5 });
    return { data: res.items };
  } catch {
    return { data: [] };
  }
};

/** Lấy chi tiết một bài tin tức theo id */
export const getNewsById = async (id: string): Promise<{ data: NewsItem | null }> => {
  try {
    const res = await apiService.get(`${urls.URL_GetNewsById}${id}`);
    const raw = res?.data?.data ?? res?.data;
    return { data: raw ? mapNewsItem(raw) : null };
  } catch {
    return { data: null };
  }
};
