import { Footer } from "@/components/Footer";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { login } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export default function LoginScreen() {
  const router = useRouter();
  const { isLoggedIn, saveAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isLoggedIn) router.replace("/(root)/(tabs)");
  }, [isLoggedIn]);

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!identity || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await login({ identifier: identity, password });
      await saveAuth(
        res.data.accessToken,
        res.data.refreshToken,
        res.data.user,
      );
      router.replace("/(root)/(tabs)/profile");
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Email hoặc mật khẩu không đúng",
      );
    } finally {
      setLoading(false);
    }
  };

  const headerBg: [string, string] = isDark
    ? ["#3E4451", "#1E222B"]
    : ["#C0001A", "#D0021B"];

  const formBg = isDark ? "#1E222B" : "#FFFFFF";
  const inputBg = isDark ? "#111318" : "#FFFFFF";
  const inputBorder = (field: string) =>
    focusedField === field
      ? isDark
        ? "#60A5FA"
        : "#005AC1"
      : isDark
        ? "#2D3748"
        : "#E7BDB8";
  const labelColor = isDark ? "#9CA3AF" : "#5D3F3C";
  const iconColor = (field: string) =>
    focusedField === field
      ? isDark
        ? "#60A5FA"
        : "#005AC1"
      : isDark
        ? "#6B7280"
        : "#926E6A";

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
          {/* ── Header nền đỏ ── */}
          <LinearGradient
            colors={headerBg}
            style={{
              paddingTop: insets.top + 12,
              paddingBottom: 60,
              alignItems: "center",
              overflow: "hidden",
            }}
          >
            {/* Nút dark/light mode */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.7}
              style={{
                position: "absolute",
                top: insets.top + 12,
                right: 20,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.15)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isDark ? "sunny-outline" : "moon-outline"}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Logo tròn */}
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 10,
                padding: 12,
              }}
            >
              <Image
                source={require("../../../assets/images/Logo_BTT-2024.png")}
                style={{ width: 72, height: 72 }}
                resizeMode="contain"
              />
            </View>

            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: "#FFFFFF",
                letterSpacing: -0.5,
                textTransform: "uppercase",
              }}
            >
              BENTHANH TOURIST
            </Text>

            <Text
              style={{
                fontSize: FONT_SIZE.xs,
                color: "rgba(255,255,255,0.85)",
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              Đăng nhập để tiếp tục trải nghiệm
            </Text>
          </LinearGradient>

          {/* ── Form card trắng bo góc trên ── */}
          <View
            style={{
              flex: 1,
              marginTop: -40,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              backgroundColor: formBg,
              paddingHorizontal: 24,
              paddingTop: 32,
              paddingBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            {/* Email */}
            <Text
              style={{
                fontSize: FONT_SIZE.card,
                fontWeight: "700",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelColor,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Email hoặc Số điện thoại
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: inputBorder("identity"),
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                height: 54,
                marginBottom: 20,
              }}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={iconColor("identity")}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: "100%",
                  marginLeft: 10,
                  fontSize: FONT_SIZE.xs,
                  fontWeight: "600",
                  color: isDark ? "#F1F5F9" : "#181C23",
                }}
                placeholder="name@example.com hoặc 0123456789"
                placeholderTextColor={isDark ? "#6B7280" : "#926E6A"}
                keyboardType="email-address"
                autoCapitalize="none"
                value={identity}
                onChangeText={setIdentity}
                onFocus={() => setFocusedField("identity")}
                onBlur={() => setFocusedField("")}
              />
            </View>

            {/* Mật khẩu */}
            <Text
              style={{
                fontSize: FONT_SIZE.card,
                fontWeight: "700",
                letterSpacing: 1.2,
                textTransform: "uppercase",
                color: labelColor,
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Mật khẩu
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: inputBorder("password"),
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                height: 54,
              }}
            >
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={iconColor("password")}
              />
              <TextInput
                style={{
                  flex: 1,
                  height: "100%",
                  marginLeft: 10,
                  fontSize: FONT_SIZE.xs,
                  fontWeight: "600",
                  color: isDark ? "#F1F5F9" : "#181C23",
                }}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#6B7280" : "#926E6A"}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.5}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={isDark ? "#6B7280" : "#926E6A"}
                />
              </TouchableOpacity>
            </View>

            {/* Quên mật khẩu */}
            <TouchableOpacity
              style={{ alignSelf: "flex-end", marginTop: 12 }}
              activeOpacity={0.6}
              onPress={() => router.push("/(root)/(auth)/forgot-password" as any)}
            >
              <Text
                style={{
                  fontSize: FONT_SIZE.xs,
                  fontWeight: "700",
                  color: isDark ? "#60A5FA" : "#005AC1",
                }}
              >
                Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            {/* Error */}
            {error ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  marginTop: 14,
                  padding: 12,
                  backgroundColor: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2",
                  borderWidth: 1,
                  borderColor: isDark ? "#7F1D1D" : "#FECACA",
                }}
              >
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text
                  style={{
                    fontSize: FONT_SIZE.xs,
                    fontWeight: "500",
                    color: "#EF4444",
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Nút đăng nhập */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{
                height: 54,
                borderRadius: 14,
                backgroundColor: isDark ? "#374151" : "#005AC1",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 24,
                opacity: loading ? 0.7 : 1,
                shadowColor: isDark ? "#000" : "#005AC1",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text
                  style={{
                    fontSize: FONT_SIZE.xs,
                    fontWeight: "700",
                    color: "#FFFFFF",
                    letterSpacing: 0.3,
                  }}
                >
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            {/* Footer copyright */}
            <View style={{ marginTop: "auto", paddingTop: 32 }}>
              <Footer />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
