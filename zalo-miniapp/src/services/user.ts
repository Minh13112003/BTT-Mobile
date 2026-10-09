import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age?: number;
  earnedPoints?: number;
  rewardPoints?: number;
  avatarUrl?: string | null;
}

interface Password {
  currentPassword: string;
  newPassword: string;
}

export function updateProfile(payload: Omit<UserProfile, "earnedPoints" | "rewardPoints">) {
  return apiService.patch(urls.URL_UpdateProfile, payload);
}

export function getMe() {
  return apiService.get(urls.URL_UpdateProfile);
}

export function changePassword(payload: Password) {
  return apiService.patch(urls.URL_ChangePassword, payload);
}

/**
 * Khác bản RN (dùng FormData kiểu `{uri, name, type}` của React Native) — trên
 * web, FormData cần 1 File/Blob thật, nên nhận trực tiếp `File` (vd từ
 * `<input type="file">`) thay vì bộ 3 uri/fileName/mimeType.
 */
export function updateAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiService.patch(urls.URL_UpdateAvatar, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function removeAvatar() {
  return apiService.patch(urls.URL_UpdateAvatar, { avatar: null });
}
