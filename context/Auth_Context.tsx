import * as SecureStore from "expo-secure-store";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getMe } from "@/services/user";
import { usePushNotifications } from "@/hooks/usePushNotifications";

// Định nghĩa cấu trúc User để đồng bộ với Backend
export interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  age?: number;
  earnedPoints?: number;
  rewardPoints?: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;
  earnedPoints: number;
  rewardPoints: number;
  refreshPoints: () => Promise<void>;
  saveAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPoints = useCallback(async () => {
    try {
      const res = await getMe();
      const me = res?.data?.data ?? res?.data;
      setEarnedPoints(typeof me?.earnedPoints === "number" ? me.earnedPoints : 0);
      setRewardPoints(typeof me?.rewardPoints === "number" ? me.rewardPoints : 0);
    } catch {
      // giữ nguyên giá trị cũ nếu lỗi
    }
  }, []);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const [token, savedUser] = await Promise.all([
          SecureStore.getItemAsync("accessToken"),
          SecureStore.getItemAsync("user"),
        ]);

        if (token) {
          setAccessToken(token);
          setIsLoggedIn(true);
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Lỗi khi nạp dữ liệu từ SecureStore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // Fetch points sau khi đã xác nhận đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      refreshPoints();
    }
  }, [isLoggedIn, refreshPoints]);

  // Đăng ký push notification token khi đăng nhập
  usePushNotifications(isLoggedIn);

  if (isLoading) return null;

  const saveAuth = async (
    accessToken: string,
    refreshToken: string,
    userData: User,
  ) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync("accessToken", accessToken),
        SecureStore.setItemAsync("refreshToken", refreshToken),
        SecureStore.setItemAsync("user", JSON.stringify(userData)),
      ]);

      setAccessToken(accessToken);
      setUser(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin đăng nhập:", error);
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync("accessToken"),
        SecureStore.deleteItemAsync("refreshToken"),
        SecureStore.deleteItemAsync("user"),
        SecureStore.deleteItemAsync("user_profile"),
      ]);

      setAccessToken(null);
      setUser(null);
      setEarnedPoints(0);
      setRewardPoints(0);
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, accessToken, user, earnedPoints, rewardPoints, refreshPoints, saveAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
