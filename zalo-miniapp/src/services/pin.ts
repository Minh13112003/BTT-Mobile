import * as urls from "./api/constants";
import { apiService } from "./api/interceptor";

export function getPinStatus() {
  return apiService.get<{ hasPin: boolean }>(urls.URL_PinStatus);
}

export function setPin(pin: string) {
  return apiService.post<{ message: string }>(urls.URL_SetPin, { pin });
}

export function verifyPin(pin: string) {
  return apiService.post<{ success: boolean }>(urls.URL_VerifyPin, { pin });
}

export function changePin(currentPin: string, newPin: string) {
  return apiService.patch<{ message: string }>(urls.URL_ChangePin, { currentPin, newPin });
}
