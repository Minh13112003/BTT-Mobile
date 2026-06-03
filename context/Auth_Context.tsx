import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

// Định nghĩa cấu trúc User để đồng bộ với Backend
interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
  age?: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null; // Thêm biến user vào đây
  saveAuth: (
    accessToken: string,
    refreshToken: string,
    user: User,
  ) => Promise<void>; // Nhận thêm user khi login
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null); // State lưu trữ user
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        // Lấy song song token và thông tin user đã lưu
        const [token, savedUser] = await Promise.all([
          SecureStore.getItemAsync("accessToken"),
          SecureStore.getItemAsync("user"),
        ]);
        

        if (token) {
          setAccessToken(token);
          setIsLoggedIn(true);
        }

        if (savedUser) {
          setUser(JSON.parse(savedUser)); // Chuyển từ chuỗi string sang Object
        }
      } catch (error) {
        console.error("Lỗi khi nạp dữ liệu từ SecureStore:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStorageData();
  }, []);

  if (isLoading) return null;

  // Cập nhật hàm saveAuth để lưu cả object user
  const saveAuth = async (
    accessToken: string,
    refreshToken: string,
    userData: User,
  ) => {
    try {
      await Promise.all([
        SecureStore.setItemAsync("accessToken", accessToken),
        SecureStore.setItemAsync("refreshToken", refreshToken),
        SecureStore.setItemAsync("user", JSON.stringify(userData)), // Lưu user dưới dạng string JSON
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
      setIsLoggedIn(false);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, accessToken, user, saveAuth, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
