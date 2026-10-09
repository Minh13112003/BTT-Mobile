// services/api/interceptor.ts
// Port từ services/api/interceptor.ts của app React Native — cùng hành vi
// refresh-token/401, chỉ đổi storage (SecureStore → utils/storage.ts, có
// fallback localStorage khi chạy ngoài Zalo) và cách điều hướng về login.
import axios from "axios";
import { getItem, setItem, deleteItem } from "@/utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://default-api.com";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ==================== LARAVEL API (song song NestJS trong giai đoạn migrate) ====================
// Xem .claude/rules/laravel-migration.md bên app RN — API Laravel là public read
// API cho dữ liệu tour, không cần Bearer token / refresh-token flow như NestJS.
const LARAVEL_API_BASE_URL =
  import.meta.env.VITE_BASE_BTT_URL || "https://benthanhtourist.com";

const laravelAxiosInstance = axios.create({
  baseURL: LARAVEL_API_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
});

export const apiServiceLaravel = {
  get: <T = any>(url: string, params = {}, config = {}) =>
    laravelAxiosInstance.get<T>(url, { ...config, params }),
};

// ==================== STORAGE HELPERS ====================
const storage = {
  get: (key: string) => getItem(key),
  set: (key: string, value: string) => setItem(key, value),
  remove: (key: string) => deleteItem(key),
  clearAuth: async () => {
    await Promise.all([deleteItem("accessToken"), deleteItem("refreshToken")]);
  },
};

/** Phát khi refresh token thất bại hoàn toàn — AuthContext nghe để đăng xuất. */
export const AUTH_EXPIRED_EVENT = "auth:expired";

// ==================== REFRESH TOKEN ====================
const handleRefreshToken = async (): Promise<string | null> => {
  try {
    const storedRefreshToken = await storage.get("refreshToken");

    if (!storedRefreshToken) throw new Error("No refresh token");

    const response = await axiosInstance.post(
      "/auth/refresh-token",
      {},
      {
        headers: {
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    await storage.set("accessToken", accessToken);
    await storage.set("refreshToken", newRefreshToken);

    return accessToken;
  } catch (error) {
    await storage.clearAuth();
    // Module này không phải React component nên không gọi được useNavigate().
    // KHÔNG dùng window.location.href = "/login": trong Zalo app chạy dưới
    // /zapps/<APP_ID>/..., redirect tuyệt đối sẽ rơi ra ngoài app (trang trắng).
    // Phát sự kiện để AuthContext đăng xuất → AuthGate (App.tsx) tự về /login.
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw error;
  }
};

// ==================== REQUEST INTERCEPTOR ====================
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.get("accessToken");
    const isAuthRoute = /\/auth\/(login|register|refresh-token)/.test(config.url ?? "");

    if (token && !isAuthRoute) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const requestUrl: string = originalRequest?.url ?? "";
    const isAuthRoute = /\/auth\/(login|register|refresh-token)/.test(requestUrl);
    const isPinVerify = /\/users\/me\/pin/.test(requestUrl);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute &&
      !isPinVerify
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        handleRefreshToken()
          .then((newAccessToken) => {
            if (newAccessToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              resolve(axiosInstance(originalRequest));
            } else {
              processQueue(new Error("No access token returned"), null);
              reject(error);
            }
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

// ==================== API SERVICE ====================
export const apiService = {
  get: <T = any>(url: string, params = {}, config = {}) =>
    axiosInstance.get<T>(url, { ...config, params }),

  post: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.post<T>(url, data, config),

  post_form: <T = any>(url: string, data?: FormData, config = {}) =>
    axiosInstance.post<T>(url, data, {
      ...config,
      headers: { "Content-Type": "multipart/form-data" },
    }),

  put: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.patch<T>(url, data, config),

  delete: <T = any>(url: string, config = {}) => axiosInstance.delete<T>(url, config),
};

export default axiosInstance;
