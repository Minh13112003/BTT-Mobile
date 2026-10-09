/**
 * Endpoint list — port 1:1 từ services/api/constants.ts của app React Native.
 * Dùng import.meta.env (Vite) thay vì process.env (Expo) để đọc biến môi trường;
 * xem .env / .env.example cho giá trị mặc định.
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://default-api.com";

// Auth APIs
export const URL_Login = `${API_BASE_URL}/api/v1/auth/login`;
export const URL_Register = `${API_BASE_URL}/api/v1/auth/register`;
export const URL_Logout = `${API_BASE_URL}/api/v1/auth/logout`;

// User APIs
export const URL_UpdateProfile = `${API_BASE_URL}/api/v1/users/me`;
export const URL_ChangePassword = `${API_BASE_URL}/api/v1/users/me/password`;
export const URL_GetMe = `${API_BASE_URL}/api/v1/users/me`;

// Booking APIs
export const URL_DashboardOverview = `${API_BASE_URL}/api/v1/bookings/dashboard`;
export const URL_TransactionHistory = `${API_BASE_URL}/api/v1/bookings/me?`;
export const URL_GetBookingById = `${API_BASE_URL}/api/v1/bookings/`;
export const URL_Booking = `${API_BASE_URL}/api/v1/bookings`;

// Voucher APIs
export const URL_GetVouchers = `${API_BASE_URL}/api/v1/vouchers?`;

// Tour APIs (NestJS)
export const URL_GetTours = `${API_BASE_URL}/api/v1/tours?`;
export const URL_GetTourById = `${API_BASE_URL}/api/v1/tours/`;
export const URL_GetNewestTours = `${API_BASE_URL}/api/v1/tours/newest`;
export const URL_GetHotTours = `${API_BASE_URL}/api/v1/tours/hot`;
export const URL_GetPopularTours = `${API_BASE_URL}/api/v1/tours/popular`;
export const URL_GetToursByType = `${API_BASE_URL}/api/v1/tours/by-type`;

// Tour APIs (Laravel — xem .claude/rules/laravel-migration.md bên app RN)
export const LARAVEL_API_BASE_URL =
  import.meta.env.VITE_BASE_BTT_URL || "https://benthanhtourist.com";
export const URL_GetTourCategories = `${LARAVEL_API_BASE_URL}/api/tour/categories`;
export const URL_GetToursByCategory = `${LARAVEL_API_BASE_URL}/api/tour/category`;
export const URL_GetTourItem = `${LARAVEL_API_BASE_URL}/api/tour/item`;
export const URL_GetTourHot = `${LARAVEL_API_BASE_URL}/api/tour/hot`;
export const URL_GetTourList = `${LARAVEL_API_BASE_URL}/api/tour/list`;

// Blog APIs (Laravel)
export const URL_GetBlogCategories = `${LARAVEL_API_BASE_URL}/api/blog/categories`;
export const URL_GetBlogCategory = `${LARAVEL_API_BASE_URL}/api/blog/category`;
export const URL_GetBlogItem = `${LARAVEL_API_BASE_URL}/api/blog/item`;

// Departure APIs
export const URL_GetDeparturesByTour = `${API_BASE_URL}/api/v1/departures/tour/`;
export const URL_GetDepartureById = `${API_BASE_URL}/api/v1/departures/`;

// Notification APIs
export const URL_GetNotifications = `${API_BASE_URL}/api/v1/notifications`;
export const URL_UnreadCount = `${API_BASE_URL}/api/v1/notifications/unread-count`;
export const URL_ReadAllNotifications = `${API_BASE_URL}/api/v1/notifications/read-all`;
export const URL_ReadNotification = `${API_BASE_URL}/api/v1/notifications/`; // + `${id}/read`

// Referral APIs
export const URL_GetReferralStats = `${API_BASE_URL}/api/v1/users/referral`;

// Feedback APIs
export const URL_PostFeedback = `${API_BASE_URL}/api/v1/feedbacks`;

// Avatar
export const URL_UpdateAvatar = `${API_BASE_URL}/api/v1/users/me/avatar`;

// News APIs
export const URL_GetNews = `${API_BASE_URL}/api/v1/news`;
export const URL_GetNewsById = `${API_BASE_URL}/api/v1/news/`;

// Travel Tips APIs
export const URL_GetTravelTips = `${API_BASE_URL}/api/v1/travel-tips`;
export const URL_GetTravelTipById = `${API_BASE_URL}/api/v1/travel-tips/`;
export const URL_GetTravelTipDestinations = `${API_BASE_URL}/api/v1/travel-tips/destinations`;

// Favorite APIs
export const URL_GetMyFavorites = `${API_BASE_URL}/api/v1/favorites/me`;
export const URL_IsFavorited = `${API_BASE_URL}/api/v1/favorites/`; // + tourKey
export const URL_AddFavorite = `${API_BASE_URL}/api/v1/favorites`;
export const URL_RemoveFavorite = `${API_BASE_URL}/api/v1/favorites/`; // + tourKey
