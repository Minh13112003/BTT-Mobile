import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
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

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!phone.trim() || phone.trim().length < 9) return;
    setSending(true);
    // TODO: gọi API gửi OTP thực khi có backend
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    setOtpSent(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    startCountdown();
    setTimeout(() => otpRefs.current[0]?.focus(), 200);
  };

  const handleOtpChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setOtpError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    setVerifying(true);
    // TODO: gọi API xác minh OTP thực khi có backend
    await new Promise((r) => setTimeout(r, 600));
    setVerifying(false);
    router.push({
      pathname: "/(root)/(auth)/reset-password" as any,
      params: { phone: phone.trim() },
    });
  };

  const headerBg: [string, string] = isDark
    ? ["#3E4451", "#1E222B"]
    : ["#C0001A", "#D0021B"];

  const formBg = isDark ? "#1E222B" : "#FFFFFF";
  const inputBg = isDark ? "#111318" : "#FFFFFF";
  const labelColor = isDark ? "#9CA3AF" : "#5D3F3C";

  const isPhoneValid = phone.trim().length >= 9;
  const isOtpFull = otp.every((d) => d !== "");

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
              Quên mật khẩu
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "rgba(255,255,255,0.85)",
                marginTop: 6,
                fontStyle: "italic",
              }}
            >
              {otpSent
                ? `Nhập mã OTP gửi về ${phone}`
                : "Nhập số điện thoại để nhận mã OTP"}
            </Text>
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
            {/* Phone number input */}
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
              Số điện thoại
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: isDark ? "#2D3748" : "#E7BDB8",
                backgroundColor: inputBg,
                paddingHorizontal: 14,
                height: 54,
                marginBottom: 16,
              }}
            >
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                color={isDark ? "#6B7280" : "#926E6A"}
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
                placeholder="Nhập số điện thoại của bạn"
                placeholderTextColor={isDark ? "#6B7280" : "#926E6A"}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!otpSent}
              />
              {otpSent && (
                <TouchableOpacity
                  onPress={() => {
                    setOtpSent(false);
                    setOtp(Array(OTP_LENGTH).fill(""));
                    setOtpError("");
                  }}
                  activeOpacity={0.6}
                >
                  <Ionicons name="create-outline" size={18} color={isDark ? "#60A5FA" : "#005AC1"} />
                </TouchableOpacity>
              )}
            </View>

            {/* Send OTP button (only shown before OTP is sent) */}
            {!otpSent && (
              <TouchableOpacity
                onPress={handleSendOtp}
                disabled={sending || !isPhoneValid}
                activeOpacity={0.85}
                style={{
                  height: 54,
                  borderRadius: 14,
                  backgroundColor:
                    isPhoneValid ? (isDark ? "#374151" : "#D0021B") : (isDark ? "#2D3748" : "#E0A0A0"),
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: sending ? 0.75 : 1,
                  shadowColor: "#D0021B",
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isPhoneValid ? 0.25 : 0,
                  shadowRadius: 12,
                  elevation: isPhoneValid ? 4 : 0,
                }}
              >
                {sending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
                    Gửi mã OTP
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* OTP section */}
            {otpSent && (
              <>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    letterSpacing: 1.2,
                    textTransform: "uppercase",
                    color: labelColor,
                    marginBottom: 12,
                    paddingLeft: 4,
                  }}
                >
                  Mã OTP (6 chữ số)
                </Text>

                {/* 6 OTP boxes */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  {otp.map((digit, idx) => (
                    <TextInput
                      key={idx}
                      ref={(r) => { otpRefs.current[idx] = r; }}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, idx)}
                      onKeyPress={({ nativeEvent: { key } }) => handleOtpKeyPress(key, idx)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={{
                        width: 46,
                        height: 56,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor:
                          digit
                            ? (isDark ? "#60A5FA" : "#D0021B")
                            : otpError
                              ? "#EF4444"
                              : (isDark ? "#2D3748" : "#E7BDB8"),
                        backgroundColor: inputBg,
                        textAlign: "center",
                        fontSize: 22,
                        fontWeight: "800",
                        color: isDark ? "#F1F5F9" : "#181C23",
                      }}
                    />
                  ))}
                </View>

                {/* OTP error */}
                {!!otpError && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      borderRadius: 12,
                      padding: 10,
                      marginBottom: 10,
                      backgroundColor: isDark ? "rgba(185,28,28,0.15)" : "#FEF2F2",
                      borderWidth: 1,
                      borderColor: isDark ? "#7F1D1D" : "#FECACA",
                    }}
                  >
                    <Ionicons name="alert-circle" size={16} color="#EF4444" />
                    <Text style={{ fontSize: 13, color: "#EF4444", marginLeft: 6, flex: 1 }}>
                      {otpError}
                    </Text>
                  </View>
                )}

                {/* Resend / countdown */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  {countdown > 0 ? (
                    <Text style={{ fontSize: 13, color: isDark ? "#6B7280" : "#9CA3AF" }}>
                      Gửi lại mã sau{" "}
                      <Text style={{ fontWeight: "700", color: isDark ? "#60A5FA" : "#D0021B" }}>
                        {countdown}s
                      </Text>
                    </Text>
                  ) : (
                    <TouchableOpacity onPress={handleSendOtp} disabled={sending} activeOpacity={0.6}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: isDark ? "#60A5FA" : "#D0021B",
                        }}
                      >
                        Gửi lại mã OTP
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Verify button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={verifying || !isOtpFull}
                  activeOpacity={0.85}
                  style={{
                    height: 54,
                    borderRadius: 14,
                    backgroundColor:
                      isOtpFull ? (isDark ? "#374151" : "#D0021B") : (isDark ? "#2D3748" : "#E0A0A0"),
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: verifying ? 0.75 : 1,
                    shadowColor: "#D0021B",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: isOtpFull ? 0.25 : 0,
                    shadowRadius: 12,
                    elevation: isOtpFull ? 4 : 0,
                  }}
                >
                  {verifying ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>
                      Xác nhận OTP
                    </Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Back to login */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              style={{ alignItems: "center", marginTop: 24 }}
            >
              <Text style={{ fontSize: 14, color: isDark ? "#6B7280" : "#9CA3AF" }}>
                Quay lại{" "}
                <Text style={{ fontWeight: "700", color: isDark ? "#60A5FA" : "#005AC1" }}>
                  Đăng nhập
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
