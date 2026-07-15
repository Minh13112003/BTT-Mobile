import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { TourPlanLaravel } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

// Slug → nhãn hiển thị, xem docs/laravel-tour-api-samples.md ("eats"/"main_vehicles").
const EAT_LABELS: Record<string, string> = {
  "an-sang": "Ăn sáng",
  "an-trua": "Ăn trưa",
  "an-chieu": "Ăn chiều",
  "an-toi": "Ăn tối",
};
const VEHICLE_LABELS: Record<string, string> = {
  "may-bay": "Máy bay",
  "xe-oto": "Xe ô tô",
  "tau-hoa": "Tàu hỏa",
  "tau-thuy": "Tàu thủy",
};

interface Props {
  plans?: TourPlanLaravel[];
}

/**
 * Lịch trình chuyến đi cho tour nguồn Laravel — `plans[].content` là HTML thô
 * (CMS output), khác cấu trúc sáng/trưa/chiều/tối của TourScheduleAccordion (NestJS)
 * nên tách component riêng. Giữ cùng khung Card + Accordion để đồng nhất UI.
 */
export function TourScheduleHtmlAccordion({ plans }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();

  if (!plans?.length) return null;

  const bodyColor = isDark ? "#CBD5E1" : "#334155";

  return (
    <Card className="mt-4">
      <View className="flex-row items-center mb-1">
        <Ionicons name="map-outline" size={20} color={isDark ? "#F8FAFC" : "#0F172A"} />
        <Text
          className={`ml-2 font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}
          style={{ fontSize: FONT_SIZE.xs }}
        >
          Lịch trình chuyến đi
        </Text>
      </View>

      <View className="mt-2">
        {plans.map((plan, i) => {
          const meals = (plan.eats ?? []).map((slug) => EAT_LABELS[slug] ?? slug);
          const vehicles = (plan.main_vehicles ?? []).map(
            (slug) => VEHICLE_LABELS[slug] ?? slug,
          );
          return (
            <Accordion
              key={`${plan.day}-${i}`}
              title={`Ngày ${plan.day}: ${plan.title}`}
              number={Number(plan.day) || i + 1}
              defaultOpen={i === 0}
            >
              {(meals.length > 0 || vehicles.length > 0) && (
                <View className="flex-row flex-wrap mb-2">
                  {vehicles.map((v, idx) => (
                    <View
                      key={`veh-${idx}`}
                      className={`flex-row items-center px-3 py-1.5 mr-2 mb-2 rounded-full ${
                        isDark ? "bg-blue-950/40 border border-blue-900" : "bg-blue-50 border border-blue-100"
                      }`}
                    >
                      <Ionicons name="car-outline" size={12} color={isDark ? "#93C5FD" : "#2563EB"} />
                      <Text
                        className={`ml-1 font-semibold ${isDark ? "text-blue-300" : "text-blue-600"}`}
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        {v}
                      </Text>
                    </View>
                  ))}
                  {meals.map((m, idx) => (
                    <View
                      key={`meal-${idx}`}
                      className={`flex-row items-center px-3 py-1.5 mr-2 mb-2 rounded-full ${
                        isDark ? "bg-red-950/40 border border-red-900" : "bg-red-50 border border-red-100"
                      }`}
                    >
                      <Ionicons name="restaurant-outline" size={12} color={isDark ? "#FDA4AF" : "#DC2626"} />
                      <Text
                        className={`ml-1 font-semibold ${isDark ? "text-red-300" : "text-red-600"}`}
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        {m}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <RenderHTML
                contentWidth={width - 88}
                source={{ html: plan.content || "" }}
                baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.xs }}
                defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
                tagsStyles={{
                  p: { margin: 0, marginBottom: 10, fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 22 },
                  li: { fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 22 },
                  strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
                }}
              />
            </Accordion>
          );
        })}
      </View>
    </Card>
  );
}
