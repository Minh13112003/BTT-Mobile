import GuestFields from "@/components/guest/GuestFields";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import type { CheckoutGuests } from "@/hooks/useCheckoutGuests";
import { isoToDmy } from "@/utils/guest";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface Props {
  state: CheckoutGuests;
  adults: number;
  children: number;
  isForeign: boolean;
}

const typeLabel = (i: number, adults: number, children: number) =>
  i < adults ? "Người lớn" : i < adults + children ? "Trẻ em" : "Em bé";

/** Mục "Thông tin hành khách" ở màn thanh toán: mỗi khách một thẻ. */
export default function GuestSection({ state, adults, children, isForeign }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const { guests, picked, saveFlags, relatives, relativesError, update, pick, setSave } = state;
  const [pickerFor, setPickerFor] = useState<number | null>(null);

  const textMain = isDark ? "text-slate-100" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <View className="mt-6">
      <Text className={`font-black uppercase tracking-wider mb-3 ${textMain}`} style={{ fontSize: FONT_SIZE.lg }}>
        Thông tin hành khách
      </Text>

      <View
        className={`flex-row rounded-2xl p-3.5 mb-3 border ${isDark ? "bg-amber-500/10 border-amber-400/20" : "bg-[#FFF7E6] border-[#F5DDA4]"}`}
        style={{ gap: 10 }}
      >
        <Ionicons name="information-circle-outline" size={20} color={isDark ? "#FBBF24" : "#7A4B00"} />
        <Text className="flex-1 leading-6" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FDE68A" : "#7A4B00" }}>
          {isForeign
            ? "Tour nước ngoài: mỗi hành khách phải có số hộ chiếu và số visa. Họ tên nhập đúng như trên giấy tờ."
            : "Nhập đúng thông tin trên giấy tờ để xuất vé và mua bảo hiểm. Hộ chiếu và visa là tuỳ chọn với tour trong nước."}
        </Text>
      </View>

      {guests.map((g, i) => (
        <View
          key={i}
          className={`rounded-[24px] p-5 mb-3 border ${isDark ? "bg-slate-800/90 border-slate-700/60" : "bg-white border-slate-100"}`}
        >
          <View className="flex-row items-center mb-4">
            <View className="items-center justify-center mr-2.5" style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: isDark ? "#E2E8F0" : "#1A1A2E" }}>
              <Text className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#1A1A2E" : "#FFFFFF" }}>
                {i + 1}
              </Text>
            </View>
            <Text className={`font-bold flex-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
              Khách {i + 1} · {typeLabel(i, adults, children)}
            </Text>
            {i === 0 && (
              <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: isDark ? "#3A1B20" : "#FDECEE" }}>
                <Text className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FF8A96" : "#B30118" }}>
                  Người đặt tour
                </Text>
              </View>
            )}
          </View>

          {i > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setPickerFor(i)}
              className={`h-12 rounded-2xl flex-row items-center justify-between px-4 mb-4 border-2 ${isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}
            >
              <Text className={picked[i] ? `font-semibold ${textMain}` : textMuted} style={{ fontSize: FONT_SIZE.xxs }} numberOfLines={1}>
                {picked[i] ? `Từ thân nhân: ${g.fullName}` : "Chọn từ thân nhân"}
              </Text>
              <Ionicons name="chevron-down" size={18} color={isDark ? "#94A3B8" : "#A3A8B5"} />
            </TouchableOpacity>
          )}
          {i === 0 && (
            <Text className={`mb-3 leading-5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Tự điền từ Thông tin cá nhân, bạn có thể chỉnh lại cho riêng chuyến này.
            </Text>
          )}

          <GuestFields value={g} onChange={(p) => update(i, p)} requirePhone={i === 0} requireVisa={isForeign} />

          {i > 0 && !picked[i] && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSave(i, !saveFlags[i])}
              className="flex-row items-center"
              style={{ minHeight: 44 }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: !!saveFlags[i] }}
            >
              <View
                className="items-center justify-center mr-3"
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 8,
                  backgroundColor: saveFlags[i] ? "#D0021B" : "transparent",
                  borderWidth: saveFlags[i] ? 0 : 2,
                  borderColor: isDark ? "#475569" : "#CBD5E1",
                }}
              >
                {saveFlags[i] && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
              </View>
              <Text className={`font-semibold flex-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                Lưu vào danh sách thân nhân
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Chọn thân nhân */}
      <Modal visible={pickerFor !== null} transparent animationType="slide" onRequestClose={() => setPickerFor(null)}>
        <Pressable onPress={() => setPickerFor(null)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <Pressable
            onPress={() => {}}
            className={`rounded-t-[28px] px-4 pt-4 pb-8 ${isDark ? "bg-slate-900" : "bg-white"}`}
            style={{ maxHeight: "75%" }}
          >
            <View className="flex-row items-center mb-3">
              <Text className={`font-black flex-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
                Chọn thân nhân
              </Text>
              <TouchableOpacity onPress={() => setPickerFor(null)} accessibilityLabel="Đóng" style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name="close" size={24} color={isDark ? "#CBD5E1" : "#64748B"} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {pickerFor !== null && picked[pickerFor] && (
                <TouchableOpacity
                  onPress={() => {
                    pick(pickerFor, null);
                    setPickerFor(null);
                  }}
                  className={`rounded-2xl p-4 mb-2 border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                >
                  <Text className={`font-semibold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                    Nhập thông tin người khác
                  </Text>
                </TouchableOpacity>
              )}
              {relativesError && (
                <Text className={`mb-2 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Không tải được danh sách thân nhân. Bạn vẫn có thể nhập tay.
                </Text>
              )}
              {relatives.length === 0 && !relativesError && (
                <Text className={`mb-2 leading-6 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Chưa có thân nhân. Bạn có thể nhập tay rồi tick “Lưu vào danh sách thân nhân”, hoặc thêm ở Tài khoản › Thân nhân.
                </Text>
              )}
              {relatives.map((r) => {
                const usedBy = picked.findIndex((id, idx) => id === r.id && idx !== pickerFor);
                const disabled = usedBy >= 0;
                return (
                  <TouchableOpacity
                    key={r.id}
                    disabled={disabled}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (pickerFor !== null) pick(pickerFor, r);
                      setPickerFor(null);
                    }}
                    className={`rounded-2xl p-4 mb-2 border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                    style={{ opacity: disabled ? 0.45 : 1 }}
                  >
                    <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xxs }}>
                      {r.fullName}
                    </Text>
                    <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
                      {isoToDmy(r.dateOfBirth)}
                      {disabled ? ` · đã chọn ở Khách ${usedBy + 1}` : r.passportNumber ? " · có hộ chiếu" : " · thiếu hộ chiếu"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => {
                  setPickerFor(null);
                  router.push("/(root)/(profile)/relatives" as any);
                }}
                className="mt-1 items-center justify-center"
                style={{ minHeight: 44 }}
              >
                <Text className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: "#B30118" }}>
                  Quản lý thân nhân
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
