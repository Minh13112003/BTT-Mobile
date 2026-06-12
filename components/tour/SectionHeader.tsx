import { BRAND } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

/**
 * "Brush stroke" section label — a skewed red sticker with white uppercase
 * text, layered with a faint offset stroke for a hand-painted feel. Brand red
 * (#E51F27) is used to stay consistent with the rest of the app.
 */
export function SectionHeader({ title }: { title: string }) {
  return (
    <View style={{ alignSelf: "flex-start" }}>
      {/* faint offset stroke behind for a layered, painted look */}
      <View
        style={{
          position: "absolute",
          left: 5,
          top: 5,
          right: -5,
          bottom: -1,
          backgroundColor: BRAND.redActive,
          opacity: 0.3,
          transform: [{ skewX: "-11deg" }],
          borderTopLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderTopRightRadius: 4,
          borderBottomLeftRadius: 4,
        }}
      />
      <View
        style={{
          backgroundColor: BRAND.red,
          paddingHorizontal: 18,
          paddingVertical: 8,
          transform: [{ skewX: "-11deg" }],
          borderTopLeftRadius: 16,
          borderBottomRightRadius: 16,
          borderTopRightRadius: 5,
          borderBottomLeftRadius: 5,
          shadowColor: BRAND.red,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontWeight: "800",
            fontSize: 18,
            letterSpacing: 1.2,
            transform: [{ skewX: "11deg" }],
          }}
        >
          {title.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

/** Section title row: brush-stroke header on the left, "Xem tất cả →" on the right. */
export function SectionRow({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View className="flex-row items-end justify-between mx-5 mt-7 mb-3">
      <SectionHeader title={title} />
      {onSeeAll && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onSeeAll}
          className="flex-row items-center pb-1"
        >
          <Text style={{ color: BRAND.red, fontSize: 16, fontWeight: "700" }}>
            Xem tất cả
          </Text>
          <Ionicons name="chevron-forward" size={16} color={BRAND.red} />
        </TouchableOpacity>
      )}
    </View>
  );
}
