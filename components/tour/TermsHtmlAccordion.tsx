import { Accordion } from "@/components/ui/Accordion";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { TourTermsLaravel } from "@/services/tour";
import React from "react";
import { View, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

interface Props {
  terms?: TourTermsLaravel;
}

export const TERM_SECTIONS: { key: keyof TourTermsLaravel; title: string }[] = [
  { key: "paymentInstructions", title: "Hướng dẫn thanh toán" },
  { key: "cancelBooking", title: "Điều kiện hủy/đổi tour" },
  { key: "cancelPenalty", title: "Phí phạt hủy tour" },
  { key: "warningNote", title: "Lưu ý quan trọng" },
  { key: "warningNoteVisa", title: "Lưu ý visa" },
];

/**
 * "ĐIỀU KHOẢN & LƯU Ý CHUNG" cho tour nguồn Laravel — nội dung là HTML thô trả về
 * từ API (`warning_note`, `cancel_booking`...), khác TermsAccordion (NestJS)
 * vốn dùng danh sách bullet tĩnh trong constants/tourTerms.ts. Bỏ qua section rỗng.
 * "Giá tour bao gồm/không bao gồm" KHÔNG còn ở đây — xem PriceIncludedCard.
 */
export function TermsHtmlAccordion({ terms }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();

  if (!terms) return null;

  const bodyColor = isDark ? "#CBD5E1" : "#334155";
  const visibleSections = TERM_SECTIONS.filter((s) => terms[s.key]?.trim());
  if (visibleSections.length === 0) return null;

  return (
    <View className="mt-2">
      {visibleSections.map((section, i) => (
        <Accordion key={section.key} title={section.title} number={i + 1} defaultOpen={i === 0}>
          <RenderHTML
            contentWidth={width - 88}
            source={{ html: terms[section.key] || "" }}
            baseStyle={{ color: bodyColor, fontSize: FONT_SIZE.xs }}
            defaultTextProps={{ textBreakStrategy: "simple", allowFontScaling: false }}
            tagsStyles={{
              p: { margin: 0, marginBottom: 8, fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 22 },
              li: { fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 22 },
              strong: { fontWeight: "700", color: isDark ? "#F8FAFC" : "#0F172A" },
            }}
          />
        </Accordion>
      ))}
    </View>
  );
}
