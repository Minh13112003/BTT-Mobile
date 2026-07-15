import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { setPin } from "@/services/pin";
import CustomAlert from "@/components/CustomAlert";

const PIN_LENGTH = 6;

type Step = "enter" | "confirm";

export default function SetupPinScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // fromLogin=true nghĩa là flow bắt buộc sau đăng nhập, không cho back
  const fromLogin = params.fromLogin === "true";
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Chặn back khi đây là flow bắt buộc sau login
  useEffect(() => {
    if (!fromLogin) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, [fromLogin]);

  const [step, setStep] = useState<Step>("enter");
  const [pin, setCurrentPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");

  const currentValue = step === "enter" ? pin : confirmPin;
  const setter = step === "enter" ? setCurrentPin : setConfirmPin;

  const shake = (cb?: () => void) => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(cb);
  };

  const handleKeypad = (key: string) => {
    if (loading) return;
    if (key === "DEL") {
      setter((prev) => prev.slice(0, -1));
      return;
    }
    if (currentValue.length >= PIN_LENGTH) return;
    const next = currentValue + key;
    setter(next);

    if (next.length === PIN_LENGTH) {
      if (step === "enter") {
        setTimeout(() => setStep("confirm"), 200);
      } else {
        handleConfirm(next);
      }
    }
  };

  const handleConfirm = async (confirmedPin: string) => {
    if (confirmedPin !== pin) {
      shake(() => {
        setConfirmPin("");
        setAlertTitle("Không khớp");
        setAlertMessage("Mã PIN nhập lại không khớp. Vui lòng thử lại từ đầu.");
        setAlertType("error");
        setAlertVisible(true);
        setTimeout(() => {
          setStep("enter");
          setCurrentPin("");
        }, 200);
      });
      return;
    }
    try {
      setLoading(true);
      await setPin(pin);
      setAlertTitle("Thành công");
      setAlertMessage("Mã PIN đã được thiết lập thành công! Bạn sẽ cần nhập PIN khi đặt tour.");
      setAlertType("success");
      setAlertVisible(true);
    } catch (e: any) {
      setAlertTitle("Lỗi");
      setAlertMessage(e?.response?.data?.message || "Không thể thiết lập PIN. Vui lòng thử lại.");
      setAlertType("error");
      setAlertVisible(true);
      setConfirmPin("");
      setStep("enter");
      setCurrentPin("");
    } finally {
      setLoading(false);
    }
  };

  const KEYPAD = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["", "0", "DEL"],
  ];

  const bg = isDark ? ["#1E222B", "#111318"] as const : ["#F5F6FA", "#F5F6FA"] as const;
  const cardBg = isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-white border-slate-100";
  const textColor = isDark ? "#F1F5F9" : "#1E293B";
  const mutedColor = isDark ? "#64748B" : "#94A3B8";
  const dotActive = isDark ? "#93C5FD" : "#D0021B";
  const dotInactive = isDark ? "#334155" : "#E2E8F0";
  const keyBg = isDark ? "#1E293B" : "#F8FAFC";
  const keyBorder = isDark ? "#334155" : "#E2E8F0";

  return (
    <LinearGradient colors={bg} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-2">
          {!fromLogin && (
            <TouchableOpacity
              onPress={() => router.back()}
              className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
            >
              <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#D0021B"} />
            </TouchableOpacity>
          )}
          <Text className={`text-xl font-black ${fromLogin ? "" : "ml-4"} ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Thiết lập mã PIN
          </Text>
        </View>
        {fromLogin && (
          <View className="px-6 mb-2">
            <Text style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#94A3B8" : "#64748B", textAlign: "center" }}>
              Vui lòng thiết lập mã PIN để bảo vệ tài khoản của bạn
            </Text>
          </View>
        )}

        <View className="flex-1 items-center px-6 pt-8">
          {/* Logo */}
          <Image
            source={require("../../../assets/images/Logo_BTT-2018.png")}
            style={{ width: 72, height: 72, marginBottom: 20 }}
            resizeMode="contain"
          />

          {/* Step indicator */}
          <View className={`rounded-2xl px-5 py-3 mb-6 border ${cardBg}`}>
            <View className="flex-row items-center">
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: step === "enter" ? dotActive : (pin.length === PIN_LENGTH ? "#10B981" : dotInactive), alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>1</Text>
              </View>
              <View style={{ flex: 1, height: 2, backgroundColor: pin.length === PIN_LENGTH ? "#10B981" : dotInactive, marginHorizontal: 8 }} />
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: step === "confirm" ? dotActive : dotInactive, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>2</Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2">
              <Text style={{ fontSize: FONT_SIZE.xs, color: step === "enter" ? dotActive : mutedColor, fontWeight: "700" }}>Nhập PIN</Text>
              <Text style={{ fontSize: FONT_SIZE.xs, color: step === "confirm" ? dotActive : mutedColor, fontWeight: "700" }}>Xác nhận PIN</Text>
            </View>
          </View>

          <Text style={{ fontSize: FONT_SIZE.md, fontWeight: "900", color: textColor, marginBottom: 6, textAlign: "center" }}>
            {step === "enter" ? "Nhập mã PIN mới" : "Nhập lại mã PIN để xác nhận"}
          </Text>
          <Text style={{ fontSize: FONT_SIZE.xs, color: mutedColor, marginBottom: 32, textAlign: "center" }}>
            {step === "enter"
              ? "Chọn mã PIN 6 chữ số dễ nhớ cho bạn"
              : "Nhập lại mã PIN vừa tạo để xác nhận"}
          </Text>

          {/* PIN dots */}
          <Animated.View style={{ flexDirection: "row", gap: 14, marginBottom: 40, transform: [{ translateX: shakeAnim }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: i < currentValue.length ? dotActive : dotInactive,
                  borderWidth: i < currentValue.length ? 0 : 1.5,
                  borderColor: dotInactive,
                }}
              />
            ))}
          </Animated.View>

          {/* Keypad */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color={dotActive} />
              <Text style={{ color: mutedColor, marginTop: 12, fontSize: FONT_SIZE.xs }}>Đang lưu PIN...</Text>
            </View>
          ) : (
            <View style={{ gap: 12, width: "100%", alignItems: "center" }}>
              {KEYPAD.map((row, ri) => (
                <View key={ri} style={{ flexDirection: "row", gap: 16 }}>
                  {row.map((key, ki) => {
                    if (!key) return <View key={ki} style={{ width: 80, height: 64 }} />;
                    return (
                      <TouchableOpacity
                        key={ki}
                        onPress={() => handleKeypad(key)}
                        activeOpacity={0.7}
                        style={{
                          width: 80, height: 64, borderRadius: 16,
                          backgroundColor: keyBg, borderWidth: 1, borderColor: keyBorder,
                          alignItems: "center", justifyContent: "center",
                        }}
                      >
                        {key === "DEL"
                          ? <Ionicons name="backspace-outline" size={24} color={textColor} />
                          : <Text style={{ fontSize: 24, fontWeight: "700", color: textColor }}>{key}</Text>
                        }
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => {
          setAlertVisible(false);
          if (alertType === "success") {
            if (fromLogin) {
              router.replace("/(root)/(tabs)");
            } else {
              router.back();
            }
          }
        }}
      />
    </LinearGradient>
  );
}
