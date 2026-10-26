import CustomAlert from "@/components/CustomAlert";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { deleteRelative, getRelatives, MAX_RELATIVES, Relative } from "@/services/relative";
import { ageOn, isoToDmy, maskId } from "@/utils/guest";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const initialsOf = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
};

export default function RelativesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [items, setItems] = useState<Relative[] | null>(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Relative | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await getRelatives();
      setItems(res.data ?? []);
    } catch {
      setError("Không tải được danh sách thân nhân. Vui lòng thử lại.");
      setItems((prev) => prev ?? []);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await deleteRelative(toDelete.id);
      setItems((prev) => (prev ?? []).filter((r) => r.id !== toDelete.id));
      setToDelete(null);
    } catch (e: any) {
      setToDelete(null);
      setAlert({ title: "Không xoá được", message: e?.response?.data?.message || "Vui lòng thử lại sau." });
    } finally {
      setDeleting(false);
    }
  };

  const count = items?.length ?? 0;
  const full = count >= MAX_RELATIVES;
  const textMain = isDark ? "text-slate-100" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const gradientColors = isDark ? (["#1E222B", "#111318"] as const) : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#D0021B"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 flex-1 ${textMain}`}>Thân nhân</Text>
          <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
            {count}/{MAX_RELATIVES} người
          </Text>
        </View>

        {items === null ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#D0021B" />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 120 }}
          >
            <Text className={`mb-3 px-1 leading-6 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
              Lưu người hay đi cùng để lần sau đặt tour chỉ cần chọn, không phải nhập lại.
            </Text>

            {!!error && (
              <TouchableOpacity
                onPress={load}
                activeOpacity={0.8}
                className={`rounded-2xl p-3.5 mb-3 border ${isDark ? "bg-red-500/10 border-red-400/30" : "bg-red-50 border-red-100"}`}
              >
                <Text className={isDark ? "text-red-200" : "text-red-700"} style={{ fontSize: FONT_SIZE.xxs }}>
                  {error} Bấm để tải lại.
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={full}
              onPress={() => router.push("/(root)/(profile)/relative-form" as any)}
              className={`h-[52px] rounded-2xl flex-row items-center justify-center mb-3 border-[1.5px] border-dashed ${
                full
                  ? isDark
                    ? "border-slate-700 bg-slate-800/50"
                    : "border-slate-300 bg-slate-100"
                  : isDark
                    ? "border-red-400/60 bg-red-500/10"
                    : "border-[#E8A0A8] bg-[#FFF8F8]"
              }`}
            >
              <Ionicons name="add" size={20} color={full ? "#94A3B8" : "#B30118"} />
              <Text className="font-bold ml-2" style={{ fontSize: FONT_SIZE.xxs, color: full ? "#94A3B8" : "#B30118" }}>
                {full ? `Đã đủ ${MAX_RELATIVES} thân nhân` : "Thêm thân nhân"}
              </Text>
            </TouchableOpacity>

            {items.length === 0 && !error && (
              <View className={`rounded-2xl p-6 items-center border ${isDark ? "bg-slate-800/60 border-slate-700/60" : "bg-white border-slate-100"}`}>
                <Ionicons name="people-outline" size={36} color="#94A3B8" />
                <Text className={`font-bold mt-3 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
                  Chưa có thân nhân nào
                </Text>
                <Text className={`text-center mt-1 leading-6 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Thêm người đi cùng, hoặc tick “Lưu vào danh sách thân nhân” khi đặt tour.
                </Text>
              </View>
            )}

            {items.map((r) => {
              const age = ageOn(r.dateOfBirth);
              const hasPassport = !!r.passportNumber;
              return (
                <View
                  key={r.id}
                  className={`rounded-[20px] p-3.5 mb-3 border ${isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100"}`}
                >
                  <View className="flex-row items-center">
                    <View
                      className="items-center justify-center mr-3"
                      style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: isDark ? "#3A1B20" : "#FDE2E5" }}
                    >
                      <Text className="font-black" style={{ fontSize: FONT_SIZE.xxs, color: isDark ? "#FF8A96" : "#B30118" }}>
                        {initialsOf(r.fullName)}
                      </Text>
                    </View>
                    <View className="flex-1 pr-2">
                      <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xs }} numberOfLines={1}>
                        {r.fullName}
                      </Text>
                      <Text className={`mt-0.5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }} numberOfLines={1}>
                        {isoToDmy(r.dateOfBirth)}
                        {r.nationalId ? ` · CCCD ${maskId(r.nationalId)}` : age !== null && age < 14 ? ` · ${age} tuổi, chưa cần CCCD` : ""}
                      </Text>
                    </View>
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: hasPassport ? (isDark ? "#14301F" : "#E7F5EC") : isDark ? "#3A2A0F" : "#FFF4E0" }}
                    >
                      <Text
                        className="font-bold"
                        style={{ fontSize: FONT_SIZE.xxs, color: hasPassport ? (isDark ? "#6FCB9F" : "#1C6E40") : isDark ? "#E8944B" : "#7A4B00" }}
                      >
                        {hasPassport ? "Có hộ chiếu" : "Thiếu hộ chiếu"}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-end mt-2.5">
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: "/(root)/(profile)/relative-form" as any, params: { id: r.id } })}
                      accessibilityLabel={`Sửa ${r.fullName}`}
                      className={`items-center justify-center mr-2 border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    >
                      <Ionicons name="create-outline" size={20} color={isDark ? "#CBD5E1" : "#64748B"} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setToDelete(r)}
                      accessibilityLabel={`Xoá ${r.fullName}`}
                      className={`items-center justify-center border ${isDark ? "border-slate-700" : "border-slate-200"}`}
                      style={{ width: 44, height: 44, borderRadius: 22 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#D0021B" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>

      <CustomAlert
        visible={!!toDelete}
        type="confirm"
        title="Xoá thân nhân"
        message={toDelete ? `Bạn có chắc muốn xoá "${toDelete.fullName}" khỏi danh sách thân nhân không?` : ""}
        confirmText={deleting ? "Đang xoá..." : "Xoá"}
        cancelText="Giữ lại"
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
      <CustomAlert
        visible={!!alert}
        type="error"
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        onClose={() => setAlert(null)}
      />
      <ZaloFloatingButton />
    </LinearGradient>
  );
}
