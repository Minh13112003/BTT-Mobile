import { TERM_SECTIONS } from "@/components/tour/TermsHtmlAccordion";
import { Card } from "@/components/ui/Card";
import { ChoiceChip } from "@/components/ui/ChoiceChip";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { splitTopLevelListItems, TourTermsLaravel } from "@/services/tour";
import React, { useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import RenderHTML from "react-native-render-html";

/**
 * "Điều khoản & lưu ý" dạng lưới nút (2 cột) cho trang chi tiết tour (Laravel) — bấm 1
 * mục thì chỉ hiện nội dung mục đó. Nhãn kèm số ý lớn trong ngoặc, ví dụ "Phí phạt hủy
 * tour (7)": chỉ đếm `<li>` cấp ngoài cùng (không đếm ý con), mục chỉ có 1 ý thì không
 * ghi số. Bỏ qua mục rỗng. TermsHtmlAccordion (dạng Accordion) vẫn dùng ở detailTour.tsx.
 */
export function TermsTabs({ terms }: { terms?: TourTermsLaravel }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const sections = terms ? TERM_SECTIONS.filter((s) => terms[s.key]?.trim()) : [];
  if (!terms || sections.length === 0) return null;

  const current = sections[Math.min(index, sections.length - 1)];
  const bodyColor = isDark ? "#CBD5E1" : "#475569";

  return (
    <Card className="mt-4">
      <Text
        style={{ fontSize: FONT_SIZE.md }}
        className={`font-black mb-3.5 ${isDark ? "text-slate-100" : "text-slate-900"}`}
      >
        Điều khoản & lưu ý
      </Text>

      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {sections.map((s, i) => {
          const n = splitTopLevelListItems(terms[s.key]).length;
          return (
            <ChoiceChip
              key={s.key}
              label={n > 1 ? `${s.title} (${n})` : s.title}
              selected={s.key === current.key}
              onPress={() => setIndex(i)}
              variant="outline"
              align="left"
              style={{ width: "48.5%", minHeight: 52 }}
            />
          );
        })}
      </View>

      <View className={`mt-3.5 rounded-2xl p-3.5 ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}>
        <RenderHTML
          // Màn hình − lề trang (32) − padding Card (32) − padding khung (28).
          contentWidth={width - 92}
          source={{ html: terms[current.key] || "" }}
          baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.card, lineHeight: 24 }}
          defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
          tagsStyles={{
            p: { margin: 0, marginBottom: 8, fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24 },
            ul: { marginTop: 0, marginBottom: 0, paddingLeft: 18 },
            li: { fontSize: FONT_SIZE.card, color: bodyColor, lineHeight: 24, marginBottom: 6 },
            strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
          }}
        />
      </View>
    </Card>
  );
}
