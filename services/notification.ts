import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type?: string;
  refId?: string | null;
  refType?: string | null;
}

export interface NotificationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface NotificationResponse {
  items: NotificationItem[];
  meta: NotificationMeta;
}

export const getNotifications = (page = 1, limit = 20) =>
  apiService.get<NotificationResponse>(
    `${urls.URL_GetNotifications}?page=${page}&limit=${limit}`
  );

export const readAllNotifications = () =>
  apiService.patch(urls.URL_ReadAllNotifications);

export const readNotification = (id: string) =>
  apiService.patch(`${urls.URL_ReadNotification}${id}/read`);
