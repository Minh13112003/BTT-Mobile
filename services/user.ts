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

export function registerFcmToken(fcmToken: string) {
  return apiService.post(urls.URL_RegisterFcmToken, { fcmToken });
}

export function updateAvatar(localUri: string, fileName: string, mimeType: string) {
  const formData = new FormData();
  formData.append("avatar", {
    uri: localUri,
    name: fileName,
    type: mimeType,
  } as any);
  return apiService.patch(urls.URL_UpdateAvatar, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function removeAvatar() {
  return apiService.patch(urls.URL_UpdateAvatar, { avatar: null });
}
