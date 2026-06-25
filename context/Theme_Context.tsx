import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { applyFontSizeMode, FontSizeMode } from "@/constants/typography";

const storage = {
  get: async (key: string) => {
    if (Platform.OS === "web") return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  set: async (key: string, value: string) => {
    if (Platform.OS === "web") { localStorage.setItem(key, value); return; }
    return SecureStore.setItemAsync(key, value);
  },
};

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontSizeMode: FontSizeMode;
  setFontSizeMode: (mode: FontSizeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [fontSizeMode, setFontSizeModeState] = useState<FontSizeMode>("normal");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load theme preference
        const savedTheme = await storage.get("theme_preference");
        if (savedTheme === "dark" || savedTheme === "light") {
          setTheme(savedTheme);
        }
        
        // Load font size preference
        const savedFontSize = await storage.get("font_size_preference");
        if (savedFontSize === "compact" || savedFontSize === "normal") {
          setFontSizeModeState(savedFontSize);
          applyFontSizeMode(savedFontSize);
        }
      } catch (error) {
        console.error("Lỗi khi tải preferences:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const toggleTheme = async () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      await storage.set("theme_preference", nextTheme);
    } catch (error) {
      console.error("Lỗi khi lưu theme preference:", error);
    }
  };

  const setFontSizeMode = async (mode: FontSizeMode) => {
    setFontSizeModeState(mode);
    applyFontSizeMode(mode);
    try {
      await storage.set("font_size_preference", mode);
    } catch (error) {
      console.error("Lỗi khi lưu font size preference:", error);
    }
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSizeMode, setFontSizeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
