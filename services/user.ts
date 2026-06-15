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
}

interface Password {
  oldPassword: string;
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
