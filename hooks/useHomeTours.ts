import { SearchMode } from "@/constants/tourFilters";
import {
  getHotTours,
  getNewestTours,
  getPopularTours,
  TourItem,
} from "@/services/tour";
import { useCallback, useEffect, useState } from "react";

export type HomeSections = Record<
  "newest" | "hot" | "popular",
  TourItem[]
>;

const EMPTY: HomeSections = {
  newest: [],
  hot: [],
  popular: [],
};

// Cache giữ data giữa các lần navigate — tránh load lại khi quay về home
let cachedSections: HomeSections | null = null;

const pickItems = (
  result: PromiseSettledResult<{ data?: { items?: TourItem[] } }>,
): TourItem[] =>
  result.status === "fulfilled" && Array.isArray(result.value?.data?.items)
    ? result.value.data!.items!
    : [];

/**
 * Fetch all five Home sections in parallel. Uses `allSettled` so a single
 * failing endpoint only blanks its own rail instead of the whole screen.
 * Data is cached in module scope so navigating back to home never re-shows
 * the fullscreen loading screen — only the very first load or pull-to-refresh.
 */
export function useHomeTours() {
  const [sections, setSections] = useState<HomeSections>(cachedSections ?? EMPTY);
  const [loading, setLoading] = useState(cachedSections === null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      getNewestTours(1, 6),
      getHotTours(1, 5),
      getPopularTours(1, 5),
    ]);

    const next: HomeSections = {
      newest: pickItems(results[0] as any),
      hot: pickItems(results[1] as any),
      popular: pickItems(results[2] as any),
    };
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
