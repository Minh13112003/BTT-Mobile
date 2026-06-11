import { useTheme } from "@/context/Theme_Context";
import { TourSchedule } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "../ui/Card";

interface Props {
  schedules?: TourSchedule[];
}

export function TourScheduleAccordion({ schedules }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [openMain, setOpenMain] = useState(false);
  const [openDays, setOpenDays] = useState<number[]>([]);

  if (!schedules?.length) return null;

  const toggleDay = (day: number) => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((x) => x !== day) : [...prev, day],
    );
  };

  const ItemRow = ({
    icon,
    text,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    text: string;
  }) => (
    <View className="flex-row items-start mt-3">
      <Ionicons
        name={icon}
        size={18}
        color={isDark ? "#93C5FD" : "#2563EB"}
        style={{ marginTop: 2 }}
      />

      <Text
        className={`ml-3 flex-1 leading-6 ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {text}
      </Text>
    </View>
  );

  return (
    <Card className="mt-4">
      {/* Main Accordion */}
      <TouchableOpacity
        onPress={() => setOpenMain(!openMain)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center">
          <Ionicons
            name="map-outline"
            size={20}
            color={isDark ? "#F8FAFC" : "#0F172A"}
          />

          <Text
            className={`ml-2 text-base font-black ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            Lịch trình chuyến đi
          </Text>
        </View>

        <Ionicons
          name={openMain ? "chevron-up" : "chevron-down"}
          size={20}
          color={isDark ? "#CBD5E1" : "#334155"}
        />
      </TouchableOpacity>

      {openMain &&
        schedules.map((schedule, index) => {
          const opened = openDays.includes(schedule.dayNumber);

          return (
            <View
              key={schedule.id}
              className={`mt-4 pb-4 ${
                index !== schedules.length - 1
                  ? isDark
                    ? "border-b border-slate-700"
                    : "border-b border-slate-200"
                  : ""
              }`}
            >
              {/* Day Accordion */}
              <TouchableOpacity
                onPress={() => toggleDay(schedule.dayNumber)}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-red-500 items-center justify-center">
                    <Text className="text-white font-bold text-base">
                      {schedule.dayNumber}
                    </Text>
                  </View>

                  <Text
                    className={`ml-3 font-bold text-base ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    Ngày {schedule.dayNumber}
                  </Text>
                </View>

                <Ionicons
                  name={opened ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={isDark ? "#CBD5E1" : "#334155"}
                />
              </TouchableOpacity>

              {opened && (
                <View className="mt-4">
                  {/* Title */}
                  <Text
                    className={`font-bold text-base leading-6 ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {schedule.title}
                  </Text>

                  {!!schedule.morning && (
                    <ItemRow
                      icon="sunny-outline"
                      text={`Buổi sáng: ${schedule.morning}`}
                    />
                  )}

                  {!!schedule.noon && (
                    <ItemRow
                      icon="restaurant-outline"
                      text={`Buổi trưa: ${schedule.noon}`}
                    />
                  )}

                  {!!schedule.afternoon && (
                    <ItemRow
                      icon="partly-sunny-outline"
                      text={`Buổi chiều: ${schedule.afternoon}`}
                    />
                  )}

                  {!!schedule.evening && (
                    <ItemRow
                      icon="moon-outline"
                      text={`Buổi tối: ${schedule.evening}`}
                    />
                  )}

                  {!!schedule.night && (
                    <ItemRow
                      icon="bed-outline"
                      text={`Nghỉ đêm: ${schedule.night}`}
                    />
                  )}

                  {/* Meals */}
                  {(schedule.meals ?? []).length > 0 && (
                    <View className="mt-5">
                      <View className="flex-row items-center mb-3">
                        <Ionicons
                          name="restaurant"
                          size={18}
                          color={isDark ? "#FCA5A5" : "#DC2626"}
                        />

                        <Text
                          className={`ml-2 font-semibold ${
                            isDark ? "text-slate-200" : "text-slate-700"
                          }`}
                        >
                          Bữa ăn bao gồm
                        </Text>
                      </View>

                      <View className="flex-row flex-wrap">
                        {(schedule.meals ?? []).map((meal, idx) => (
                          <View
                            key={idx}
                            className={`flex-row items-center px-3 py-2 mr-2 mb-2 rounded-full ${
                              isDark
                                ? "bg-red-950/40 border border-red-900"
                                : "bg-red-50 border border-red-100"
                            }`}
                          >
                            <Ionicons
                              name="restaurant-outline"
                              size={12}
                              color={isDark ? "#FDA4AF" : "#DC2626"}
                            />

                            <Text
                              className={`ml-1 text-base font-semibold ${
                                isDark ? "text-red-300" : "text-red-600"
                              }`}
                            >
                              {meal}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
    </Card>
  );
}
