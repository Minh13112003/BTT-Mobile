import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { TourDetail } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function InfoRow({
  icon,
  label,
  value,
  top,
  isDark,
}: {
  icon: IconName;
  label: string;
  value?: string;
  top?: boolean;
  isDark: boolean;
}) {
  if (!value) return null;
  return (
    <View
      className={`flex-row items-start justify-between py-2.5 ${
        top
          ? isDark
            ? "border-t border-[#232938]"
            : "border-t border-slate-100"
          : ""
      }`}
    >
      <View className="flex-row items-center flex-shrink-0">
        <Ionicons
          name={icon}
          size={15}
          color={isDark ? "#7E8597" : "#94A3B8"}
          style={{ marginRight: 7 }}
        />
        <Text
          style={{ fontSize: FONT_SIZE.xs }}
          className={`font-semibold ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {label}
        </Text>
      </View>
      <Text
        style={{ fontSize: FONT_SIZE.xs, marginLeft: 12 }}
        className={`flex-1 font-bold text-right ${
          isDark ? "text-slate-100" : "text-slate-800"
        }`}
      >
        {value}
      </Text>
    </View>
  );
}

/**
 * "THÔNG TIN CHUYẾN ĐI" — dynamic trip data mapped from the API:
 * departureFrom, transport, notes. "Dịch vụ bao gồm/Chưa bao gồm" đã chuyển sang
 * card riêng PriceIncludedCard (Tour Detail nguồn Laravel) — không còn ở đây.
 */
export function TripInfoCard({ tour }: { tour: TourDetail }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Card className="mt-4">
      <SectionTitle title="Thông tin chuyến đi" />

      <InfoRow
        icon="location-outline"
        label="Nơi khởi hành"
        value={tour.departureFrom}
        isDark={isDark}
      />
      <InfoRow
        icon="bus-outline"
        label="Phương tiện"
        value={tour.transport}
        top
        isDark={isDark}
      />

      {tour.notes ? (
        <View
          className={`mt-3.5 rounded-xl p-3 ${isDark ? "bg-amber-500/10" : "bg-amber-50"}`}
          style={{ borderLeftWidth: 3, borderLeftColor: "#F59E0B" }}
        >
          <Text
            style={{ fontSize: FONT_SIZE.card, lineHeight: 22 }}
            className={`italic ${
              isDark ? "text-amber-200" : "text-amber-700"
            }`}
          >
            Lưu ý riêng: {tour.notes}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
