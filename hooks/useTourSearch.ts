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

function cleanText(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .trim();
}

export interface UseTourSearchInit {
  mode?: SearchMode;
  region?: string | null;
  query?: string;
  dateMode?: string;
  specificDate?: string;
  startDate?: string;
  endDate?: string;
}

interface FetchResult {
  items: TourItem[];
  meta: PaginatedMeta | null;
}

export function useTourSearch(init?: UseTourSearchInit) {
  const [mode, setModeState] = useState<SearchMode>(init?.mode ?? "newest");
  const [region, setRegion] = useState<string | null>(init?.region ?? null);
  const [query, setQuery] = useState(init?.query ?? "");

  const [dateMode, setDateMode] = useState<string | undefined>(init?.dateMode);
  const [specificDate, setSpecificDate] = useState<string | undefined>(init?.specificDate);
  const [startDate, setStartDate] = useState<string | undefined>(init?.startDate);
  const [endDate, setEndDate] = useState<string | undefined>(init?.endDate);

  const [results, setResults] = useState<TourItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const debouncedQuery = useDebounce(query, 500);

  // Sync state values when initial parameters change
  useEffect(() => {
    if (init?.query !== undefined) setQuery(init.query);
    if (init?.mode !== undefined) setModeState(init.mode);
    if (init?.dateMode !== undefined) setDateMode(init.dateMode);
    if (init?.specificDate !== undefined) setSpecificDate(init.specificDate);
    if (init?.startDate !== undefined) setStartDate(init.startDate);
    if (init?.endDate !== undefined) setEndDate(init.endDate);
  }, [
    init?.query,
    init?.mode,
    init?.dateMode,
    init?.specificDate,
    init?.startDate,
    init?.endDate,
  ]);

  // Setting the mode always resets the region sub-filter to "Tất cả".
  const setMode = useCallback((next: SearchMode) => {
    setModeState(next);
    setRegion(null);
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number): Promise<FetchResult> => {
      const city = debouncedQuery.trim();
      let res: any;
      let items: TourItem[] = [];
      let paginatedMeta: PaginatedMeta | null = null;

      const hasDateFilter =
        dateMode === "specific"
          ? !!specificDate
          : dateMode === "range" && (!!startDate || !!endDate);

      if (hasDateFilter) {
        // Fetch a larger page size of tours to perform client-side filtering
        const allRes = await getNewestTours(1, 100);
        const allItems: TourItem[] = Array.isArray(allRes?.data?.items)
          ? allRes.data.items
          : [];

        let filtered = allItems;

        // 1. Text filter by query (city / name)
        if (city) {
          const cleanedCity = cleanText(city);
          filtered = filtered.filter(
            (item) =>
              cleanText(item.name).includes(cleanedCity) ||
              (item.tourCity &&
                cleanText(item.tourCity).includes(cleanedCity)),
          );
        }

        // 2. Date filter
        let filteredByDate: TourItem[] = [];
        if (dateMode === "specific" && specificDate) {
          const target = new Date(specificDate);
          filteredByDate = filtered.filter((item) =>
            item.departures?.some((dep) => {
              const depDate = new Date(dep.departureDate);
              return (
                depDate.getFullYear() === target.getFullYear() &&
                depDate.getMonth() === target.getMonth() &&
                depDate.getDate() === target.getDate()
              );
            }),
          );
        } else if (dateMode === "range" && (startDate || endDate)) {
          const start = startDate ? new Date(startDate) : new Date(0);
          const end = endDate ? new Date(endDate) : new Date(8640000000000000);
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
          filteredByDate = filtered.filter((item) =>
            item.departures?.some((dep) => {
              const depDate = new Date(dep.departureDate);
              return depDate >= start && depDate <= end;
            }),
          );
        }

        items = filteredByDate;
        paginatedMeta = {
          total: items.length,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasNext: false,
          hasPrevious: false,
        };
      } else {
        // Standard search logic
        if (city) {
          res = await getToursByType({ city, page: pageNum, limit: LIMIT });
        } else if (mode === "newest") {
          res = await getNewestTours(pageNum, LIMIT);
        } else if (mode === "hot") {
          res = await getHotTours(pageNum, LIMIT);
        } else if (mode === "popular") {
          res = await getPopularTours(pageNum, LIMIT);
        } else {
          res = await getToursByType({
            country: MODE_COUNTRY[mode],
            region: region ?? undefined,
            page: pageNum,
            limit: LIMIT,
          });
        }
        items = Array.isArray(res?.data?.items) ? res.data.items : [];
        paginatedMeta = res?.data?.meta ?? null;
      }

      return { items, meta: paginatedMeta };
    },
    [mode, region, debouncedQuery, dateMode, specificDate, startDate, endDate],
  );

  // Reset + reload whenever the query descriptor changes.
  const reqId = useRef(0);
  useEffect(() => {
    const id = ++reqId.current;
    setLoading(true);
    setPage(1);
    fetchPage(1)
      .then((r) => {
        if (id !== reqId.current) return;
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

  const resetSearch = useCallback(() => {
    setQuery("");
    setModeState("newest");
    setRegion(null);
    setDateMode(undefined);
    setSpecificDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
  }, []);

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
    resetSearch,
  };
}

