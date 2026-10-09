import { Image } from "expo-image";

/**
 * Tải trước ảnh vào cache (memory + disk của expo-image) và CHỜ tối đa
 * `timeoutMs` — để khi list tour hiện ra, ảnh đã có sẵn thay vì hiện thông tin
 * tour trước rồi ảnh mới load sau (ảnh từ benthanhtourist.com thường chậm hơn API).
 *
 * Không bao giờ throw / không bao giờ chặn quá `timeoutMs`: ảnh lỗi hay quá chậm
 * thì bỏ qua, `TourImage` sẽ tự hiện placeholder rồi load tiếp khi render.
 */
export async function prefetchImages(
  urls: (string | null | undefined)[],
  timeoutMs = 2500,
): Promise<void> {
  const valid = urls.filter((u): u is string => typeof u === "string" && u.startsWith("http"));
  if (valid.length === 0) return;

  try {
    await Promise.race([
      Promise.allSettled(valid.map((u) => Image.prefetch(u, "memory-disk"))),
      new Promise<void>((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    // Prefetch chỉ là tối ưu — bỏ qua mọi lỗi.
  }
}

/** Lấy URL ảnh đầu tiên của tour (imageUrl có thể là mảng hoặc chuỗi). */
export function firstTourImage(tour: { imageUrl?: string[] | string }): string | undefined {
  return Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl;
}
