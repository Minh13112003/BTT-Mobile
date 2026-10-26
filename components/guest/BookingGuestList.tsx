import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { isoToDmy, maskId } from "@/utils/guest";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface BookingGuest {
  position: number;
  fullName: string;
  dateOfBirth: string;
  nationalId?: string | null;
  phone?: string | null;
  passportNumber?: string | null;
  visaNumber?: string | null;
}

/**
 * Danh sách hành khách của một booking (màn chi tiết booking). Số giấy tờ mặc định che bớt,
 * bấm con mắt để xem đủ. Booking cũ (trước khi có tính năng hành khách) không có dữ liệu -> không render.
 */
export function BookingGuestList({ guests }: { guests?: BookingGuest[] | null }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [reveal, setReveal] = useState(false);

  if (!guests?.length) return null;

  const label = isDark ? "text-slate-400" : "text-slate-500";
  const value = isDark ? "text-slate-200" : "text-slate-800";
  const show = (v?: string | null) => (reveal ? v ?? "" : maskId(v));

  return (
    <View>
      <View className="flex-row items-center justify-between mb-3">
        <Text className={`font-black ${value}`} style={{ fontSize: FONT_SIZE.sm }}>
          Danh sách hành khách ({guests.length})
        </Text>
        <TouchableOpacity
          onPress={() => setReveal((r) => !r)}
          hitSlop={10}
          className="flex-row items-center"
          accessibilityRole="button"
          accessibilityLabel={reveal ? "Ẩn số giấy tờ" : "Hiện số giấy tờ"}
        >
          <Ionicons name={reveal ? "eye-off-outline" : "eye-outline"} size={16} color="#D0021B" />
          <Text className="ml-1 font-semibold text-[#D0021B]" style={{ fontSize: FONT_SIZE.xs }}>
            {reveal ? "Ẩn giấy tờ" : "Hiện giấy tờ"}
          </Text>
        </TouchableOpacity>
      </View>

      {guests.map((g, idx) => {
        const rows: [string, string][] = [
          ["Ngày sinh", isoToDmy(g.dateOfBirth)],
          ...(g.nationalId ? ([["CCCD", show(g.nationalId)]] as [string, string][]) : []),
          ...(g.passportNumber ? ([["Hộ chiếu", show(g.passportNumber)]] as [string, string][]) : []),
          ...(g.visaNumber ? ([["Visa", show(g.visaNumber)]] as [string, string][]) : []),
          ...(g.phone ? ([["SĐT", g.phone]] as [string, string][]) : []),
        ];
        return (
          <View
            key={`${g.position}-${idx}`}
            className={`rounded-2xl px-4 py-3 ${idx > 0 ? "mt-2.5" : ""} ${isDark ? "bg-slate-900/60" : "bg-slate-50"}`}
          >
            <View className="flex-row items-center mb-1.5">
              <View className="w-6 h-6 rounded-full bg-[#D0021B] items-center justify-center mr-2">
                <Text className="text-white font-black" style={{ fontSize: FONT_SIZE.xs }}>
                  {idx + 1}
                </Text>
              </View>
              <Text className={`flex-1 font-black ${value}`} style={{ fontSize: FONT_SIZE.sm }} numberOfLines={2}>
                {g.fullName}
              </Text>
              {idx === 0 && (
                <Text className={`font-semibold ${label}`} style={{ fontSize: FONT_SIZE.xs }}>
                  Người đặt
                </Text>
              )}
            </View>
            {rows.map(([k, v]) => (
              <View key={k} className="flex-row justify-between py-0.5">
                <Text className={label} style={{ fontSize: FONT_SIZE.xs }}>
                  {k}
                </Text>
                <Text className={`font-semibold ${value}`} style={{ fontSize: FONT_SIZE.xs }}>
                  {v}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
