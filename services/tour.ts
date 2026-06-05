import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface TourItem {
  id: string;
  name: string;
  imageUrl: string;
  imagePublicId: string;
  price: number;
  duration: string;
  rating: number;
  reviewsCount: number;
  hasVat: boolean;
}

export function getTours(page: number, limit: number) {
  return apiService.get(urls.URL_GetTours + `page=${page}&limit=${limit}`);
}