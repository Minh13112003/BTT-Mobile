import { useTheme } from "@/context/Theme_Context";
import { formatPrice } from "@/helper/format";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

/**
 * Compact tour card for horizontal carousels (Home) and the Search grid.
 * `width` is controlled by the parent so the same card works at 220px in a
 * rail, full-bleed when `featured`, or half-screen in a 2-column grid.
 */
export function TourCardCompact({
  tour,
  onPress,
  width = 220,
  featured = false,
  showBooking = false,
}: {
  tour: TourItem;
  onPress: () => void;
  width?: number;
  featured?: boolean;
  showBooking?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const nearest = getNearestDeparture(tour.departures ?? []);
  const price = nearest?.price ?? null;
  const imageHeight = featured ? 180 : 132;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={onPress}
      style={{ width }}
      className={`rounded-3xl overflow-hidden border ${
        isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100"
      }`}
    >
      <View style={{ height: imageHeight }} className="w-full bg-slate-900/10">
        <Image
          source={{ uri: tour.imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* duration badge */}
        <View
          className="absolute bottom-2 left-2 rounded-lg px-2 py-1"
          style={{ backgroundColor: "rgba(229,31,39,0.92)" }}
        >
          <Text className="text-white font-black" style={{ fontSize: 16 }}>
            {tour.duration}
          </Text>
        </View>
        {/* rating badge */}
        <View
          className={`absolute top-2 right-2 rounded-full px-2 py-0.5 flex-row items-center ${
            isDark ? "bg-slate-900/90" : "bg-white/90"
          }`}
        >
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text
            className={`font-black ml-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontSize: 16 }}
          >
            {tour.rating}
          </Text>
        </View>
        {/* booking badge (popular section) */}
        {showBooking && typeof tour.bookingCount === "number" && (
          <View
            className="absolute top-2 left-2 rounded-full px-2 py-0.5"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <Text className="text-white font-bold" style={{ fontSize: 16 }}>
              🔥 {tour.bookingCount} đã đặt
            </Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          numberOfLines={2}
          style={{ fontSize: 16, minHeight: 42 }}
          className={`font-black leading-5 ${
            isDark ? "text-slate-100" : "text-slate-800"
          }`}
        >
          {tour.name}
        </Text>

        <View className="flex-row items-center mt-1.5">
          <Ionicons name="star" size={14} color="#F59E0B" />
          <Text
            className={`ml-1 font-semibold ${
              isDark ? "text-slate-300" : "text-slate-500"
            }`}
            style={{ fontSize: 16 }}
          >
            {tour.rating} ({tour.reviewsCount})
          </Text>
        </View>

        {!!tour.transport && (
          <View className="flex-row items-center mt-1">
            <Ionicons
              name="airplane-outline"
              size={14}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
            <Text
              numberOfLines={1}
              className={`ml-1.5 font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
              style={{ fontSize: 16 }}
            >
              {tour.transport}
            </Text>
          </View>
        )}

        {!!tour.departureFrom && (
          <View className="flex-row items-center mt-1">
            <Ionicons
              name="location-outline"
              size={14}
              color={isDark ? "#94A3B8" : "#64748B"}
            />
            <Text
              numberOfLines={1}
              className={`ml-1 font-medium ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
              style={{ fontSize: 16 }}
            >
              {tour.departureFrom}
            </Text>
          </View>
        )}

        <Text
          className="mt-2 font-black"
          style={{ fontSize: 17, color: isDark ? "#F1F5F9" : "#E51F27" }}
        >
          {price != null ? `Từ ${formatPrice(price)}` : "Liên hệ"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
