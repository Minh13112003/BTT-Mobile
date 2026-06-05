import Constants from "expo-constants";

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  process.env.EXPO_PUBLIC_API_URL ||
  "https://default-api.com";

//Auth APIs
export const URL_Login = `${API_BASE_URL}/api/v1/auth/login`;
export const URL_Register = `${API_BASE_URL}/api/v1/auth/register`;
export const URL_Logout = `${API_BASE_URL}/api/v1/auth/logout`;

//User APIs
export const URL_UpdateProfile = `${API_BASE_URL}/api/v1/users/me`;
export const URL_ChangePassword = `${API_BASE_URL}/api/v1/users/me/password`;
export const URL_GetMe = `${API_BASE_URL}/api/v1/users/me`;

//Booking APIs
export const URL_DashboardOverview = `${API_BASE_URL}/api/v1/bookings/dashboard`;
export const URL_TransactionHistory = `${API_BASE_URL}/api/v1/bookings/me?`;
export const URL_GetBookingById = `${API_BASE_URL}/api/v1/bookings/`;
export const URL_Booking = `${API_BASE_URL}/api/v1/bookings`;

//Voucher APIs
export const URL_GetVouchers = `${API_BASE_URL}/api/v1/vouchers?`;

//Tour APIs
export const URL_GetTours = `${API_BASE_URL}/api/v1/tours?`;

//Referral APIs
export const URL_GetReferralStats = `${API_BASE_URL}/api/v1/users/referral`;

//Feedback APIs
export const URL_PostFeedback = `${API_BASE_URL}/api/v1/feedbacks`;
