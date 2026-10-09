import CustomAlert from "@/components/CustomAlert";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { getPinStatus } from "@/services/pin";
import { changePassword } from "@/services/user";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SecurityScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [hasPin, setHasPin] = useState<boolean | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "confirm">("success");

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "confirm" = "success",
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      getPinStatus()
        .then((res) => setHasPin(res.data?.hasPin ?? false))
        .catch(() => setHasPin(false));
    }, []),
  );

  const handleChangePassword = async () => {
    setError("");
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ mật khẩu hiện tại, mật khẩu mới và xác nhận.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    try {
      setSaving(true);
      await changePassword({ currentPassword: oldPassword, newPassword });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showAlert(
        "Đã đổi mật khẩu",
        "Nếu bạn không thực hiện thao tác này, vui lòng liên hệ tổng đài 1900 6668 ngay.",
        "success",
      );
    } catch (err: any) {
      const status = err?.response?.status;
      const raw = err?.response?.data?.message;
      let msg = "Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.";
      if (status === 400 || status === 401) msg = "Mật khẩu hiện tại chưa đúng.";
      else if (raw) msg = Array.isArray(raw) ? raw.join(", ") : String(raw);
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);
  const textMain = isDark ? "text-slate-100" : "text-slate-800";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100";
  const placeholderColor = isDark ? "#64748B" : "#94A3B8";

  const Field = ({
    id,
    label,
    value,
    onChange,
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View className="mb-4">
      <Text className={`font-bold mb-1.5 pl-1 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
        {label}
      </Text>
      <View
        className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
          focused === id
            ? isDark
              ? "bg-slate-800 border-red-400"
              : "bg-white border-[#D0021B]"
            : isDark
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
        }`}
      >
        <Ionicons name="lock-closed-outline" size={20} color={isDark ? "#94A3B8" : "#94A3B8"} />
        <TextInput
          value={value}
          onChangeText={onChange}
          onFocus={() => setFocused(id)}
          onBlur={() => setFocused("")}
          secureTextEntry={!showPw}
          autoCapitalize="none"
          placeholder="••••••"
          placeholderTextColor={placeholderColor}
          className={`flex-1 ml-3 font-medium ${isDark ? "text-slate-100" : "text-slate-800"}`}
          style={{ fontSize: FONT_SIZE.xs }}
        />
        <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={10}>
          <Ionicons name={showPw ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
          <Text className={`text-xl font-black ml-4 ${textMain}`}>Mật khẩu & mã PIN</Text>
        </View>

        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 }}
          >
            {/* Mã PIN */}
            <View className={`rounded-[24px] p-5 mb-4 border ${card}`}>
              <Text className={`font-black mb-3 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
                Mã PIN xác nhận đặt tour
              </Text>
              <Text className={`leading-6 mb-4 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                Mã PIN gồm 6 số, dùng để xác nhận khi đặt tour. Không chia sẻ mã này cho bất kỳ ai.
              </Text>
              <View
                className={`flex-row items-center rounded-2xl p-3.5 mb-4 ${
                  hasPin ? (isDark ? "bg-emerald-500/10" : "bg-emerald-50") : isDark ? "bg-amber-500/10" : "bg-amber-50"
                }`}
              >
                <Ionicons
                  name={hasPin ? "shield-checkmark" : "shield-outline"}
                  size={22}
                  color={hasPin ? "#10B981" : "#F59E0B"}
                />
                <Text
                  className={`ml-2.5 font-bold ${hasPin ? "text-emerald-700" : "text-amber-700"}`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  {hasPin === null ? "Đang kiểm tra…" : hasPin ? "Đã thiết lập mã PIN" : "Chưa thiết lập mã PIN"}
                </Text>
              </View>
              <PrimaryButton
                label={hasPin ? "Đổi mã PIN" : "Tạo mã PIN"}
                fullWidth
                onPress={() =>
                  router.push((hasPin ? "/(root)/(profile)/change-pin" : "/(root)/(profile)/setup-pin") as any)
                }
              />
            </View>

            {/* Đổi mật khẩu */}
            <View className={`rounded-[24px] p-5 mb-4 border ${card}`}>
              <Text className={`font-black mb-4 ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
                Đổi mật khẩu
              </Text>
              <Field id="old" label="Mật khẩu hiện tại" value={oldPassword} onChange={setOldPassword} />
              <Field id="new" label="Mật khẩu mới (ít nhất 6 ký tự)" value={newPassword} onChange={setNewPassword} />
              <Field id="confirm" label="Nhập lại mật khẩu mới" value={confirmPassword} onChange={setConfirmPassword} />
              {error ? (
                <View className="rounded-2xl p-3.5 mb-4 bg-red-50 border border-red-200">
                  <Text className="text-red-700 font-medium" style={{ fontSize: FONT_SIZE.xxs }}>
                    {error}
                  </Text>
                </View>
              ) : null}
              <PrimaryButton label="Cập nhật mật khẩu" onPress={handleChangePassword} loading={saving} fullWidth />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </LinearGradient>
  );
}
