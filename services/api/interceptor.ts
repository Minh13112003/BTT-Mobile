// services/api/interceptor.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { router } from 'expo-router';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl 
  || process.env.EXPO_PUBLIC_API_URL 
  || 'https://default-api.com';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// ==================== SECURE STORE HELPERS ====================
const storage = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
  clearAuth: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync('accessToken'),
      SecureStore.deleteItemAsync('refreshToken'),
    ]);
  }
};

// ==================== REFRESH TOKEN ====================
const handleRefreshToken = async (): Promise<string | null> => {
  try {
    const storedRefreshToken = await storage.get('refreshToken');

    if (!storedRefreshToken) throw new Error('No refresh token');

    // Gửi refreshToken lên header, RefreshTokenGuard tự decode lấy userId
    const response = await axiosInstance.post(
      '/auth/refresh-token',
      {},
      {
        headers: {
          Authorization: `Bearer ${storedRefreshToken}`,
        },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;

    await storage.set('accessToken', accessToken);
    await storage.set('refreshToken', newRefreshToken);

    return accessToken;
  } catch (error) {
    // Xóa token và về màn hình login
    await storage.clearAuth();
    router.replace('/(root)/(auth)/login');
    throw error;
  }
};

// ==================== REQUEST INTERCEPTOR ====================
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.get('accessToken');
    const isAuthRoute = /\/auth\/(login|register|refresh-token)/.test(config.url ?? '');

    if (token && !isAuthRoute) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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

    // Không thử refresh-token cho chính các endpoint auth (login/register/refresh).
    // Nếu không, lỗi 401 thật (vd "Invalid email or password") sẽ bị che thành "No refresh token".
    const requestUrl: string = originalRequest?.url ?? '';
    const isAuthRoute = /\/auth\/(login|register|refresh-token)/.test(requestUrl);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
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
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              processQueue(null, newAccessToken);
              resolve(axiosInstance(originalRequest));
            } else {
              processQueue(new Error('No access token returned'), null);
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
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  put: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config = {}) =>
    axiosInstance.patch<T>(url, data, config),

  delete: <T = any>(url: string, config = {}) =>
    axiosInstance.delete<T>(url, config),
};


export default axiosInstance;