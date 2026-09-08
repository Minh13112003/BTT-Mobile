import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { splitTopLevelListItems } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

interface Props {
  /** HTML thô `<ul><li>...</li></ul>` — field `featured_description` (Laravel). */
  featuredDescription?: string;
}

/**
 * "ĐIỂM NỔI BẬT" — card riêng cho tour nguồn Laravel (field `featured_description`),
 * đặt giữa TourHero và Lịch trình chuyến đi. Không phải tour nào cũng có field này
 * (vd tour trong nước thường rỗng) — ẩn hẳn card khi không có dữ liệu.
 */
export function FeaturedHighlightsCard({ featuredDescription }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();

  const items = featuredDescription?.trim() ? splitTopLevelListItems(featuredDescription) : [];
  if (items.length === 0) return null;

  const bodyColor = isDark ? "#CBD5E1" : "#334155";
  const rowContentWidth = width - 40 - 16 * 2 - 15 - 8;

  return (
    <Card className="mt-4">
      <SectionTitle title="Điểm nổi bật" />
      {items.map((html, i) => (
        <View key={i} className="flex-row items-start py-1">
          <Ionicons
            name="sparkles"
            size={14}
            color={isDark ? "#FBBF24" : "#D97706"}
            style={{ marginRight: 9, marginTop: 4 }}
          />
          <View style={{ flex: 1 }}>
            <RenderHTML
              contentWidth={rowContentWidth}
              source={{ html }}
              baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.xs }}
              defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
              tagsStyles={{
                p: { margin: 0, fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 24 },
                i: { fontStyle: "italic", color: bodyColor },
                strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
              }}
            />
          </View>
        </View>
      ))}
    </Card>
  );
}
