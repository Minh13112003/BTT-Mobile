import { MODE_COUNTRY, SearchMode } from "@/constants/tourFilters";
import {
  getHotTours,
  getNewestTours,
  getPopularTours,
  getToursByType,
  PaginatedMeta,
  TourItem,
} from "@/services/tour";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebounce } from "./useDebounce";

const LIMIT = 5;

export interface UseTourSearchInit {
  mode?: SearchMode;
  region?: string | null;
  query?: string;
}

interface FetchResult {
  items: TourItem[];
  meta: PaginatedMeta | null;
}

/**
 * Server-driven tour search backing the Search screen.
 *
 * Behaviour follows `tour-type-query.md`:
 *  - Non-empty (debounced) `query` => GET /tours/by-type?city=… (contains match),
 *    taking priority over the mode chips.
 *  - Otherwise the active `mode` selects the endpoint; `region` further narrows
 *    the two location modes.
 * Page resets to 1 whenever mode / region / query changes; `loadMore` appends.
 */
export function useTourSearch(init?: UseTourSearchInit) {
  const [mode, setModeState] = useState<SearchMode>(init?.mode ?? "newest");
  const [region, setRegion] = useState<string | null>(init?.region ?? null);
  const [query, setQuery] = useState(init?.query ?? "");

  const [results, setResults] = useState<TourItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Setting the mode always resets the region sub-filter to "Tất cả".
  const setMode = useCallback((next: SearchMode) => {
    setModeState(next);
    setRegion(null);
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number): Promise<FetchResult> => {
      const city = debouncedQuery.trim();
      let res: any;

      if (city) {
        res = await getToursByType({ city, page: pageNum, limit: LIMIT });
      } else if (mode === "newest") {
        res = await getNewestTours(pageNum, LIMIT);
      } else if (mode === "hot") {
        res = await getHotTours(pageNum, LIMIT);
      } else if (mode === "popular") {
        res = await getPopularTours(pageNum, LIMIT);
      } else {
        // domestic | foreign
        res = await getToursByType({
          country: MODE_COUNTRY[mode],
          region: region ?? undefined,
          page: pageNum,
          limit: LIMIT,
        });
      }

      const items: TourItem[] = Array.isArray(res?.data?.items)
        ? res.data.items
        : [];
      return { items, meta: res?.data?.meta ?? null };
    },
    [mode, region, debouncedQuery],
  );

  // Reset + reload whenever the query descriptor changes.
  const reqId = useRef(0);
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setPage(1);
    fetchPage(1)
      .then((r) => {
        if (id !== reqId.current) return; // a newer request superseded this one
        setResults(r.items);
        setMeta(r.meta);
        setHasNext(r.meta?.hasNext ?? false);
      })
      .catch((err) => {
        if (id !== reqId.current) return;
        console.error("Lỗi tìm kiếm tour:", err);
        setResults([]);
        setHasNext(false);
      })
      .finally(() => {
        if (id === reqId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      });
  }, [fetchPage]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Re-run the active query by nudging fetchPage via a fresh request id.
    const id = ++reqId.current;
    setPage(1);
    fetchPage(1)
      .then((r) => {
        if (id !== reqId.current) return;
        setResults(r.items);
        setMeta(r.meta);
        setHasNext(r.meta?.hasNext ?? false);
      })
      .finally(() => {
        if (id === reqId.current) setRefreshing(false);
      });
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasNext || loadingMore || loading) return;
    const next = page + 1;
    setLoadingMore(true);
    fetchPage(next)
      .then((r) => {
        setResults((prev) => [...prev, ...r.items]);
        setMeta(r.meta);
        setHasNext(r.meta?.hasNext ?? false);
        setPage(next);
      })
      .catch((err) => console.error("Lỗi tải thêm tour:", err))
      .finally(() => setLoadingMore(false));
  }, [hasNext, loadingMore, loading, page, fetchPage]);

  return {
    mode,
    setMode,
    region,
    setRegion,
    query,
    setQuery,
    results,
    meta,
    hasNext,
    loading,
    loadingMore,
    refreshing,
    onRefresh,
    loadMore,
  };
}
