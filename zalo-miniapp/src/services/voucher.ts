// services/voucher.ts
import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface VoucherItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  expiry: string;
  tag: string;
  description: string;
}

export function getVouchers(page: number, limit: number) {
  return apiService.get(urls.URL_GetVouchers + `page=${page}&limit=${limit}`);
}
