import { getTourItemMapped, normalizeTourDetail, TourDetail } from "@/services/tour";
import { useCallback, useEffect, useRef, useState } from "react";

interface TourDetailState {
  tour: TourDetail | null;
  loading: boolean;
  error: string | null;
}

/**
 * Load a single tour by id and expose a normalized {@link TourDetail}.
 * `fallback` carries the basic fields already known from the list screen —
 * only used to keep the screen usable if the detail endpoint fails.
 */
export function useTourDetail(id?: string, fallback?: TourDetail | null) {
  const [state, setState] = useState<TourDetailState>({
    tour: null,
    loading: true,
    error: null,
  });

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

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await getTourItemMapped(id);
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
