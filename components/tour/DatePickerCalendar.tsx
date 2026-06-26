import { FONT_SIZE } from "@/constants/typography";
import React, { useState, useMemo } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/Theme_Context";

interface DatePickerCalendarProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateString: string) => void; // Format: YYYY-MM-DD
  selectedDate?: string; // Format: YYYY-MM-DD
  title?: string;
}

const WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function DatePickerCalendar({
  visible,
  onClose,
  onSelectDate,
  selectedDate,
  title = "Chọn ngày khởi hành",
}: DatePickerCalendarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State to track currently viewed month
  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      const parsed = new Date(selectedDate);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // Day of week for 1st of month (0-6)
    const totalDays = new Date(year, month + 1, 0).getDate(); // Days in current month

    const days: Array<{ day: number | null; dateString: string | null }> = [];

    // Padding empty cells for days before the 1st
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, dateString: null });
    }

    // Actual day cells
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(month + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      days.push({
        day: d,
        dateString: `${year}-${monthStr}-${dayStr}`,
      });
    }

    return days;
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDay = (dateStr: string) => {
    onSelectDate(dateStr);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.calendarBox,
            {
              backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
              borderColor: isDark ? "#334155" : "#E2E8F0",
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: FONT_SIZE.xl },
              ]}
            >
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? "#94A3B8" : "#64748B"}
              />
            </TouchableOpacity>
          </View>

          {/* Month Navigator */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? "#F8FAFC" : "#0F172A"}
              />
            </TouchableOpacity>

            <Text
              style={[
                styles.monthLabel,
                { color: isDark ? "#F8FAFC" : "#0F172A", fontSize: FONT_SIZE.xs },
              ]}
            >
              Tháng {month + 1} / {year}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#F8FAFC" : "#0F172A"}
              />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdaysContainer}>
            {WEEKDAYS.map((day, i) => (
              <Text
                key={i}
                style={[
                  styles.weekdayText,
                  { color: isDark ? "#64748B" : "#94A3B8", fontSize: FONT_SIZE.card },
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarDays.map((item, idx) => {
              const isSelected = item.dateString === selectedDate;
              return (
                <TouchableOpacity
                  key={idx}
                  disabled={!item.day}
                  onPress={() => item.dateString && handleSelectDay(item.dateString)}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                  ]}
                >
                  {item.day ? (
                    <Text
                      style={[
                        styles.dayText,
                        { color: isDark ? "#CBD5E1" : "#334155", fontSize: FONT_SIZE.xs },
                        isSelected && styles.selectedDayText,
                      ]}
                    >
                      {item.day}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  } as ViewStyle,
  calendarBox: {
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  } as ViewStyle,
  title: {
    fontWeight: "800",
  } as TextStyle,
  closeBtn: {
    padding: 4,
  } as ViewStyle,
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 8,
  } as ViewStyle,
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  monthLabel: {
    fontWeight: "700",
  } as TextStyle,
  weekdaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  } as ViewStyle,
  weekdayText: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontWeight: "600",
  } as TextStyle,
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 8,
  } as ViewStyle,
  dayCell: {
    width: `${100 / 7}%`,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  } as ViewStyle,
  selectedDayCell: {
    backgroundColor: "#D0021B", // Brand Red
  } as ViewStyle,
  dayText: {
    fontWeight: "600",
  } as TextStyle,
  selectedDayText: {
    color: "#FFFFFF",
    fontWeight: "800",
  } as TextStyle,
});
