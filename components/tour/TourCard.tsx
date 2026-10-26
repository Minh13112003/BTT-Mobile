import { FONT_SIZE } from "@/constants/typography";
import { getShadow, RADIUS } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { formatPrice } from "@/helper/format";
import { TourItem } from "@/services/tour";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { TourImage } from "@/components/tour/TourImage";

/**
 * Tour list card — reused by Home, Search, and the Home featured carousel.
 * Tapping opens the detail screen. `width` is optional: omit it for the
 * default full-width vertical list layout, or pass a fixed value to use the
 * card inside a horizontal carousel (see FeaturedCarousel).
 */
export function TourCard({
  tour,
  onPress,
  dateMode,
  specificDate,
  startDate,
  endDate,
  width,
}: {
  tour: TourItem;
  onPress: () => void;
  dateMode?: string;
  specificDate?: string;
  startDate?: string;
  endDate?: string;
  width?: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  let matchingDeparture = null;
  if (dateMode === "specific" && specificDate) {
    const target = new Date(specificDate);
    matchingDeparture = tour.departures?.find((dep) => {
      const depDate = new Date(dep.departureDate);
      return (
        depDate.getFullYear() === target.getFullYear() &&
        depDate.getMonth() === target.getMonth() &&
        depDate.getDate() === target.getDate()
      );
    });
  } else if (dateMode === "range" && (startDate || endDate)) {
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date(8640000000000000);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const sortedDeps = tour.departures ? [...tour.departures].sort(
      (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
    ) : [];
    matchingDeparture = sortedDeps.find((dep) => {
      const depDate = new Date(dep.departureDate);
      return depDate >= start && depDate <= end;
    });
  }

  const nearest = matchingDeparture || getNearestDeparture(tour.departures ?? []);
  const displayPrice = nearest?.price ?? null;
  const displayDate = nearest?.departureDate ?? null;

  const coverUri = Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl;
  // Laravel không có cờ trong nước/nước ngoài — đường dẫn ảnh là tour/trong-nuoc/... hoặc tour/nuoc-ngoai/...
  const regionLabel = coverUri?.includes("/nuoc-ngoai/")
    ? "Nước ngoài"
    : coverUri?.includes("/trong-nuoc/")
      ? "Trong nước"
      : null;

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      className={`mb-5 border overflow-hidden ${
        isDark
          ? "bg-slate-800/90 border-slate-700/50"
          : "bg-white border-[#D0021B]/10"
      }`}
      style={{
        borderRadius: RADIUS.xl,
        ...getShadow(isDark, "sm"),
        ...(width != null ? { width } : null),
      }}
    >
      {/* Ảnh + nhãn khu vực + thời lượng. Bỏ ô ★ (Laravel luôn trả rating 0). */}
      <View className="relative h-44 w-full bg-slate-900/10">
        <TourImage uri={coverUri} style={{ width: "100%", height: "100%" }} />
        {regionLabel && (
          <View
            className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 ${
              isDark ? "bg-slate-900/90" : "bg-white/90"
            }`}
          >
            <Text
              className={`font-semibold ${isDark ? "text-slate-100" : "text-[#B30118]"}`}
              style={{ fontSize: FONT_SIZE.card }}
            >
              {regionLabel}
            </Text>
          </View>
        )}
        <View
          className={`absolute bottom-3 left-3 rounded-xl px-2.5 py-1 ${
            isDark ? "bg-slate-700/95" : "bg-[#D0021B]/90"
          }`}
        >
          <Text className="text-white font-black uppercase" style={{ fontSize: FONT_SIZE.xs }}>
            {tour.duration}
          </Text>
        </View>
      </View>

      {/* Tên tour, ngày khởi hành + giá chung 1 hàng, nút Xem chi tiết — không vạch chia */}
      <View style={{ position: "relative" }}>
        <Svg
          width="100%"
          height={180}
          viewBox="0 0 380 180"
          preserveAspectRatio="none"
          style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}
        >
          <Path
            d="M0,180 L0,70 C 31.6,54 63.3,54 95,70 C 126.6,86 158.3,86 190,70 C 221.6,54 253.3,54 285,70 C 316.6,86 348.3,86 380,70 L380,180 Z"
            fill={isDark ? "#64748B" : "#D0021B"}
            fillOpacity={0.2}
          />
        </Svg>
        <View className="px-4 pt-3.5 pb-4" style={{ gap: 12 }}>
          <Text
            style={{ fontSize: FONT_SIZE.lg, lineHeight: 30 }}
            className={`font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}
            numberOfLines={2}
          >
            {tour.name}
          </Text>

          <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
            <View className="flex-row items-center flex-shrink" style={{ gap: 6 }}>
              <Ionicons name="calendar-outline" size={18} color={isDark ? "#F87171" : "#D0021B"} />
              <Text
                style={{ fontSize: FONT_SIZE.xs }}
                className={`font-semibold flex-shrink ${isDark ? "text-slate-300" : "text-slate-600"}`}
                numberOfLines={1}
              >
                {displayDate ? formatDepartureDate(displayDate) : "Chưa có lịch"}
              </Text>
            </View>
            <Text
              style={{ fontSize: FONT_SIZE.lg }}
              className={`font-black ${isDark ? "text-slate-100" : "text-[#D0021B]"}`}
            >
              {formatPrice(displayPrice)}
            </Text>
          </View>

          <View className="flex-row justify-end mt-1.5">
            <PrimaryButton label="Xem chi tiết" onPress={onPress} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
