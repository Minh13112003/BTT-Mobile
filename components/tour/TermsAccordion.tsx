import { Accordion } from "@/components/ui/Accordion";
import { TOUR_TERMS } from "@/constants/tourTerms";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import React from "react";
import { Text, View } from "react-native";

/** "ĐIỀU KHOẢN & LƯU Ý CHUNG" — static policy content rendered as accordions. */
export function TermsAccordion() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="mt-2">
      {TOUR_TERMS.map((section, i) => (
        <Accordion key={i} title={section.title} number={i + 1} defaultOpen={i === 0}>
          {section.items.map((item, j) => (
            <View key={j} className="flex-row items-start py-1">
              <Text style={{ color: "#E5953B", marginRight: 8, fontSize: FONT_SIZE.xs, lineHeight: 24 }}>•</Text>
              <Text
                style={{ fontSize: FONT_SIZE.xs, lineHeight: 24 }}
                className={`flex-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                {item}
              </Text>
            </View>
          ))}
        </Accordion>
      ))}
    </View>
  );
}
