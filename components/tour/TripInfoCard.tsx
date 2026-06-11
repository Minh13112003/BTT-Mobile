import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
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
      className={`flex-row items-center justify-between py-2.5 ${
        top ? (isDark ? "border-t border-[#232938]" : "border-t border-slate-100") : ""
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={icon}
          size={15}
          color={isDark ? "#7E8597" : "#94A3B8"}
          style={{ marginRight: 7 }}
        />
        <Text
          className={`text-base font-semibold ${
            isDark ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {label}
        </Text>
      </View>
      <Text
        className={`text-base font-bold text-right max-w-[180px] ${
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
 * departureFrom, transport, included[] (✓), notIncluded[] (•) and notes.
 */
export function TripInfoCard({ tour }: { tour: TourDetail }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const subClass = `text-base font-black uppercase tracking-wide mt-4 mb-2 ${
    isDark ? "text-slate-300" : "text-slate-600"
  }`;
  const bodyClass = `flex-1 text-base leading-5 ${
    isDark ? "text-slate-300" : "text-slate-600"
  }`;

  return (
    <Card className="mt-4">
      <SectionTitle title="Thông tin chuyến đi" />

      <InfoRow icon="location-outline" label="Nơi khởi hành" value={tour.departureFrom} isDark={isDark} />
      <InfoRow icon="bus-outline" label="Phương tiện" value={tour.transport} top isDark={isDark} />

      {tour.included?.length ? (
        <>
          <Text className={subClass}>Dịch vụ bao gồm</Text>
          {tour.included.map((item, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Ionicons
                name="checkmark-circle"
                size={15}
                color={isDark ? "#4CAF50" : "#16A34A"}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text className={bodyClass}>{item}</Text>
            </View>
          ))}
        </>
      ) : null}

      {tour.notIncluded?.length ? (
        <>
          <Text className={subClass}>Chưa bao gồm</Text>
          {tour.notIncluded.map((item, i) => (
            <View key={i} className="flex-row items-start py-1">
              <Text style={{ color: "#E5953B", fontWeight: "900", marginRight: 9, lineHeight: 18 }}>•</Text>
              <Text className={bodyClass}>{item}</Text>
            </View>
          ))}
        </>
      ) : null}

      {tour.notes ? (
        <View
          className={`mt-3.5 rounded-xl p-3 ${isDark ? "bg-amber-500/10" : "bg-amber-50"}`}
          style={{ borderLeftWidth: 3, borderLeftColor: "#F59E0B" }}
        >
          <Text
            className={`text-base italic leading-5 ${
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
