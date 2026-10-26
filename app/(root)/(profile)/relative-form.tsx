import CustomAlert from "@/components/CustomAlert";
import GuestFields from "@/components/guest/GuestFields";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { createRelative, getRelatives, updateRelative } from "@/services/relative";
import { emptyGuest, formToPayload, GuestForm, payloadToForm, validateGuestForm } from "@/utils/guest";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/** Thêm / sửa một thân nhân. Có tham số `id` thì là sửa. */
export default function RelativeFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState<GuestForm>(emptyGuest());
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ title: string; message: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await getRelatives();
        const found = (res.data ?? []).find((r) => r.id === id);
        if (found) setForm(payloadToForm(found));
        else setAlert({ title: "Không tìm thấy", message: "Thân nhân này không còn trong danh sách.", type: "error" });
      } catch {
        setAlert({ title: "Lỗi", message: "Không tải được thông tin thân nhân.", type: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    const err = validateGuestForm(form);
    if (err) {
      setAlert({ title: "Chưa hợp lệ", message: err.charAt(0).toUpperCase() + err.slice(1), type: "error" });
      return;
    }
    try {
      setSaving(true);
      const payload = formToPayload(form);
      if (id) await updateRelative(id, payload);
      else await createRelative(payload);
      router.back();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setAlert({
        title: "Không lưu được",
        message: Array.isArray(msg) ? msg.join("\n") : msg || "Vui lòng thử lại sau.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const textMain = isDark ? "text-slate-100" : "text-slate-800";
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
          <Text className={`text-xl font-black ml-4 ${textMain}`}>{id ? "Sửa thân nhân" : "Thêm thân nhân"}</Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#D0021B" />
          </View>
        ) : (
          <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
            >
              <View
                className={`rounded-[24px] p-5 mb-4 border ${isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100"}`}
              >
                <Text className={`font-black mb-1 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
                  Thông tin người đi cùng
                </Text>
                <Text className={`mb-4 leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  Hộ chiếu và visa không bắt buộc ở đây. Khi đặt tour nước ngoài, mỗi người phải có đủ hai thông tin này.
                </Text>
                <GuestFields value={form} onChange={(p) => setForm((f) => ({ ...f, ...p }))} />
              </View>
              <PrimaryButton label={id ? "Lưu thay đổi" : "Lưu thân nhân"} onPress={save} loading={saving} fullWidth />
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>

      <CustomAlert
        visible={!!alert}
        type={alert?.type ?? "error"}
        title={alert?.title ?? ""}
        message={alert?.message ?? ""}
        onClose={() => setAlert(null)}
      />
    </LinearGradient>
  );
}
