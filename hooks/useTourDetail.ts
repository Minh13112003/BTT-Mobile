import {
  // getTourById, // NestJS — comment lại, Tour Detail đã chuyển sang Laravel (xem .claude/rules/laravel-migration.md)
  getTourItemMapped,
  normalizeTourDetail,
  TourDetail
} from "@/services/tour";
import { useCallback, useEffect, useRef, useState } from "react";

interface TourDetailState {
  tour: TourDetail | null;
  loading: boolean;
  error: string | null;
}

/**
 * Load a single tour by id and expose a normalized {@link TourDetail}.
 *
 * `fallback` carries the basic fields already known from the list screen.
 * It is only used to keep the screen usable if the detail endpoint fails —
 * the screen always waits (full loading state) for the real API response
 * before rendering, since the Laravel detail endpoint can take several
 * seconds and rendering the fallback early left schedule/terms/departures
 * blank in the meantime.
 */
export function useTourDetail(id?: string, fallback?: TourDetail | null) {
  const [state, setState] = useState<TourDetailState>({
    tour: null,
    loading: true,
    error: null,
  });

  // Keep the latest fallback without forcing a refetch when params change identity.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const fetchTour = useCallback(async () => {
    const fb = fallbackRef.current;

    if (!id) {
      if (fb?.id) {
        setState({
          tour: normalizeTourDetail(fb),
          loading: false,
          error: null,
        });
      } else {
        setState({
          tour: null,
          loading: false,
          error: "Không tìm thấy mã tour",
        });
      }
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // NestJS (comment lại — Tour Detail đã chuyển sang Laravel):
      // const res = await getTourById(id);
      // const data = res?.data?.data ?? res?.data?.item ?? res?.data;
      const data = await getTourItemMapped(id);
      if (data?.id) {
        setState({
          tour: normalizeTourDetail(data),
          loading: false,
          error: null,
        });
      } else if (fb?.id) {
        setState({
          tour: normalizeTourDetail(fb),
          loading: false,
          error: null,
        });
      } else {
        setState({
          tour: null,
          loading: false,
          error: "Không tìm thấy thông tin tour",
        });
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết tour:", err);
      if (fb?.id) {
        setState({
          tour: normalizeTourDetail(fb),
          loading: false,
          error: null,
        });
      } else {
        setState({
          tour: null,
          loading: false,
          error: "Không thể kết nối máy chủ. Vui lòng thử lại sau.",
        });
      }
    }
  }, [id]);

  useEffect(() => {
    fetchTour();
  }, [fetchTour]);

  return { ...state, refetch: fetchTour };
}
