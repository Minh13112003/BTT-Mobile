import {
  getTourById,
  normalizeTourDetail,
  TourDetail,
  TourItem,
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
 * `fallback` carries the basic fields already known from the list screen. When
 * present we render it immediately (no spinner) and refresh from the API in the
 * background, so navigating from the list feels instant and still degrades
 * gracefully if the detail endpoint is slow or unavailable.
 */
export function useTourDetail(id?: string, fallback?: TourItem | null) {
  const [state, setState] = useState<TourDetailState>(() =>
    fallback?.id
      ? { tour: normalizeTourDetail(fallback), loading: false, error: null }
      : { tour: null, loading: true, error: null },
  );

  // Keep the latest fallback without forcing a refetch when params change identity.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const fetchTour = useCallback(async () => {
    const fb = fallbackRef.current;

    if (!id) {
      if (fb?.id) {
        setState({ tour: normalizeTourDetail(fb), loading: false, error: null });
      } else {
        setState({ tour: null, loading: false, error: "Không tìm thấy mã tour" });
      }
      return;
    }

    // Only block with a spinner when there is no fallback content yet.
    if (!fb?.id) setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const res = await getTourById(id);
      const data = res?.data?.data ?? res?.data?.item ?? res?.data;
      if (data?.id) {
        setState({ tour: normalizeTourDetail(data), loading: false, error: null });
      } else if (fb?.id) {
        setState({ tour: normalizeTourDetail(fb), loading: false, error: null });
      } else {
        setState({ tour: null, loading: false, error: "Không tìm thấy thông tin tour" });
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết tour:", err);
      if (fb?.id) {
        setState({ tour: normalizeTourDetail(fb), loading: false, error: null });
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
