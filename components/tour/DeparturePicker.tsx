// components/tour/DeparturePicker.tsx
import { Card } from "@/components/ui/Card";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { formatCurrency } from "@/helper/format";
import {
  Departure,
  // extractDepartures, getDeparturesByTour, // NestJS — comment lại, Tour Detail đã chuyển sang Laravel
  sortUpcoming,
} from "@/services/departure";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "@/components/CustomAlert";

const formatChipDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}`;
};

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const formatWeekday = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "" : WEEKDAYS[d.getDay()];
};

// Hàng ô ngày trượt ngang: luôn thấy 3 ô rưỡi — ô thứ 4 bị cắt nửa ở mép thẻ để khách biết còn ngày
// phía sau, không cần thêm dòng chữ/chấm gợi ý (tiết kiệm chiều dài trang).
const CHIP_GAP = 10;
const VISIBLE_CHIPS = 3.5;
/** Padding của Card (p-4) — hàng ô tràn ra sát mép phải thẻ. */
const CARD_PADDING = 16;

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

function SummaryRow({
  label,
  value,
  valueClassName,
  isDark,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  isDark: boolean;
}) {
  return (
    <View className="flex-row justify-between" style={{ gap: 10 }}>
      <Text style={{ fontSize: FONT_SIZE.card }} className={isDark ? "text-slate-400" : "text-slate-500"}>
        {label}
      </Text>
      <Text
        style={{ fontSize: FONT_SIZE.card, flexShrink: 1, textAlign: "right" }}
        className={valueClassName ?? `font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}
      >
        {value}
      </Text>
    </View>
  );
}

interface DeparturePickerProps {
  /**
   * Danh sách đợt khởi hành đã có sẵn từ tour detail (Laravel `tour_days[]` đã map
   * — xem services/tour.ts). Trước đây component tự fetch qua tourId (NestJS); giờ
   * Tour Detail đã chuyển sang Laravel nên không còn endpoint departures riêng.
   */
  departures: Departure[];
  tourName: string;
  selected: Departure | null;
  onSelect: (departure: Departure) => void;
}

export function DeparturePicker({
  departures: allDepartures,
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
  const [rowWidth, setRowWidth] = useState(0);
  const chipWidth = rowWidth > 0 ? (rowWidth - CHIP_GAP * Math.floor(VISIBLE_CHIPS)) / VISIBLE_CHIPS : 88;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "confirm">("warning");

  useEffect(() => {
    // NestJS (comment lại — Tour Detail đã chuyển sang Laravel):
    // let active = true;
    // (async () => {
    //   try {
    //     setLoading(true);
    //     const res = await getDeparturesByTour(tourId);
    //     const upcoming = sortUpcoming(extractDepartures(res));
    //     if (active) setDepartures(upcoming);
    //   } catch (error) {
    //     console.error("Lỗi tải ngày khởi hành:", error);
    //     if (active) setDepartures([]);
    //   } finally {
    //     if (active) setLoading(false);
    //   }
    // })();
    // return () => { active = false; };
    setDepartures(sortUpcoming(allDepartures ?? []));
    setLoading(false);
  }, [allDepartures]);

  const handlePress = (dep: Departure) => {
    if (dep.availableSeats <= 0) {
      setSoldOutDate(dep.departureDate);
      setAlertTitle("Hết chỗ");
      setAlertMessage(`Tour "${tourName}" vào ngày ${formatFullDate(dep.departureDate)} đã hết chỗ. Xin vui lòng chọn ngày khác.`);
      setAlertType("error");
      setAlertVisible(true);
      return;
    }
    setSoldOutDate(null);
    onSelect(dep);
  };

  const labelClass = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <Card className="mt-5">
      <View className="flex-row items-center justify-between mb-3.5">
        <Text
          style={{ fontSize: FONT_SIZE.md }}
          className={`font-black ${isDark ? "text-slate-100" : "text-slate-900"}`}
        >
          Ngày khởi hành
        </Text>
        {departures.length > 0 && (
          <Text style={{ fontSize: FONT_SIZE.card }} className={labelClass}>
            {departures.length} đợt
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="small"
          color={isDark ? "#94A3B8" : "#D0021B"}
          style={{ paddingVertical: 16 }}
        />
      ) : departures.length === 0 ? (
        <Text style={{ fontSize: FONT_SIZE.xs }} className={labelClass}>
          Hiện chưa có lịch khởi hành. Vui lòng liên hệ tổng đài để được tư vấn.
        </Text>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            onLayout={(e) => setRowWidth(e.nativeEvent.layout.width)}
            style={{ marginRight: -CARD_PADDING }}
            contentContainerStyle={{ paddingVertical: 4, paddingRight: CARD_PADDING, gap: CHIP_GAP }}
          >
            {departures.map((dep) => {
              const soldOut = dep.availableSeats <= 0;
              const isSelected = selected?.id === dep.id;
              return (
                <TouchableOpacity
                  key={dep.id}
                  activeOpacity={0.8}
                  onPress={() => handlePress(dep)}
                  className={`rounded-2xl px-1.5 py-2.5 items-center ${
                    isSelected
                      ? isDark
                        ? "border-2 border-[#F87171] bg-[#3A1D22]"
                        : "border-2 border-[#D0021B] bg-[#FFF6F7]"
                      : soldOut
                        ? isDark
                          ? "border border-slate-700 bg-slate-800/40"
                          : "border border-slate-200 bg-slate-100"
                        : isDark
                          ? "border border-slate-700 bg-slate-800"
                          : "border border-slate-200 bg-slate-50"
                  }`}
                  style={{ width: chipWidth }}
                >
                  <Text
                    style={{ fontSize: FONT_SIZE.card }}
                    className={`font-bold ${
                      isSelected ? (isDark ? "text-[#F87171]" : "text-[#D0021B]") : labelClass
                    }`}
                  >
                    {soldOut ? "HẾT CHỖ" : formatWeekday(dep.departureDate)}
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.lg,
                      lineHeight: 26,
                      textDecorationLine: soldOut ? "line-through" : "none",
                    }}
                    className={`font-black ${
                      soldOut ? "text-slate-400" : isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    {formatChipDate(dep.departureDate)}
                  </Text>
                  {/* Năm đã có ở bảng bên dưới — dòng này ghi số chỗ còn lại */}
                  <Text
                    style={{ fontSize: FONT_SIZE.card }}
                    className={soldOut ? "text-slate-400" : isDark ? "text-slate-400" : "text-slate-500"}
                    numberOfLines={1}
                  >
                    {soldOut ? "—" : `Còn ${dep.availableSeats}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Inline sold-out message */}
          {soldOutDate && (
            <Text
              style={{ fontSize: FONT_SIZE.card, color: "#e74c3c" }}
              className="mt-2 font-semibold"
            >
              Tour "{tourName}" vào ngày {formatFullDate(soldOutDate)} đã hết chỗ, xin vui lòng chọn ngày khác
            </Text>
          )}

          <View
            className={`mt-3.5 rounded-2xl p-3.5 ${isDark ? "bg-slate-800/60" : "bg-slate-50"}`}
            style={{ gap: 8 }}
          >
            {selected ? (
              <>
                <SummaryRow
                  isDark={isDark}
                  label="Khởi hành"
                  value={`${formatWeekday(selected.departureDate)}, ${formatFullDate(selected.departureDate)}`}
                />
                {selected.returnDate ? (
                  <SummaryRow
                    isDark={isDark}
                    label="Ngày về"
                    value={`${formatWeekday(selected.returnDate)}, ${formatFullDate(selected.returnDate)}`}
                  />
                ) : null}
                <SummaryRow
                  isDark={isDark}
                  label="Chỗ trống"
                  value={`Còn ${selected.availableSeats} chỗ`}
                  valueClassName={`font-bold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
                />
                <SummaryRow
                  isDark={isDark}
                  label="Giá"
                  value={`${formatCurrency(selected.price)} / người`}
                  valueClassName={`font-black ${isDark ? "text-[#F87171]" : "text-[#D0021B]"}`}
                />
              </>
            ) : (
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Ionicons name="hand-left-outline" size={18} color={isDark ? "#94A3B8" : "#64748B"} />
                <Text style={{ fontSize: FONT_SIZE.card }} className={`flex-1 ${labelClass}`}>
                  Chọn một ngày ở trên để xem ngày về, số chỗ và giá.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </Card>
  );
}
