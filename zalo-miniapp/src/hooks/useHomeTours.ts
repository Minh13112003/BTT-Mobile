import {
  getTourHotMapped,
  getTourListMapped,
  TourItem,
} from "@/services/tour";
import { useCallback, useEffect, useState } from "react";

/**
 * `hot` = Tour hot (Laravel `/api/tour/hot`, carousel).
 * `upcoming` = Tour sắp khởi hành (Laravel `/api/tour/list` trang 1).
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
    cachedSections = next;
    setSections(next);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
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
