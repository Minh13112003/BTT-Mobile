import { useTheme } from "@/context/Theme_Context";
import { formatPrice } from "@/helper/format";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Sticky bottom bar showing the price and the primary "Đặt tour" action. */
export function BookingBar({
  price,
  onPress,
  label = "Đặt tour",
}: {
  price: number | undefined;
  onPress: () => void;
  label?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View
      className={`absolute left-0 right-0 bottom-0 flex-row items-center justify-between px-4 pt-3 border-t ${
        isDark ? "bg-[#0E1119] border-[#272D3C]" : "bg-white border-slate-100"
      }`}
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 16 }}
    >
      <View>
        <Text
          className={`text-base font-bold uppercase tracking-wide ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          Chỉ từ
        </Text>
        <Text className={`text-lg font-black ${isDark ? "text-slate-100" : "text-[#E51F27]"}`}>
          {formatPrice(price)}
          <Text className="text-base font-bold text-[#E51F27]"> /khách</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        className="bg-[#E51F27] active:bg-[#C41A21] rounded-2xl px-7 py-3.5"
      >
        <Text className="text-white font-black text-base">{label}</Text>
      </TouchableOpacity>
    </View>
  );
}
