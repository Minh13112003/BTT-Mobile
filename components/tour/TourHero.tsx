import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { TourDetail } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function CircleBtn({
  icon,
  onPress,
  isDark,
}: {
  icon: IconName;
  onPress?: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="w-10 h-10 rounded-full items-center justify-center border"
      style={{
        backgroundColor: isDark ? "rgba(10,12,18,0.55)" : "rgba(255,255,255,0.85)",
        borderColor: isDark ? "rgba(255,255,255,0.14)" : "rgba(15,23,42,0.08)",
      }}
    >
      <Ionicons name={icon} size={19} color={isDark ? "#FFFFFF" : "#0F172A"} />
    </TouchableOpacity>
  );
}

/** Full-bleed hero image with back/heart/share, duration badge and rating. */
export function TourHero({ tour, onBack, onPressImage }: { tour: TourDetail; onBack: () => void; onPressImage?: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View style={{ height: 286 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPressImage}
        disabled={!onPressImage}
        style={{ width: "100%", height: "100%" }}
      >
        <Image
          source={{ uri: tour.imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <LinearGradient
        colors={[
          "rgba(8,10,16,0.45)",
          "transparent",
          "transparent",
          isDark ? "rgba(18,22,32,0.98)" : "rgba(244,247,251,0.98)",
        ]}
        locations={[0, 0.28, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top action bar */}
      <View
        style={{ position: "absolute", top: insets.top + 6, left: 14, right: 14 }}
        className="flex-row justify-between"
      >
        <CircleBtn icon="chevron-back" onPress={onBack} isDark={isDark} />
        <View className="flex-row gap-2">
          <CircleBtn icon="heart-outline" isDark={isDark} />
          <CircleBtn icon="share-social-outline" isDark={isDark} />
        </View>
      </View>

      {/* Duration badge */}
      <View className="absolute left-4 bottom-4 bg-[#D0021B] px-3 py-1.5 rounded-xl">
        <Text className="text-white font-black uppercase tracking-wide" style={{ fontSize: FONT_SIZE.xs }}>
          {tour.duration}
        </Text>
      </View>

      {/* Rating */}
      <View
        className="absolute right-4 bottom-4 flex-row items-center px-2.5 py-1.5 rounded-full"
        style={{ backgroundColor: isDark ? "rgba(10,12,18,0.8)" : "rgba(255,255,255,0.92)" }}
      >
        <Ionicons name="star" size={13} color="#FBBF24" />
        <Text
          className={`font-black ml-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}
          style={{ fontSize: FONT_SIZE.xs }}
        >
          {tour.rating}
        </Text>
        <Text className="text-slate-400 ml-0.5" style={{ fontSize: FONT_SIZE.xs }}>({tour.reviewsCount})</Text>
      </View>
    </View>
  );
}
