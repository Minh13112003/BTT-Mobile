import { useTheme } from "@/context/Theme_Context";
import { TourSchedule } from "@/services/tour";
import React from "react";
import { Text, View } from "react-native";

/** Vertical day-by-day timeline for the tour itinerary. */
export function ItineraryTimeline({ items }: { items: TourSchedule[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <View className="mt-1.5 pl-1">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <View key={i} className="flex-row">
            {/* Rail: dot + connecting line */}
            <View className="items-center mr-3" style={{ width: 16 }}>
              <View
                className="w-4 h-4 rounded-full items-center justify-center border-2 border-[#D0021B]"
                style={{ backgroundColor: isDark ? "#121620" : "#F4F7FB" }}
              >
                <View className="w-1.5 h-1.5 rounded-full bg-[#D0021B]" />
              </View>
              {!last && (
                <View
                  className="flex-1 w-0.5 mt-1"
                  style={{ backgroundColor: isDark ? "#2A3142" : "#E2E8F0" }}
                />
              )}
            </View>

            {/* Content */}
            <View className={`flex-1 ${last ? "" : "pb-4"}`}>
              <Text
                className={`text-base font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}
              >
                {it.dayNumber}
                {it.title ? ` · ${it.title}` : ""}
              </Text>
              {it.meals ? (
                <View
                  className={`self-start mt-1.5 px-2 py-1 rounded-lg ${isDark ? "bg-green-500/10" : "bg-green-50"}`}
                >
                  <Text
                    className={`text-base font-bold ${isDark ? "text-[#7FE08A]" : "text-green-700"}`}
                  >
                    🍽 {it.meals}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
