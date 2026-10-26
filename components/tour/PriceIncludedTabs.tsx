import { toIncludedItems } from "@/components/tour/PriceIncludedCard";
import { Card } from "@/components/ui/Card";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { splitTopLevelListItems } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

/** HTML không phải `<ul><li>` (vài tour viết bằng `<p>`) thì giữ nguyên thành 1 dòng. */
function toItems(html?: string): string[] {
  if (!html?.trim()) return [];
  const items = splitTopLevelListItems(html);
  return items.length > 0 ? items : [html];
}

/**
 * "Dịch vụ tour" dạng 2 tab cho trang chi tiết tour (Laravel): "Bao gồm (n)" /
 * "Chưa bao gồm (n)" — chỉ hiện 1 danh sách mỗi lúc (tick xanh / x đỏ).
 * PriceIncludedCard (hiện cả 2 danh sách liền nhau) vẫn dùng ở detailTour.tsx.
 */
export function PriceIncludedTabs({
  priceIncluded,
  priceNotIncluded,
}: {
  priceIncluded?: string;
  priceNotIncluded?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();

  const included = toIncludedItems(priceIncluded);
  const includedItems = included.length > 0 ? included : toItems(priceIncluded);
  const notIncludedItems = toItems(priceNotIncluded);
  const [tab, setTab] = useState<"inc" | "exc">(includedItems.length > 0 ? "inc" : "exc");

  if (includedItems.length === 0 && notIncludedItems.length === 0) return null;

  const items = tab === "inc" ? includedItems : notIncludedItems;
  const bodyColor = isDark ? "#CBD5E1" : "#334155";

  const tabs: { key: "inc" | "exc"; label: string; count: number; color: string }[] = [
    { key: "inc", label: "Bao gồm", count: includedItems.length, color: isDark ? "#4ADE80" : "#166534" },
    { key: "exc", label: "Chưa bao gồm", count: notIncludedItems.length, color: isDark ? "#FCA5A5" : "#991B1B" },
  ];

  return (
    <Card className="mt-4">
      <Text
        style={{ fontSize: FONT_SIZE.md }}
        className={`font-black mb-3.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}
      >
        Dịch vụ tour
      </Text>

      <View
        className={`flex-row rounded-2xl p-1 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}
        style={{ gap: 4 }}
      >
        {tabs.map((t) => {
          const active = t.key === tab;
          return (
            <TouchableOpacity
              key={t.key}
              activeOpacity={0.8}
              disabled={t.count === 0}
              onPress={() => setTab(t.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active, disabled: t.count === 0 }}
              className={`flex-1 rounded-xl items-center justify-center ${
                active ? (isDark ? "bg-slate-600" : "bg-white") : ""
              }`}
              style={[
                { minHeight: 44, opacity: t.count === 0 ? 0.5 : 1 },
                active && !isDark
                  ? {
                      shadowColor: "#0F172A",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                      elevation: 2,
                    }
                  : null,
              ]}
            >
              <Text
                style={{ fontSize: FONT_SIZE.card, color: active ? t.color : isDark ? "#94A3B8" : "#64748B" }}
                className={active ? "font-bold" : "font-semibold"}
              >
                {t.label} ({t.count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View className="mt-3.5" style={{ gap: 10 }}>
        {items.map((html, i) => (
          <View key={`${tab}-${i}`} className="flex-row items-start" style={{ gap: 10 }}>
            <Ionicons
              name={tab === "inc" ? "checkmark" : "close"}
              size={20}
              color={tab === "inc" ? (isDark ? "#4ADE80" : "#16A34A") : isDark ? "#F87171" : "#DC2626"}
              style={{ marginTop: 2 }}
            />
            <View style={{ flex: 1 }}>
              <RenderHTML
                // Màn hình − lề trang (32) − padding Card (32) − icon (20) − khoảng cách (10).
                contentWidth={width - 94}
                source={{ html }}
                baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.card, lineHeight: 24 }}
                defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
                tagsStyles={{
                  p: { margin: 0, fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24 },
                  li: { fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24 },
                  strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
                }}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}
