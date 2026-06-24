import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";
  const { phone } = useLocalSearchParams<{ phone: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headerBg: [string, string] = isDark
    ? ["#3E4451", "#1E222B"]
    : ["#C0001A", "#D0021B"];

  const formBg = isDark ? "#1E222B" : "#FFFFFF";
  const inputBg = isDark ? "#111318" : "#FFFFFF";
  const labelColor = isDark ? "#9CA3AF" : "#5D3F3C";

  const borderColor = (field: string) =>
    focusedField === field
      ? isDark ? "#60A5FA" : "#005AC1"
      : isDark ? "#2D3748" : "#E7BDB8";

  const handleReset = async () => {
    setError("");
    if (!newPassword || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
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

    setLoading(true);
    // TODO: gọi API đổi mật khẩu với OTP token khi có backend
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    Alert.alert(
      "Thành công",
      "Mật khẩu đã được đặt lại. Vui lòng đăng nhập lại.",
      [
        {
          text: "Đăng nhập",
          onPress: () => router.replace("/(root)/(auth)/login" as any),
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#1E222B" : "#F9F9FF" }}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <LinearGradient
            colors={headerBg}
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 60,
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{
                position: "absolute",
                top: insets.top + 12,
                left: 20,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View
              style={{
                width: 90,
                height: 90,
                borderRadius: 45,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
                padding: 10,
              }}
            >
              <Image
                source={require("../../../assets/images/Logo_BTT-2018.png")}
                style={{ width: 66, height: 66 }}
                resizeMode="contain"
              />
            </View>

            <Text
              style={{
                fontSize: 22,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -0.5,
              }}
            >
              Đặt mật khẩu mới
            </Text>
            {!!phone && (
              <Text
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,0.85)",
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                Tài khoản: {phone}
              </Text>
            )}
          </LinearGradient>

          {/* Form card */}
          <View
            style={{
              flex: 1,
              marginTop: -40,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: formBg,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 40,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* New password */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelColor,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Mật khẩu mới
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: borderColor("new"),
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                height: 54,
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === "new" ? (isDark ? "#60A5FA" : "#005AC1") : (isDark ? "#6B7280" : "#926E6A")}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: "100%",
                  marginLeft: 10,
                  fontSize: 16,
                  fontWeight: "600",
                  color: isDark ? "#F1F5F9" : "#181C23",
                }}
                placeholder="Nhập mật khẩu mới (≥ 6 ký tự)"
                placeholderTextColor={isDark ? "#6B7280" : "#926E6A"}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                onFocus={() => setFocusedField("new")}
                onBlur={() => setFocusedField("")}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} activeOpacity={0.5}>
                <Ionicons
                  name={showNew ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={isDark ? "#6B7280" : "#926E6A"}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm password */}
            <Text
              style={{
                fontSize: 12,
                fontWeight: "700",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelColor,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Xác nhận mật khẩu
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: borderColor("confirm"),
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                height: 54,
                marginBottom: 8,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={focusedField === "confirm" ? (isDark ? "#60A5FA" : "#005AC1") : (isDark ? "#6B7280" : "#926E6A")}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: "100%",
                  marginLeft: 10,
                  fontSize: 16,
                  fontWeight: "600",
                  color: isDark ? "#F1F5F9" : "#181C23",
                }}
                placeholder="Nhập lại mật khẩu mới"
                placeholderTextColor={isDark ? "#6B7280" : "#926E6A"}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField("")}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} activeOpacity={0.5}>
                <Ionicons
                  name={showConfirm ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={isDark ? "#6B7280" : "#926E6A"}
                />
              </TouchableOpacity>
            </View>

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <Ionicons
                  name={newPassword === confirmPassword ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={newPassword === confirmPassword ? "#22C55E" : "#EF4444"}
                />
                <Text
                  style={{
                    marginLeft: 6,
                    fontSize: 13,
                    fontWeight: "600",
                    color: newPassword === confirmPassword ? "#22C55E" : "#EF4444",
                  }}
                >
                  {newPassword === confirmPassword ? "Mật khẩu khớp" : "Mật khẩu không khớp"}
                </Text>
              </View>
            )}

            {/* Error */}
            {!!error && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  marginBottom: 14,
                  padding: 12,
                  backgroundColor: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2",
                  borderWidth: 1,
                  borderColor: isDark ? "#7F1D1D" : "#FECACA",
                }}
              >
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={{ fontSize: 14, color: "#EF4444", marginLeft: 8, flex: 1 }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                height: 54,
                borderRadius: 14,
                backgroundColor: isDark ? "#374151" : "#D0021B",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 8,
                opacity: loading ? 0.7 : 1,
                shadowColor: "#D0021B",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
                  Đặt lại mật khẩu
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
