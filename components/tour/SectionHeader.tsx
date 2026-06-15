import { BRAND } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * Clean section label — bold dark title with an optional accent badge
 * (e.g. "HOT" pill or a 🔥 emoji), matching the redesigned home mockup.
 */
export function SectionHeader({
  title,
  badge,
}: {
  title: string;
  badge?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isEmojiBadge = badge ? /\p{Extended_Pictographic}/u.test(badge) : false;

  return (
    <View className="flex-row items-center">
      <Text
        style={{ fontSize: 19, letterSpacing: -0.3 }}
        className={`font-black ${isDark ? "text-slate-100" : "text-[#1A1A2E]"}`}
      >
        {title}
      </Text>
      {!!badge &&
        (isEmojiBadge ? (
          <Text style={{ fontSize: 16, marginLeft: 6 }}>{badge}</Text>
        ) : (
          <View
            style={{ backgroundColor: BRAND.red }}
            className="ml-1.5 px-2 py-[3px] rounded-full"
          >
            <Text
              className="text-white font-extrabold"
              style={{ fontSize: 13, letterSpacing: 0.4 }}
            >
              {badge}
            </Text>
          </View>
        ))}
    </View>
  );
}

/** Section title row: clean header on the left, "Tất cả →" link on the right. */
export function SectionRow({
  title,
  badge,
  onSeeAll,
}: {
  title: string;
  badge?: string;
  onSeeAll?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mx-5 mt-7 mb-3">
      <SectionHeader title={title} badge={badge} />
      {onSeeAll && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSeeAll}
          className="flex-row items-center"
        >
          <Text style={{ color: BRAND.red, fontSize: 16, fontWeight: "700" }}>
            Tất cả
          </Text>
          <Ionicons name="chevron-forward" size={16} color={BRAND.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}
