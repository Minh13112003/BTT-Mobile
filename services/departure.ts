// services/departure.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

/**
 * A single departure (đợt khởi hành) for a tour. Returned by
 * `GET /api/v1/departures/tour/:tourId`.
 */
export interface Departure {
  id: string;
  tourId: string;
  departureDate: string; // ISO date string
  price: number;
  availableSeats: number;
  totalSeats?: number;
}

/** Raw list of departures for a tour (unsorted, may include past dates). */
export function getDeparturesByTour(tourId: string) {
  return apiService.get(urls.URL_GetDeparturesByTour + tourId);
}

export function getDepartureById(id: string) {
  return apiService.get(urls.URL_GetDepartureById + id);
}

/** Normalize whichever response envelope the backend uses into an array. */
export function extractDepartures(res: any): Departure[] {
  const data = res?.data?.data ?? res?.data?.items ?? res?.data;
  return Array.isArray(data) ? data : [];
}

/** Departures from today onward, sorted by date ascending. */
export function sortUpcoming(departures: Departure[]): Departure[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return departures
    .filter((d) => new Date(d.departureDate) >= today)
    .sort(
      (a, b) =>
        new Date(a.departureDate).getTime() -
        new Date(b.departureDate).getTime(),
    );
}

/**
 * Fetch the nearest upcoming departure for a tour, or `null` if none.
 * Failures resolve to `null` so list cards degrade gracefully.
 */
export async function getNearestDeparture(
  tourId: string,
): Promise<Departure | null> {
  try {
    const res = await getDeparturesByTour(tourId);
    const upcoming = sortUpcoming(extractDepartures(res));
    return upcoming[0] ?? null;
  } catch (error) {
    console.error("Lỗi tải ngày khởi hành gần nhất:", error);
    return null;
  }
}
