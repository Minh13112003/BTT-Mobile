import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

/** Reusable search input with a clear button. */
export function SearchBar({
  value,
  onChangeText,
  placeholder = "Tìm kiếm tour du lịch...",
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View
      className={`flex-row items-center rounded-2xl border-2 px-4 h-[52px] ${
        isDark
          ? "bg-[#1E222B] border-slate-700/60"
          : "bg-white border-slate-100"
      }`}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isDark ? "#6B7280" : "#94A3B8"}
      />
      <TextInput
        className={`flex-1 h-full ml-3 font-semibold ${
          isDark ? "text-slate-100" : "text-slate-800"
        }`}
        style={{ fontSize: FONT_SIZE.xs }}
        placeholder={placeholder}
        placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons
            name="close-circle"
            size={18}
            color={isDark ? "#6B7280" : "#94A3B8"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}
