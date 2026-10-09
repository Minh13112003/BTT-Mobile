import {
  getTourHotMapped,
  getTourListMapped,
  TourItem,
} from "@/services/tour";
import { firstTourImage, prefetchImages } from "@/utils/prefetchImages";
import { useCallback, useEffect, useState } from "react";

/**
 * `hot` = Tour hot (Laravel `/api/tour/hot`, carousel).
 * `upcoming` = Tour sắp khởi hành (Laravel `/api/tour/list` trang 1, thay cho
 * "Tour mới nhất" NestJS trước đây — xem .claude/rules/laravel-migration.md).
 */
export type HomeSections = Record<"hot" | "upcoming", TourItem[]>;

const EMPTY: HomeSections = {
  hot: [],
  upcoming: [],
};

// Cache giữ data giữa các lần navigate — tránh load lại khi quay về home
let cachedSections: HomeSections | null = null;

/**
 * Fetch Home sections in parallel. Uses `allSettled` so a single failing
 * endpoint only blanks its own rail instead of the whole screen.
 * Data is cached in module scope so navigating back to home never re-shows
 * the fullscreen loading screen — only the very first load or pull-to-refresh.
 */
export function useHomeTours() {
  const [sections, setSections] = useState<HomeSections>(cachedSections ?? EMPTY);
  const [loading, setLoading] = useState(cachedSections === null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      getTourHotMapped(),
      getTourListMapped(1),
    ]);

    const next: HomeSections = {
      hot: results[0].status === "fulfilled" ? results[0].value : [],
      upcoming: results[1].status === "fulfilled" ? results[1].value.items : [],
    };
    // Chờ ảnh của các tour hiển thị đầu tiên (carousel hot + vài tour sắp khởi hành)
    // tải xong vào cache — tối đa 2,5s — rồi mới hiện danh sách. Nếu không, thông tin
    // tour hiện trước còn ảnh (từ benthanhtourist.com, chậm hơn API) hiện trống một lúc.
    await prefetchImages(
      [...next.hot.slice(0, 4), ...next.upcoming.slice(0, 3)].map(firstTourImage),
    );

    cachedSections = next;
    setSections(next);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    // Nếu đã có cache thì không load lại, chỉ load khi lần đầu tiên
    if (cachedSections === null) {
      load();
    }
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return { sections, loading, refreshing, onRefresh };
}
