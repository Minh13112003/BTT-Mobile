import { SearchMode } from "@/constants/tourFilters";
import {
  getHotTours,
  getNewestTours,
  getPopularTours,
  getToursByType,
  TourItem,
} from "@/services/tour";
import { useCallback, useEffect, useState } from "react";

export type HomeSections = Record<
  "newest" | "hot" | "popular" | "domestic" | "foreign",
  TourItem[]
>;

const EMPTY: HomeSections = {
  newest: [],
  hot: [],
  popular: [],
  domestic: [],
  foreign: [],
};

const pickItems = (
  result: PromiseSettledResult<{ data?: { items?: TourItem[] } }>,
): TourItem[] =>
  result.status === "fulfilled" && Array.isArray(result.value?.data?.items)
    ? result.value.data!.items!
    : [];

/**
 * Fetch all five Home sections in parallel. Uses `allSettled` so a single
 * failing endpoint only blanks its own rail instead of the whole screen.
 */
export function useHomeTours() {
  const [sections, setSections] = useState<HomeSections>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      getNewestTours(1, 6),
      getHotTours(1, 5),
      getPopularTours(1, 5),
      getToursByType({ country: "Trong nước", page: 1, limit: 5 }),
      getToursByType({ country: "Nước ngoài", page: 1, limit: 5 }),
    ]);

    setSections({
      newest: pickItems(results[0] as any),
      hot: pickItems(results[1] as any),
      popular: pickItems(results[2] as any),
      domestic: pickItems(results[3] as any),
      foreign: pickItems(results[4] as any),
    });
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  return { sections, loading, refreshing, onRefresh };
}
