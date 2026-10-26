// services/booking.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export type PaymentMethod = "AT_OFFICE" | "BANK_TRANSFER";

interface Booking {
  // NestJS-sourced booking (luồng cũ). Optional vì booking nguồn Laravel không dùng.
  idTour?: string;
  departureId?: string;
  adults: number;
  children?: number;
  infants?: number;
  paymentMethod: PaymentMethod;
  voucherCode?: string | null;
  notice?: string | null;

  // ===== DEMO — booking từ nguồn Laravel (benthanhtourist.com) =====
  // Khi có tourKey, backend NestJS gọi /api/tour/item lấy snapshot & bỏ qua idTour/departureId.
  // Xem .claude/rules/laravel-migration.md bên app RN.
  tourKey?: string;
  departureKey?: string;
  departureDate?: string;
  unitPrice?: number;
}

export const getDashboardOverview = async (): Promise<{ data: any }> => {
  const response = await apiService.get(urls.URL_DashboardOverview);
  return { data: response.data };
};

export function getTransactionHistory(page: number, limit: number) {
  return apiService.get(urls.URL_TransactionHistory + `page=${page}&limit=${limit}`);
}

export function getBookingById(id: string) {
  return apiService.get(urls.URL_GetBookingById + id);
}

export function booking(bookingData: Booking) {
  return apiService.post(urls.URL_Booking, bookingData);
}

export interface LaravelSeats {
  stockQty: number | null;
  bookedSeats: number;
  /** null = Laravel không trả số chỗ (không giới hạn). */
  availableSeats: number | null;
}

/** Port từ services/booking.ts bên RN — số chỗ thật còn đặt được của 1 đợt nguồn Laravel. */
export async function getLaravelSeats(tourKey: string, departureKey: string): Promise<LaravelSeats> {
  const res = await apiService.get<LaravelSeats>(urls.URL_LaravelSeats, { tourKey, departureKey });
  return res.data;
}

export type { Booking };
