import { EAT_LABELS, VEHICLE_LABELS } from "@/components/tour/TourScheduleHtmlAccordion";
import { Card } from "@/components/ui/Card";
import { ChoiceChip } from "@/components/ui/ChoiceChip";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { TourPlanLaravel } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

/**
 * Lịch trình dạng tab cho trang chi tiết tour (Laravel) — lưới nút "Ngày 1", "Ngày 2"...
 * (3 cột), bên dưới chỉ hiện nội dung 1 ngày đang chọn + nút "Ngày trước / Ngày sau".
 * Ngắn hơn hẳn danh sách Accordion (TourScheduleHtmlAccordion — vẫn dùng ở detailTour.tsx).
 */
export function TourScheduleTabs({ plans }: { plans?: TourPlanLaravel[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const count = plans?.length ?? 0;
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (!plans?.length) return null;

  const plan = plans[Math.min(index, count - 1)];
  const dayLabel = (p: TourPlanLaravel, i: number) => `Ngày ${p.day || i + 1}`;
  const meals = (plan.eats ?? []).map((slug) => EAT_LABELS[slug] ?? slug);
  const vehicles = (plan.main_vehicles ?? []).map((slug) => VEHICLE_LABELS[slug] ?? slug);
  const bodyColor = isDark ? "#CBD5E1" : "#475569";

  return (
    <Card className="mt-4">
      <View className="flex-row items-center justify-between mb-3.5">
        <Text
          style={{ fontSize: FONT_SIZE.md }}
          className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          Lịch trình
        </Text>
        <Text style={{ fontSize: FONT_SIZE.card }} className={isDark ? "text-slate-400" : "text-slate-500"}>
          {count} ngày
        </Text>
      </View>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {plans.map((p, i) => (
          <ChoiceChip
            key={`${p.day}-${i}`}
            label={dayLabel(p, i)}
            selected={i === index}
            onPress={() => setIndex(i)}
            style={{ width: "31%" }}
          />
        ))}
      </View>

      <View
        className={`mt-3.5 rounded-2xl p-4 ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}
        style={{ gap: 8 }}
      >
        <Text style={{ fontSize: FONT_SIZE.card }} className={`font-bold ${isDark ? "text-[#F87171]" : "text-[#D0021B]"}`}>
          {dayLabel(plan, index)}
        </Text>
        {plan.title ? (
          <Text
            style={{ fontSize: FONT_SIZE.md, lineHeight: 26 }}
            className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
          >
            {plan.title}
          </Text>
        ) : null}

        {(meals.length > 0 || vehicles.length > 0) && (
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {vehicles.map((v, i) => (
              <View
                key={`veh-${i}`}
                className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
                  isDark ? "bg-blue-950/40 border-blue-900" : "bg-white border-blue-100"
                }`}
                style={{ gap: 4 }}
              >
                <Ionicons name="car-outline" size={14} color={isDark ? "#93C5FD" : "#2563EB"} />
                <Text style={{ fontSize: FONT_SIZE.card }} className={isDark ? "text-blue-300" : "text-blue-700"}>
                  {v}
                </Text>
              </View>
            ))}
            {meals.map((m, i) => (
              <View
                key={`meal-${i}`}
                className={`flex-row items-center px-2.5 py-1 rounded-lg border ${
                  isDark ? "bg-amber-950/40 border-amber-900" : "bg-white border-[#FDE2C3]"
                }`}
                style={{ gap: 4 }}
              >
                <Ionicons name="restaurant-outline" size={14} color={isDark ? "#FCD34D" : "#9A4A00"} />
                <Text style={{ fontSize: FONT_SIZE.card }} className={isDark ? "text-amber-200" : "text-[#9A4A00]"}>
                  {m}
                </Text>
              </View>
            ))}
          </View>
        )}

        <RenderHTML
          // Màn hình − lề trang (32) − padding Card (32) − padding khung ngày (32).
          contentWidth={width - 96}
          source={{ html: plan.content || "" }}
          baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.card, lineHeight: 24 }}
          defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
          tagsStyles={{
            p: { margin: 0, marginBottom: 8, fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24 },
            li: { fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24 },
            strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
          }}
        />
      </View>

      {count > 1 && (
        <View className="flex-row mt-3" style={{ gap: 10 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIndex((i) => (i - 1 + count) % count)}
            className={`flex-1 rounded-2xl items-center justify-center flex-row border ${
              isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
            }`}
            style={{ minHeight: 44, gap: 4 }}
          >
            <Ionicons name="chevron-back" size={16} color={isDark ? "#CBD5E1" : "#334155"} />
            <Text style={{ fontSize: FONT_SIZE.card }} className={`font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
              Ngày trước
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIndex((i) => (i + 1) % count)}
            className={`flex-1 rounded-2xl items-center justify-center flex-row border ${
              isDark ? "bg-[#3A1D22] border-[#F87171]" : "bg-[#FFF6F7] border-[#D0021B]"
            }`}
            style={{ minHeight: 44, gap: 4 }}
          >
            <Text
              style={{ fontSize: FONT_SIZE.card }}
              className={`font-bold ${isDark ? "text-[#FCA5A5]" : "text-[#D0021B]"}`}
            >
              Ngày sau
            </Text>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#FCA5A5" : "#D0021B"} />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}
