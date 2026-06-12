// components/tour/DeparturePicker.tsx
import { SectionTitle } from "@/components/ui/SectionTitle";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { formatCurrency } from "@/helper/format";
import {
  Departure,
  extractDepartures,
  getDeparturesByTour,
  sortUpcoming,
} from "@/services/departure";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const formatChipDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}`;
};

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

interface DeparturePickerProps {
  tourId: string;
  tourName: string;
  selected: Departure | null;
  onSelect: (departure: Departure) => void;
}

export function DeparturePicker({
  tourId,
  tourName,
  selected,
  onSelect,
}: DeparturePickerProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  // Inline "hết chỗ" message for the last sold-out chip the user tapped.
  const [soldOutDate, setSoldOutDate] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getDeparturesByTour(tourId);
        const upcoming = sortUpcoming(extractDepartures(res));
        if (active) setDepartures(upcoming);
      } catch (error) {
        console.error("Lỗi tải ngày khởi hành:", error);
        if (active) setDepartures([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tourId]);

  const handlePress = (dep: Departure) => {
    if (dep.availableSeats <= 0) {
      setSoldOutDate(dep.departureDate);
      Alert.alert(
        "Hết chỗ",
        `Tour "${tourName}" vào ngày ${formatFullDate(
          dep.departureDate,
        )} đã hết chỗ. Xin vui lòng chọn ngày khác.`,
        [{ text: "Đồng ý", style: "cancel" }],
      );
      return;
    }
    setSoldOutDate(null);
    onSelect(dep);
  };

  return (
    <View className="mt-5">
      <SectionTitle title="🗓  Chọn ngày khởi hành" />

      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? "#94A3B8" : "#E51F27"}
          style={{ paddingVertical: 16 }}
        />
      ) : departures.length === 0 ? (
        <Text
          style={{ fontSize: FONT_SIZE.xs }}
          className={`py-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
        >
          Hiện chưa có lịch khởi hành. Vui lòng liên hệ tổng đài để được tư vấn.
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4, paddingRight: 8 }}
          >
            {departures.map((dep) => {
              const soldOut = dep.availableSeats <= 0;
              const isSelected = selected?.id === dep.id;
              return (
                <TouchableOpacity
                  key={dep.id}
                  activeOpacity={0.8}
                  onPress={() => handlePress(dep)}
                  className={`mr-3 rounded-2xl px-4 py-2.5 border-2 items-center ${
                    soldOut
                      ? isDark
                        ? "bg-slate-800/40 border-slate-700"
                        : "bg-slate-100 border-slate-200"
                      : isSelected
                        ? "bg-[#E51F27] border-[#E51F27]"
                        : isDark
                          ? "bg-slate-800 border-slate-700"
                          : "bg-white border-slate-200"
                  }`}
                >
                  <Text
                    style={{
                      fontSize: FONT_SIZE.xs,
                      textDecorationLine: soldOut ? "line-through" : "none",
                    }}
                    className={`font-black ${
                      soldOut
                        ? "text-slate-400"
                        : isSelected
                          ? "text-white"
                          : isDark
                            ? "text-slate-100"
                            : "text-slate-800"
                    }`}
                  >
                    {formatChipDate(dep.departureDate)}
                  </Text>
                  <Text
                    style={{ fontSize: FONT_SIZE.xs }}
                    className={`mt-0.5 font-semibold ${
                      soldOut
                        ? "text-slate-400"
                        : isSelected
                          ? "text-white/90"
                          : isDark
                            ? "text-slate-400"
                            : "text-slate-500"
                    }`}
                  >
                    {soldOut ? "HẾT" : `${dep.availableSeats} chỗ`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Inline sold-out message */}
          {soldOutDate && (
            <Text
              style={{ fontSize: FONT_SIZE.xs, color: "#e74c3c" }}
              className="mt-2 font-semibold"
            >
              🚫 Tour "{tourName}" vào ngày {formatFullDate(soldOutDate)} đã hết
              chỗ, xin vui lòng chọn ngày khác
            </Text>
          )}

          {/* Selected departure summary */}
          {selected && (
            <View
              className={`mt-4 rounded-2xl p-4 border ${
                isDark
                  ? "bg-slate-800/60 border-slate-700"
                  : "bg-white border-slate-200"
              }`}
            >
              <Text
                style={{ fontSize: FONT_SIZE.xs }}
                className={`font-semibold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Thông tin khởi hành đã chọn:
              </Text>
              <Text
                style={{ fontSize: FONT_SIZE.xs }}
                className={`mt-1 font-bold ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                📅 {formatFullDate(selected.departureDate)} {"  |  "}👥{" "}
                {selected.availableSeats} chỗ trống
              </Text>
              <Text
                style={{ fontSize: FONT_SIZE.md }}
                className="mt-1.5 font-black text-[#E51F27]"
              >
                💰 {formatCurrency(selected.price)} / người
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
}
