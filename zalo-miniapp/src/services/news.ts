import * as urls from "./api/constants";
import { apiServiceLaravel } from "./api/interceptor";

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
  /** Tên category thật từ Laravel (vd "Tin tức hoạt động công ty") — dùng để hiển thị badge thay cho `category` cứng ở trên. */
  categoryName?: string;
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

// ==================== BLOG APIs (Laravel) ====================

/** 3 category cố định do BenThanh Tourist chỉ định — không cần resolve tên→id động như Tour. */
export const BLOG_CATEGORY_COMPANY_NEWS = 46; // "Tin tức hoạt động công ty"
export const BLOG_CATEGORY_TRAVEL_GUIDE = 44; // "Cẩm nang du lịch"
export const BLOG_CATEGORY_TRAVEL_EXPERIENCE = 8; // "Kinh nghiệm du lịch"

export interface BlogCategoryLaravel {
  id: number;
  name: string;
}

/** 1 bài viết rút gọn trong danh sách theo category (Laravel). */
export interface BlogItemLaravel {
  id: number;
  name: string;
  description: string;
  image: string;
  /** Định dạng DD/MM/YYYY — KHÁC định dạng YYYY-MM-DD ở /api/blog/item, không dùng chung 1 hàm parse. */
  created_at: string;
}

export interface BlogCategoryListMetaLaravel {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface BlogCategoryListResponseLaravel {
  data: BlogItemLaravel[];
  links: { first: string; last: string; prev: string | null; next: string | null };
  meta: BlogCategoryListMetaLaravel;
  error: boolean;
  message: string | null;
}

export interface BlogItemDetailLaravel {
  id: number;
  name: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  categories: { id: number; name: string; slug: string; url: string; description: string }[];
  tags: string[];
  /** Định dạng YYYY-MM-DD — KHÁC định dạng DD/MM/YYYY ở /api/blog/category. */
  created_at: string;
  updated_at: string;
}

/** Danh sách toàn bộ thể loại blog. */
export function getBlogCategories() {
  return apiServiceLaravel.get<{
    error: boolean;
    data: BlogCategoryLaravel[];
    message: string | null;
  }>(urls.URL_GetBlogCategories);
}

/** Danh sách bài viết theo category_id, có phân trang chuẩn Laravel (per_page=3 xác nhận thực tế). */
export function getBlogCategory(categoryId: number, page = 1) {
  return apiServiceLaravel.get<BlogCategoryListResponseLaravel>(
    urls.URL_GetBlogCategory,
    { category_id: categoryId, page },
  );
}

/** Chi tiết 1 bài viết theo post_id. */
export function getBlogItem(postId: number | string) {
  return apiServiceLaravel.get<{
    error: boolean;
    data: BlogItemDetailLaravel;
    message: string | null;
  }>(urls.URL_GetBlogItem, { post_id: postId });
}

/** Parse "YYYY-MM-DD" (dạng created_at của /api/blog/item) sang hiển thị DD/MM/YYYY. */
function formatBlogDetailDate(createdAt: string): string {
  const match = createdAt.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return createdAt;
  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

/** `created_at` ở /api/blog/category đã là DD/MM/YYYY — đúng định dạng hiển thị, không cần parse lại. */
function mapBlogItemLaravelToNewsItem(item: BlogItemLaravel): NewsItem {
  return {
    id: String(item.id),
    slug: String(item.id),
    title: item.name,
    excerpt: item.description ?? "",
    imageUrl: item.image,
    date: item.created_at,
    category: "OTHER",
  };
}

/**
 * Danh sách tin tức theo category (Laravel), map sang {@link NewsItem} để dùng chung
 * UI với trang Tin tức hiện có. Trả kèm meta phân trang gốc của Laravel.
 */
export async function getBlogCategoryMapped(categoryId: number, page = 1) {
  const res = await getBlogCategory(categoryId, page);
  const items = (res.data?.data ?? []).map(mapBlogItemLaravelToNewsItem);
  return { items, meta: res.data?.meta ?? null };
}

/**
 * `content` HTML thô của Laravel dùng ảnh path tương đối (vd "/storage/btt-news/...")
 * — cần prefix domain để ảnh không vỡ link khi render. Field `image` top-level đã
 * là full URL nên không cần xử lý.
 */
function prefixRelativeImageSrc(html: string): string {
  return html.replace(
    /(<img[^>]*\ssrc=")\/(?!\/)/g,
    `$1${urls.LARAVEL_API_BASE_URL}/`,
  );
}

/**
 * Chuẩn hoá `<p style="text-align:center;">` (chú thích ảnh của Laravel luôn ở
 * dạng này) sang class `ql-align-center` để CSS trong news/[id] xử lý nhất quán
 * thay vì trông chờ style inline — giữ đúng hành vi port từ bản React Native.
 */
function convertCenterAlignStyleToClass(html: string): string {
  return html.replace(
    /<p style="text-align:\s*center;?">/g,
    '<p class="ql-align-center">',
  );
}

/** Chi tiết 1 bài viết (Laravel), map sang {@link NewsItem}. */
export async function getBlogItemMapped(postId: number | string): Promise<NewsItem | null> {
  const res = await getBlogItem(postId);
  const raw = res.data?.data;
  if (!raw) return null;
  return {
    id: String(raw.id),
    slug: raw.slug,
    title: raw.name,
    excerpt: raw.description ?? "",
    content: convertCenterAlignStyleToClass(prefixRelativeImageSrc(raw.content ?? "")),
    imageUrl: raw.image,
    date: formatBlogDetailDate(raw.created_at),
    category: "OTHER",
    categoryName: raw.categories?.[0]?.name,
  };
}

/** Lấy tối đa 5 bài mới nhất cho mục "Tin tức & cẩm nang" ở trang chủ — mặc định category "Tin tức hoạt động công ty" (Laravel). */
export const getNews = async (
  categoryId: number = BLOG_CATEGORY_COMPANY_NEWS,
): Promise<{ data: NewsItem[] }> => {
  try {
    const { items } = await getBlogCategoryMapped(categoryId, 1);
    return { data: items.slice(0, 5) };
  } catch {
    return { data: [] };
  }
};

/** Lấy chi tiết một bài tin tức theo id (Laravel post_id). */
export const getNewsById = async (id: string): Promise<{ data: NewsItem | null }> => {
  try {
    const data = await getBlogItemMapped(id);
    return { data };
  } catch {
    return { data: null };
  }
};
