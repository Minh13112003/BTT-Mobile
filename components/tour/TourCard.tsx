import { useTheme } from "@/context/Theme_Context";
import { formatCurrency } from "@/helper/format";
import { TourItem } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const lightShadow = {
  shadowColor: "#94A3B8",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 4,
};

/** Tour list card — reused by Home and Search. Tapping opens the detail screen. */
export function TourCard({ tour, onPress }: { tour: TourItem; onPress: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`rounded-3xl mb-5 border overflow-hidden ${
        isDark ? "bg-[#1E222B] border-slate-700/50" : "bg-white border-slate-100"
      }`}
      style={isDark ? undefined : lightShadow}
    >
      <View className="h-44 w-full bg-slate-900/10">
        <Image
          source={{ uri: tour.imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80 }}
        />
        <View
          className="absolute top-3 right-3 flex-row items-center px-2.5 py-1 rounded-full"
          style={{ backgroundColor: isDark ? "rgba(10,12,18,0.85)" : "rgba(255,255,255,0.95)" }}
        >
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className={`text-[11px] font-black ml-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            {tour.rating}
          </Text>
        </View>
        <View className="absolute bottom-3 left-3 bg-[#E51F27] px-2.5 py-1 rounded-xl">
          <Text className="text-[10px] text-white font-black uppercase">{tour.duration}</Text>
        </View>
      </View>

      <View className="p-4">
        <Text
          numberOfLines={2}
          className={`text-sm font-black leading-5 ${isDark ? "text-slate-100" : "text-slate-800"}`}
        >
          {tour.name}
        </Text>
        <View
          className={`flex-row items-center justify-between mt-3 pt-3 border-t ${
            isDark ? "border-slate-700/60" : "border-slate-100"
          }`}
        >
          <View>
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Giá trọn gói
            </Text>
            <Text className={`text-base font-black mt-0.5 ${isDark ? "text-slate-200" : "text-[#E51F27]"}`}>
              {formatCurrency(tour.price)}
            </Text>
          </View>
          <View className="flex-row items-center bg-[#E51F27] rounded-xl px-3.5 py-2.5">
            <Text className="text-white font-bold text-xs mr-1">Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
