// services/relative.ts — Thân nhân (danh bạ người đi cùng), backend NestJS.
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";
import type { GuestPayload } from "@/utils/guest";

export const MAX_RELATIVES = 20;

export interface Relative {
  id: string;
  fullName: string;
  /** YYYY-MM-DD */
  dateOfBirth: string;
  nationalId?: string | null;
  phone?: string | null;
  passportNumber?: string | null;
  visaNumber?: string | null;
}

export function getRelatives() {
  return apiService.get<Relative[]>(urls.URL_Relatives);
}

export function createRelative(payload: GuestPayload) {
  return apiService.post<Relative>(urls.URL_Relatives, payload);
}

export function updateRelative(id: string, payload: GuestPayload) {
  return apiService.patch<Relative>(`${urls.URL_Relatives}/${id}`, payload);
}

export function deleteRelative(id: string) {
  return apiService.delete<{ success: boolean }>(`${urls.URL_Relatives}/${id}`);
}
