import Header from "@/components/Header";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F1F5F9]"}`}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#E51F27"}
      />

      <Header title="TÌM KIẾM TOUR" showActions={true} />

      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 100,
          }}
        >
          {/* Input tìm kiếm */}
          <View
            className={`flex-row items-center rounded-2xl border-2 px-4 h-14 shadow-sm mb-6 ${
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
              className={`flex-1 h-full ml-3 font-semibold text-base ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
              placeholder="Bạn muốn tìm tour du lịch nào?"
              placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? "#6B7280" : "#94A3B8"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Empty search state placeholder */}
          <View
            className={`rounded-[24px] p-8 items-center justify-center border shadow-sm mt-4 ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                isDark ? "bg-slate-700" : "bg-slate-50"
              }`}
            >
              <Ionicons
                name="search-outline"
                size={32}
                color={isDark ? "#E5E7EB" : "#94A3B8"}
              />
            </View>
            <Text
              className={`font-black text-sm text-center ${isDark ? "text-slate-200" : "text-slate-500"}`}
            >
              Nhập từ khóa tìm kiếm
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1 leading-5">
              Tìm kiếm các tour du lịch trong nước, ngoài nước hoặc các tin
              khuyến mãi hấp dẫn nhất từ BenThanh Tourist.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
