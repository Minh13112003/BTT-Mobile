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
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { isLoggedIn, saveAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(root)/(tabs)");
    }
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

      const res = await login({
        identifier: identity,
        password,
      });

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

  const gradientColors = isDark
    ? (["#3E4451", "#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        {/* Nút chuyển đổi Giao diện dạng biểu tượng ở góc trên bên phải */}
        <View className="flex-row justify-end px-6 pt-2">
          <TouchableOpacity
            onPress={toggleTheme}
            activeOpacity={0.7}
            className={`w-10 h-10 rounded-full items-center justify-center border ${
              isDark
                ? "bg-slate-800/80 border-slate-700/50 shadow-black/20"
                : "bg-white border-slate-200 shadow-sm shadow-slate-900/5"
            }`}
          >
            <Ionicons
              name={isDark ? "sunny-outline" : "moon-outline"}
              size={20}
              color={isDark ? "#F59E0B" : "#1E293B"}
            />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
            }}
          >
            {/* Header Section */}
            <View className="items-center mb-8">
              {/* Logo BTT thay cho icon */}
              <View
                style={{
                  width: 160,
                  height: 80,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                  backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
                  borderWidth: 2,
                  borderColor: isDark
                    ? "rgba(71,85,105,0.6)"
                    : "rgba(229,31,39,0.15)",
                  shadowColor: isDark ? "#000" : "#E51F27",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.4 : 0.18,
                  shadowRadius: 14,
                  elevation: 8,
                  padding: 10,
                }}
              >
                <Image
                  source={
                    isDark
                      ? require("../../../assets/images/Logo_BTT-2018-02.png")
                      : require("../../../assets/images/Logo_BTT-2018.png")
                  }
                  style={{ width: 140, height: 60 }}
                  resizeMode="contain"
                />
              </View>

              <Text
                className={`text-3xl font-black tracking-tight ${
                  isDark ? "text-slate-100" : "text-blue-900 color-[#1E3A8A]"
                }`}
              >
                BENTHANH TOURIST
              </Text>

              <Text
                className={`text-base font-medium mt-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Đăng nhập để tiếp tục trải nghiệm
              </Text>
            </View>

            {/* Khung chứa Form */}
            <View
              className={`rounded-[24px] p-5 shadow-2xl border ${
                isDark
                  ? "bg-slate-800/80 border-slate-700/50 shadow-black/40"
                  : "bg-white border-slate-100 shadow-slate-900/5"
              }`}
            >
              {/* Email Input */}
              <Text
                className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Email hoặc Số điện thoại
              </Text>
              <View
                className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                  isDark
                    ? focusedField === "identity"
                      ? "border-slate-400 bg-slate-900/60"
                      : "border-slate-700/60 bg-slate-900/40"
                    : focusedField === "identity"
                      ? "border-blue-500 bg-white"
                      : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    isDark
                      ? focusedField === "identity"
                        ? "#F3F4F6"
                        : "#6B7280"
                      : focusedField === "identity"
                        ? "#3B82F6"
                        : "#94A3B8"
                  }
                />
                <TextInput
                  className={`flex-1 h-full ml-3 font-semibold text-base ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                  placeholder="name@example.com hoặc 0123456789"
                  placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={identity}
                  onChangeText={setIdentity}
                  onFocus={() => setFocusedField("identity")}
                  onBlur={() => setFocusedField("")}
                />
              </View>

              {/* Khoảng cách giữa 2 input */}
              <View className="h-4" />

              {/* Password Input */}
              <Text
                className={`text-base font-bold mb-2 uppercase tracking-wider pl-1 ${
                  isDark ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Mật khẩu
              </Text>
              <View
                className={`flex-row items-center rounded-2xl border-2 px-4 h-14 ${
                  isDark
                    ? focusedField === "password"
                      ? "border-slate-400 bg-slate-900/60"
                      : "border-slate-700/60 bg-slate-900/40"
                    : focusedField === "password"
                      ? "border-blue-500 bg-white"
                      : "border-slate-100 bg-slate-50/50"
                }`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    isDark
                      ? focusedField === "password"
                        ? "#F3F4F6"
                        : "#6B7280"
                      : focusedField === "password"
                        ? "#3B82F6"
                        : "#94A3B8"
                  }
                />
                <TextInput
                  className={`flex-1 h-full ml-3 font-semibold text-base ${
                    isDark ? "text-slate-100" : "text-slate-900"
                  }`}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.5}
                  className="p-1"
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={isDark ? "#6B7280" : "#94A3B8"}
                  />
                </TouchableOpacity>
              </View>

              {/* Error Alert */}
              {error ? (
                <View
                  className={`flex-row items-center border rounded-xl mt-4 p-3 ${
                    isDark
                      ? "bg-red-950/50 border-red-800/80"
                      : "bg-red-50 border-red-100"
                  }`}
                >
                  <Ionicons name="alert-circle" size={18} color="#EF4444" />
                  <Text
                    className={`text-base font-medium ml-2 flex-1 ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Forgot Password */}
              <TouchableOpacity
                className="self-end mt-3 py-1"
                activeOpacity={0.6}
              >
                <Text
                  className={`font-bold text-base ${
                    isDark ? "text-slate-350 color-[#CBD5E1]" : "text-blue-500"
                  }`}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
                className={`rounded-2xl h-14 items-center justify-center mt-5 shadow-lg border ${
                  isDark
                    ? `bg-slate-600 border-slate-500 shadow-black/30 ${
                        loading ? "opacity-70" : "active:bg-slate-500"
                      }`
                    : `bg-blue-500 border-blue-400 shadow-blue-500/20 ${
                        loading ? "opacity-70" : "active:bg-blue-600"
                      }`
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-white font-bold text-base tracking-wide">
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
