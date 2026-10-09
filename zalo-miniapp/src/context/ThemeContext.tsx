import React, { createContext, useContext, useEffect, useState } from "react";
import { getItem, setItem } from "@/utils/storage";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

/**
 * Theme do user tự chọn thủ công (không theo theme hệ thống) — giống hệt
 * Theme_Context.tsx bên app React Native. Lưu ý: zmp-ui cũng export 1 hook tên
 * `useTheme` (đọc theme Zalo OA cấp hệ thống) — khác khái niệm với hook này,
 * import cẩn thận để không nhầm 2 cái khi 1 file cần cả 2.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await getItem("theme_preference");
        if (savedTheme === "dark" || savedTheme === "light") {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Lỗi khi tải preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Gắn class "dark" lên <html> — CSS variables trong src/css/app.scss (html.dark {...})
  // và các khối Tailwind không điều khiển được qua className component (vd body
  // background) đọc theo class này.
  //
  // zmp-ui dùng CƠ CHẾ RIÊNG để biết dark mode: attribute `zaui-theme="dark"`
  // trên <body> (xem zaui.css — mọi component built-in như BottomNavigation,
  // Input, Button, Modal đọc theo selector `body[zaui-theme=dark]`, KHÔNG đọc
  // class "dark"). Phải gắn cả 2 thì component tự viết lẫn component có sẵn
  // của zmp-ui mới đổi màu đồng bộ.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.body.setAttribute("zaui-theme", theme);
  }, [theme]);

  const toggleTheme = async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      await setItem("theme_preference", nextTheme);
    } catch (error) {
      console.error("Lỗi khi lưu theme preference:", error);
    }
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
