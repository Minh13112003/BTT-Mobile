// services/favorite.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface FavoriteItem {
  id: string;
  tourKey: string;
  tourName: string;
  tourImage?: string | null;
  durationText?: string | null;
  unitPrice?: number | null;
  departureDate?: string | null;
  createdAt: string;
}

export interface AddFavoritePayload {
  tourKey: string;
  tourName: string;
  tourImage?: string;
  durationText?: string;
  unitPrice?: number;
  departureDate?: string;
}

export function getMyFavorites() {
  return apiService.get<FavoriteItem[]>(urls.URL_GetMyFavorites);
}

export function isFavorited(tourKey: string) {
  return apiService.get<{ isFavorited: boolean }>(urls.URL_IsFavorited + tourKey);
}

export function addFavorite(payload: AddFavoritePayload) {
  return apiService.post<FavoriteItem>(urls.URL_AddFavorite, payload);
}

export function removeFavorite(tourKey: string) {
  return apiService.delete<{ success: boolean }>(urls.URL_RemoveFavorite + tourKey);
}
