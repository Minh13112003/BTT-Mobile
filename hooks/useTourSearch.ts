import { getTours, TourItem } from "@/services/tour";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "./useDebounce";

const LIMIT = 10;

export interface TourFilter {
  key: string;
  label: string;
  match: (tour: TourItem) => boolean;
}

/** Parse the leading day count out of a duration string e.g. "6 Ngày 5 Đêm" -> 6. */
function parseDays(duration: string): number {
  const match = duration?.match(/(\d+)\s*ng/i);
  return match ? parseInt(match[1], 10) : 0;
}

export const TOUR_FILTERS: TourFilter[] = [
  { key: "all", label: "Tất cả", match: () => true },
  { key: "short", label: "≤ 3 ngày", match: (t) => parseDays(t.duration) > 0 && parseDays(t.duration) <= 3 },
  { key: "long", label: "4 ngày trở lên", match: (t) => parseDays(t.duration) >= 4 },
  { key: "budget", label: "Dưới 7 triệu", match: (t) => t.price < 7_000_000 },
  { key: "premium", label: "Cao cấp", match: (t) => t.price >= 10_000_000 },
];

type FetchMode = "init" | "refresh" | "more";

/**
 * Server list + client-side search/filter for the search screen.
 * Text search is debounced; filters and query compose over the loaded tours.
 */
export function useTourSearch() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  const fetchTours = useCallback(async (pageNumber: number, mode: FetchMode) => {
    try {
      const res = await getTours(pageNumber, LIMIT);
      const items: TourItem[] = Array.isArray(res?.data?.items) ? res.data.items : [];
      const meta = res?.data?.meta;
      setTours((prev) => (mode === "more" ? [...prev, ...items] : items));
      setHasNext(meta?.hasNext ?? false);
    } catch (err) {
      console.error("Lỗi khi tải danh sách tour:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchTours(1, "init");
  }, [fetchTours]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchTours(1, "refresh");
  }, [fetchTours]);

  const loadMore = useCallback(() => {
    if (!hasNext || loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    setPage(next);
    fetchTours(next, "more");
  }, [hasNext, loadingMore, page, fetchTours]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    const filter = TOUR_FILTERS.find((f) => f.key === activeFilter) ?? TOUR_FILTERS[0];
    return tours.filter(
      (t) => (q ? t.name.toLowerCase().includes(q) : true) && filter.match(t),
    );
  }, [tours, debouncedQuery, activeFilter]);

  return {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    filters: TOUR_FILTERS,
    results,
    totalLoaded: tours.length,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    onRefresh,
    loadMore,
  };
}
