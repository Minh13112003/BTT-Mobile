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
    throw error;
  }
};

// ==================== REQUEST INTERCEPTOR ====================
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await storage.get('accessToken');

    if (token) {
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
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await handleRefreshToken();
        if (newAccessToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ==================== API SERVICE ====================
export const apiService = {
  get: (url: string, params = {}, config = {}) =>
    axiosInstance.get(url, { ...config, params }),

  post: (url: string, data: any, config = {}) =>
    axiosInstance.post(url, data, config),

  
  post_form: (url: string, data: FormData, config = {}) =>
    axiosInstance.post(url, data, {
      ...config,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  put: (url: string, data: any, config = {}) =>
    axiosInstance.put(url, data, config),

  patch: (url: string, data: any, config = {}) =>
    axiosInstance.patch(url, data, config),

  delete: (url: string, config = {}) =>
    axiosInstance.delete(url, config),
};

export default axiosInstance;