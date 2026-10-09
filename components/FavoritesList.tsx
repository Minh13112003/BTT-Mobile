import { TourCard } from "@/components/tour/TourCard";
import { FONT_SIZE } from "@/constants/typography";
import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { FavoriteItem, getMyFavorites } from "@/services/favorite";
import { TourItem } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";

/** Map 1 bản ghi Favorite (snapshot) sang TourItem để tái dùng TourCard. */
function favoriteToTourItem(fav: FavoriteItem): TourItem {
  return {
    id: fav.tourKey,
    name: fav.tourName,
    imageUrl: fav.tourImage ? [fav.tourImage] : [],
    imagePublicId: [],
    duration: fav.durationText ?? "",
    rating: 0,
    reviewsCount: 0,
    hasVat: false,
    departures:
      fav.unitPrice != null && fav.departureDate
        ? [
            {
              id: fav.tourKey,
              tourId: fav.tourKey,
              departureDate: fav.departureDate,
              price: fav.unitPrice,
              availableSeats: 1,
            },
          ]
        : [],
  };
}

/**
 * Tab "Yêu thích" trong history.tsx — tour đã tim ở trang chi tiết (tour/[id].tsx),
 * lưu snapshot qua services/favorite.ts (NestJS, bảng Favorite). Bấm vào card mở
 * lại trang chi tiết thật (gọi Laravel lấy dữ liệu mới nhất) — snapshot chỉ để
 * hiển thị nhanh trong list, không phải nguồn sự thật.
 */
export function FavoritesList({ headerHeight = 0 }: { headerHeight?: number }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const router = useRouter();

  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFavorites = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyFavorites();
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Lỗi tải danh sách yêu thích:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Reload mỗi khi quay lại tab (vd sau khi bỏ tim ở trang chi tiết tour).
  useFocusEffect(
    useCallback(() => {
      fetchFavorites(true);
    }, [fetchFavorites]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <ActivityIndicator size="large" color={palette.spinner} />
        <Text
          className={`mt-2 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
          style={{ fontSize: FONT_SIZE.card }}
        >
          Đang tải tour yêu thích...
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: headerHeight + 10, paddingBottom: 24 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={palette.spinner} />
      }
      ListEmptyComponent={
        <View
          className={`rounded-[24px] p-8 items-center justify-center border border-dashed mt-4 ${
            isDark ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200"
          }`}
        >
          <Ionicons name="heart-outline" size={48} color="#9CA3AF" />
          <Text
            className={`font-bold mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            style={{ fontSize: FONT_SIZE.xs }}
          >
            Chưa có tour yêu thích
          </Text>
          <Text className="text-slate-400 text-center mt-1" style={{ fontSize: FONT_SIZE.xs }}>
            Nhấn biểu tượng trái tim ở trang chi tiết tour để lưu lại đây.
          </Text>
        </View>
      }
      renderItem={({ item }) => {
        const tour = favoriteToTourItem(item);
        return (
          <TourCard
            tour={tour}
            onPress={() =>
              router.push({
                pathname: "/(root)/tour/[id]",
                params: {
                  id: tour.id,
                  name: tour.name,
                  imageUrl: tour.imageUrl[0] ?? "",
                  price: item.unitPrice != null ? String(item.unitPrice) : "0",
                  duration: tour.duration,
                  rating: "0",
                  reviewsCount: "0",
                  hasVat: "false",
                },
              })
            }
          />
        );
      }}
    />
  );
}
