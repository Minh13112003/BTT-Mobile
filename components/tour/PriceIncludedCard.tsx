import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { splitTopLevelListItems } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import RenderHTML from "react-native-render-html";

interface Props {
  /** HTML thô `<ul><li>...</li></ul>` — field `tour_price_included` (Laravel). */
  priceIncluded?: string;
  /** HTML thô `<ul><li>...</li></ul>` — field `tour_price_not_included` (Laravel). */
  priceNotIncluded?: string;
}

/**
 * "DỊCH VỤ BAO GỒM / CHƯA BAO GỒM" — card riêng cho tour nguồn Laravel, tách khỏi
 * điều khoản (TermsHtmlAccordion) và khỏi TripInfoCard (đã bỏ 2 mục này ở đó để
 * tránh trùng lặp). Mỗi `<li>` cấp ngoài cùng được tách ra
 * ({@link splitTopLevelListItems}) để gắn icon tick xanh (bao gồm) / x đỏ (không
 * bao gồm). Nội dung `<li>` vẫn có thể chứa HTML lồng (vd `<strong>`, `<ul>` con)
 * nên mỗi dòng render qua RenderHTML thay vì text thuần.
 */
export function PriceIncludedCard({ priceIncluded, priceNotIncluded }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();

  const rawIncludedItems = priceIncluded?.trim() ? splitTopLevelListItems(priceIncluded) : [];
  const notIncludedItems = priceNotIncluded?.trim()
    ? splitTopLevelListItems(priceNotIncluded)
    : [];

  // VAT thường nằm ở cuối danh sách "bao gồm" nên duyệt ngược từ cuối lên cho nhanh.
  // Chuẩn hoá nguyên dòng đó thành "Bao gồm VAT" thay vì giữ chi tiết % / điều kiện gốc.
  const includedItems = [...rawIncludedItems];
  for (let i = includedItems.length - 1; i >= 0; i--) {
    if (/vat/i.test(includedItems[i])) {
      includedItems[i] = "Bao gồm VAT";
      break;
    }
  }

  if (includedItems.length === 0 && notIncludedItems.length === 0) return null;

  const bodyColor = isDark ? "#CBD5E1" : "#334155";
  const subClass = `font-black uppercase tracking-wide mt-4 mb-2 ${
    isDark ? "text-slate-300" : "text-slate-600"
  }`;
  // Card padding (16) + icon (15) + its margin (8) — matches TripInfoCard's row layout.
  const rowContentWidth = width - 40 - 16 * 2 - 15 - 8;

  const htmlProps = {
    baseStyle: { color: bodyColor, fontSize: FONT_SIZE.xs },
    defaultTextProps: { textBreakStrategy: "simple" as const, allowFontScaling: false },
    tagsStyles: {
      p: { margin: 0, fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 24 },
      li: { fontSize: FONT_SIZE.xs, color: bodyColor, lineHeight: 24 },
      strong: { fontWeight: "700" as const, color: isDark ? "#F8FAFC" : "#0F172A" },
    },
  };

  return (
    <Card className="mt-4">
      <SectionTitle title="Dịch vụ tour" />

      {includedItems.length > 0 && (
        <>
          <Text style={{ fontSize: FONT_SIZE.xs }} className={subClass}>
            Dịch vụ bao gồm
          </Text>
          {includedItems.map((html, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={isDark ? "#4CAF50" : "#16A34A"}
                style={{ marginRight: 8, marginTop: 3 }}
              />
              <View style={{ flex: 1 }}>
                <RenderHTML contentWidth={rowContentWidth} source={{ html }} {...htmlProps} />
              </View>
            </View>
          ))}
        </>
      )}

      {notIncludedItems.length > 0 && (
        <>
          <Text style={{ fontSize: FONT_SIZE.xs }} className={subClass}>
            Chưa bao gồm
          </Text>
          {notIncludedItems.map((html, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Ionicons
                name="close-circle"
                size={15}
                color={isDark ? "#F87171" : "#DC2626"}
                style={{ marginRight: 8, marginTop: 3 }}
              />
              <View style={{ flex: 1 }}>
                <RenderHTML contentWidth={rowContentWidth} source={{ html }} {...htmlProps} />
              </View>
            </View>
          ))}
        </>
      )}
    </Card>
  );
}
