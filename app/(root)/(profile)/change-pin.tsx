import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { changePin, verifyPin } from "@/services/pin";
import CustomAlert from "@/components/CustomAlert";

const PIN_LENGTH = 6;

type Step = "current" | "new" | "confirm";

const STEP_CONFIG: Record<Step, { title: string; subtitle: string }> = {
  current: { title: "Xác minh PIN hiện tại", subtitle: "Nhập mã PIN 6 chữ số hiện tại để xác minh" },
  new:     { title: "Nhập PIN mới",           subtitle: "Chọn mã PIN 6 chữ số mới" },
  confirm: { title: "Xác nhận PIN mới",       subtitle: "Nhập lại PIN mới để xác nhận" },
};

export default function ChangePinScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [step, setStep] = useState<Step>("current");
  const [currentPin, setCurrentPinVal] = useState("");
  const [newPin, setNewPinVal] = useState("");
  const [confirmPinVal, setConfirmPinVal] = useState("");
  const [loading, setLoading] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("warning");
  // Dùng ref thay vì state để tránh React gọi function khi setState nhận function
  const alertCloseRef = useRef<() => void>(() => setAlertVisible(false));

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning",
    onClose: () => void,
  ) => {
    alertCloseRef.current = onClose;
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const getActiveValue = () => {
    if (step === "current") return currentPin;
    if (step === "new") return newPin;
    return confirmPinVal;
  };

  const shake = (cb?: () => void) => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start(() => cb?.());
  };

  const handleKeypad = (key: string) => {
    if (loading) return;
    const active = getActiveValue();
    if (key === "DEL") {
      if (step === "current") setCurrentPinVal((p) => p.slice(0, -1));
      else if (step === "new") setNewPinVal((p) => p.slice(0, -1));
      else setConfirmPinVal((p) => p.slice(0, -1));
      return;
    }
    if (active.length >= PIN_LENGTH) return;
    const next = active + key;

    if (step === "current") {
      setCurrentPinVal(next);
      if (next.length === PIN_LENGTH) setTimeout(() => handleVerifyCurrent(next), 200);
    } else if (step === "new") {
      setNewPinVal(next);
      if (next.length === PIN_LENGTH) setTimeout(() => handleCheckNewPin(next), 200);
    } else {
      setConfirmPinVal(next);
      if (next.length === PIN_LENGTH) handleSubmit(next);
    }
  };

  const handleVerifyCurrent = async (pin: string) => {
    try {
      setLoading(true);
      await verifyPin(pin);
      // PIN cũ đúng → sang bước nhập PIN mới
      setStep("new");
    } catch {
      shake(() => {
        setCurrentPinVal("");
        showAlert(
          "PIN không đúng",
          "Mã PIN hiện tại không chính xác. Vui lòng thử lại.",
          "error",
          () => setAlertVisible(false),
        );
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNewPin = (pin: string) => {
    if (pin === currentPin) {
      shake(() => {
        setNewPinVal("");
        showAlert(
          "PIN trùng nhau",
          "Mã PIN mới không được trùng với mã PIN hiện tại. Vui lòng chọn PIN khác.",
          "warning",
          () => setAlertVisible(false),
        );
      });
      return;
    }
    setStep("confirm");
  };

  const handleSubmit = async (confirmed: string) => {
    if (confirmed !== newPin) {
      shake(() => {
        setConfirmPinVal("");
        showAlert(
          "Không khớp",
          "PIN mới nhập lại không khớp. Vui lòng nhập lại PIN mới.",
          "error",
          () => {
            setAlertVisible(false);
            setStep("new");
            setNewPinVal("");
          },
        );
      });
      return;
    }
    try {
      setLoading(true);
      await changePin(currentPin, newPin);
      showAlert(
        "Thành công",
        "Mã PIN đã được thay đổi thành công!",
        "success",
        () => {
          setAlertVisible(false);
          router.back();
        },
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Không thể đổi PIN. Vui lòng thử lại.";
      showAlert(
        "Lỗi",
        msg,
        "error",
        () => {
          setAlertVisible(false);
          setCurrentPinVal("");
          setNewPinVal("");
          setConfirmPinVal("");
          setStep("current");
        },
      );
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
  const textColor = isDark ? "#F1F5F9" : "#1E293B";
  const mutedColor = isDark ? "#64748B" : "#94A3B8";
  const dotActive = isDark ? "#93C5FD" : "#D0021B";
  const dotInactive = isDark ? "#334155" : "#E2E8F0";
  const keyBg = isDark ? "#1E293B" : "#F8FAFC";
  const keyBorder = isDark ? "#334155" : "#E2E8F0";

  const steps: Step[] = ["current", "new", "confirm"];
  const stepIndex = steps.indexOf(step);
  const activeValue = getActiveValue();

  return (
    <LinearGradient colors={bg} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons name="arrow-back" size={24} color={isDark ? "#93C5FD" : "#D0021B"} />
          </TouchableOpacity>
          <Text className={`text-xl font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}>
            Đổi mã PIN
          </Text>
        </View>

        <View className="flex-1 items-center px-6 pt-8">
          {/* Logo */}
          <Image
            source={require("../../../assets/images/Logo_BTT-2018.png")}
            style={{ width: 64, height: 64, marginBottom: 20 }}
            resizeMode="contain"
          />

          {/* Step progress bar */}
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 28, width: "80%" }}>
            {steps.map((s, idx) => (
              <React.Fragment key={s}>
                <View style={{
                  width: 28, height: 28, borderRadius: 14,
                  backgroundColor: idx <= stepIndex ? dotActive : dotInactive,
                  alignItems: "center", justifyContent: "center",
                }}>
                  {idx < stepIndex
                    ? <Ionicons name="checkmark" size={16} color="#fff" />
                    : <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>{idx + 1}</Text>
                  }
                </View>
                {idx < steps.length - 1 && (
                  <View style={{ flex: 1, height: 2, backgroundColor: idx < stepIndex ? dotActive : dotInactive, marginHorizontal: 6 }} />
                )}
              </React.Fragment>
            ))}
          </View>

          <Text style={{ fontSize: FONT_SIZE.md, fontWeight: "900", color: textColor, marginBottom: 6, textAlign: "center" }}>
            {STEP_CONFIG[step].title}
          </Text>
          <Text style={{ fontSize: FONT_SIZE.xs, color: mutedColor, marginBottom: 32, textAlign: "center" }}>
            {STEP_CONFIG[step].subtitle}
          </Text>

          {/* PIN dots */}
          <Animated.View style={{ flexDirection: "row", gap: 14, marginBottom: 40, transform: [{ translateX: shakeAnim }] }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View
                key={i}
                style={{
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: i < activeValue.length ? dotActive : dotInactive,
                  borderWidth: i < activeValue.length ? 0 : 1.5,
                  borderColor: dotInactive,
                }}
              />
            ))}
          </Animated.View>

          {/* Keypad */}
          {loading ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <ActivityIndicator size="large" color={dotActive} />
              <Text style={{ color: mutedColor, marginTop: 12, fontSize: FONT_SIZE.xs }}>Đang xác thực...</Text>
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
        onClose={() => alertCloseRef.current()}
      />
    </LinearGradient>
  );
}
