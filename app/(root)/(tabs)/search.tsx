import Header from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { TourCard } from "@/components/tour/TourCard";
import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { TourFilter, useTourSearch } from "@/hooks/useTourSearch";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function FilterChips({
  filters,
  active,
  onSelect,
  isDark,
}: {
  filters: TourFilter[];
  active: string;
  onSelect: (key: string) => void;
  isDark: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2 mt-3">
      {filters.map((f) => {
        const on = f.key === active;
        return (
          <TouchableOpacity
            key={f.key}
            activeOpacity={0.8}
            onPress={() => onSelect(f.key)}
            className={`px-3.5 py-2 rounded-full border ${
              on
                ? "bg-[#E51F27] border-[#E51F27]"
                : isDark
                  ? "bg-[#1E222B] border-slate-700/60"
                  : "bg-white border-slate-200"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                on ? "text-white" : isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const {
    query,
    setQuery,
    activeFilter,
    setActiveFilter,
    filters,
    results,
    loading,
    refreshing,
    loadingMore,
    hasNext,
    onRefresh,
    loadMore,
  } = useTourSearch();

  const openDetail = (tour: TourItem) => {
    const nearest = getNearestDeparture(tour.departures ?? []);
    const displayPrice = nearest?.price ?? null;
    router.push({
      pathname: "/(root)/tour/[id]",
      params: {
        id: tour.id,
        name: tour.name,
        imageUrl: tour.imageUrl,
        price: displayPrice != null ? String(displayPrice) : "0",
        duration: tour.duration,
        rating: String(tour.rating),
        reviewsCount: String(tour.reviewsCount),
        hasVat: tour.hasVat ? "true" : "false",
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#E51F27"} />
      <Header title="BENTHANH TOURIST" showActions={true} />

      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {/* Sticky search header (kept outside FlatList so the input never loses focus) */}
        <View className="px-5 pt-4 pb-1">
          <Text
            className={`text-base font-bold uppercase tracking-wide mb-1 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            Khám phá
          </Text>
          <View className="flex-row items-center justify-between mb-3">
            <Text className={`text-xl font-black ${isDark ? "text-slate-50" : "text-slate-900"}`}>
              Tìm kiếm tour
            </Text>
            <Text className="text-base font-semibold text-slate-400">{results.length} kết quả</Text>
          </View>
          <SearchBar value={query} onChangeText={setQuery} />
          <FilterChips filters={filters} active={activeFilter} onSelect={setActiveFilter} isDark={isDark} />
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={palette.spinner} />
            <Text className={`text-base mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Đang tải danh sách tour...
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.spinner} />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            renderItem={({ item }) => <TourCard tour={item} onPress={() => openDetail(item)} />}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={palette.spinner} />
                </View>
              ) : !hasNext && results.length > 0 ? (
                <View className="py-3 items-center">
                  <Text className="text-base font-semibold text-slate-400">
                    ✓ Đã hiển thị tất cả tour
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View
                className={`rounded-3xl p-9 items-center border border-dashed mt-2 ${
                  isDark ? "bg-[#1E222B]/40 border-slate-700" : "bg-white border-slate-200"
                }`}
              >
                <Ionicons name="search-outline" size={42} color="#94A3B8" />
                <Text
                  className={`font-bold text-base mt-3 text-center ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {query ? "Không tìm thấy tour phù hợp" : "Chưa có tour nào"}
                </Text>
                <Text className="text-slate-400 text-base text-center mt-1.5">
                  {query ? "Vui lòng thử từ khoá khác." : "Danh sách tour sẽ hiển thị tại đây."}
                </Text>
              </View>
            }
          />
        )}
      </LinearGradient>
    </View>
  );
}
