import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { formatPrice } from "@/helper/format";
import { TourItem } from "@/services/tour";
import { getNearestDeparture, formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View, ImageBackground } from "react-native";

const lightShadow = {
  shadowColor: "#94A3B8",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4,
};

/** Tour list card — reused by Home and Search. Tapping opens the detail screen. */
export function TourCard({
  tour,
  onPress,
  dateMode,
  specificDate,
  startDate,
  endDate,
}: {
  tour: TourItem;
  onPress: () => void;
  dateMode?: string;
  specificDate?: string;
  startDate?: string;
  endDate?: string;
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

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      className={`rounded-[24px] mb-5 border shadow-sm overflow-hidden ${
        isDark
          ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
          : "bg-white border-slate-100"
      }`}
      style={isDark ? undefined : lightShadow}
    >
      <ImageBackground
        source={{ uri: tour.imageUrl }}
        resizeMode="cover"
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        imageStyle={{ opacity: 0.15 }}
      />

      {/* Tour Image with Rating badge */}
      <View className="relative h-44 w-full bg-slate-900/10">
        <Image
          source={{ uri: tour.imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View
          className={`absolute top-3 right-3 rounded-full px-2.5 py-1 flex-row items-center shadow-sm ${
            isDark ? "bg-slate-900/90" : "bg-white/90"
          }`}
        >
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text
            className={`text-base font-black ml-1 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {tour.rating}
          </Text>
        </View>
        <View
          className={`absolute bottom-3 left-3 rounded-xl px-2.5 py-1 ${
            isDark ? "bg-slate-700/95" : "bg-[#D0021B]/90"
          }`}
        >
          <Text className="text-base text-white font-black uppercase">
            {tour.duration}
          </Text>
        </View>
      </View>

      {/* Tour Details */}
      <View className="p-4">
        <Text
          style={{ fontSize: FONT_SIZE.md }}
          className={`font-black leading-6 ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
          numberOfLines={2}
        >
          {tour.name}
        </Text>

        {/* Nearest departure + price */}
        <View className="mt-2.5">
          <View className="flex-row items-center">
            <Text style={{ fontSize: FONT_SIZE.xs }}>📅</Text>
            <Text
              style={{ fontSize: FONT_SIZE.xs }}
              className={`ml-1.5 font-semibold ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {displayDate
                ? `Khởi hành: ${formatDepartureDate(displayDate)}`
                : "Liên hệ để biết lịch khởi hành"}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text style={{ fontSize: FONT_SIZE.xs }}>💰</Text>
            <Text
              style={{ fontSize: FONT_SIZE.xs }}
              className={`ml-1.5 font-bold ${
                isDark ? "text-slate-200" : "text-[#D0021B]"
              }`}
            >
              Từ {formatPrice(displayPrice)}
            </Text>
          </View>
          <View className="flex-row items-center mt-1">
            <Text style={{ fontSize: FONT_SIZE.xs }}>✈️</Text>
            <Text
              style={{ fontSize: FONT_SIZE.xs }}
              className={`ml-1.5 font-semibold ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {tour.duration}
            </Text>
          </View>
        </View>

        <View
          className={`flex-row items-center justify-end mt-4 pt-3 border-t ${
            isDark ? "border-slate-700/60" : "border-slate-100"
          }`}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className={`rounded-xl px-5 py-2.5 ${
              isDark
                ? "bg-slate-700 border border-slate-600 active:bg-slate-600"
                : "bg-[#D0021B] active:bg-[#A80016]"
            }`}
          >
            <Text className="text-white font-bold text-base">
              Xem chi tiết
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}
