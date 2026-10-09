import { KeypadCaret, PhoneKeypad } from "@/components/PhoneKeypad";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { login } from "@/services/auth";
import { getPinStatus } from "@/services/pin";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Image,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** nativeID thanh "Xong" trên bàn phím hệ thống của ô mật khẩu (iOS). */
const KEYBOARD_BAR_ID = "login-keyboard-bar";

/** SĐT Việt Nam: 10 số (di động) — cho tới 11 để không chặn số máy bàn cũ. */
const PHONE_MAX_DIGITS = 11;

/** Hiển thị dễ đọc: 0912345678 → "0912 345 678". Giá trị gửi API vẫn là số liền. */
function formatPhone(digits: string) {
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7)].filter(Boolean).join(" ");
}

export default function LoginScreen() {
  const router = useRouter();
  const { isLoggedIn, saveAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isLoggedIn) router.replace("/(root)/(tabs)");
  }, [isLoggedIn]);

  const checkPinAndNavigate = async () => {
    try {
      const res = await getPinStatus();
      if (!res.data?.hasPin) {
        router.replace({
          pathname: "/(root)/(profile)/setup-pin" as any,
          params: { fromLogin: "true" },
        });
      } else {
        router.replace("/(root)/(tabs)");
      }
    } catch {
      router.replace("/(root)/(tabs)");
    }
  };

  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Điều hướng bàn phím:
  // - Ô SĐT dùng bàn phím số tự vẽ (PhoneKeypad, giống màn PIN): "Xong" → nhảy
  //   xuống ô mật khẩu + cuộn tới đó.
  // - Ô mật khẩu dùng bàn phím hệ thống: "Xong" → đăng nhập luôn.
  const scrollRef = useRef<ScrollView>(null);
  const passwordRef = useRef<TextInput>(null);
  const formSheetY = useRef(0); // y của form sheet trong nội dung ScrollView
  const phoneLabelY = useRef(0); // y của nhãn "Số điện thoại" trong form sheet
  const passwordLabelY = useRef(0); // y của nhãn "Mật khẩu" trong form sheet
  const [keypadOpen, setKeypadOpen] = useState(false);
  const [keypadHeight, setKeypadHeight] = useState(0);

  const openKeypad = () => {
    Keyboard.dismiss(); // đóng bàn phím hệ thống nếu đang mở ở ô mật khẩu
    setFocusedField("identity");
    setKeypadOpen(true);
    // Chờ khoảng trống cuối ScrollView (bằng chiều cao bàn phím số) render xong rồi mới cuộn.
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, formSheetY.current + phoneLabelY.current - 24),
        animated: true,
      });
    }, 80);
  };

  const closeKeypad = () => {
    setKeypadOpen(false);
    setFocusedField((f) => (f === "identity" ? "" : f));
  };

  const handleKeypadDigit = (digit: string) => {
    setError("");
    setIdentity((prev) => (prev.length >= PHONE_MAX_DIGITS ? prev : prev + digit));
  };

  // Android: nút Back đóng bàn phím số trước, không thoát màn hình.
  useEffect(() => {
    if (!keypadOpen) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      closeKeypad();
      return true;
    });
    return () => sub.remove();
  }, [keypadOpen]);

  /** Cuộn để ô mật khẩu (kèm nút Đăng nhập bên dưới) nằm trong vùng nhìn thấy trên bàn phím. */
  const scrollToPassword = () => {
    // Chờ bàn phím/KeyboardAvoidingView co layout xong rồi mới cuộn, nếu không sẽ cuộn hụt.
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, formSheetY.current + passwordLabelY.current - 24),
        animated: true,
      });
    }, Platform.OS === "ios" ? 250 : 350);
  };

  const goToPassword = () => {
    setKeypadOpen(false);
    passwordRef.current?.focus();
    scrollToPassword();
  };

  const submitFromKeyboard = () => {
    Keyboard.dismiss();
    handleLogin();
  };

  const handleLogin = async () => {
    // Chặn gửi 2 lần (vd bấm "Xong" trên bàn phím rồi bấm tiếp nút Đăng nhập).
    if (loading) return;
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
      await checkPinAndNavigate();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Email hoặc mật khẩu không đúng",
      );
    } finally {
      setLoading(false);
    }
  };

  const bgGradient: [string, string, string] = isDark
    ? ["#2A2E38", "#1E222B", "#14161C"]
    : ["#B30014", "#8A0010", "#5C000B"];

  const inputBorder = (field: string) =>
    focusedField === field ? (isDark ? "#60A5FA" : "#FFFFFF") : "transparent";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#14161C" : "#5C000B" }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={bgGradient}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={{ flex: 1 }}
      >
        {/* Decorative arcs */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 390 844"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Circle cx={340} cy={90} r={190} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
          <Circle cx={340} cy={90} r={260} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />
          <Circle cx={20} cy={760} r={150} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
        </Svg>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            // Chừa chỗ bằng chiều cao bàn phím số để cuộn được form lên trên nó.
            contentContainerStyle={{ flexGrow: 1, paddingBottom: keypadOpen ? keypadHeight : 0 }}
          >
            {/* Top bar */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                paddingTop: insets.top + 12,
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                onPress={toggleTheme}
                activeOpacity={0.7}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={isDark ? "sunny-outline" : "moon-outline"}
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Brand */}
            <View style={{ paddingHorizontal: 28, paddingTop: 18 }}>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 28,
                  fontWeight: "900",
                  letterSpacing: -0.6,
                }}
              >
                Chào mừng trở lại
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: FONT_SIZE.xs,
                  marginTop: 10,
                  fontWeight: "500",
                }}
              >
                Đăng nhập để tiếp tục hành trình của bạn
              </Text>
            </View>

            {/* Spacer — logo công ty in chìm, mờ, cho phép bị đè bởi form */}
            <View
              style={{ minHeight: 90, alignItems: "center", justifyContent: "center", marginTop: 8 }}
            >
              <Image
                source={require("../../../assets/images/Logo_BTT-2018-02.png")}
                style={{ width: 340, height: 170, opacity: 0.16 }}
                resizeMode="contain"
              />
            </View>

            {/* Form sheet — glassmorphism */}
            <View
              onLayout={(e) => (formSheetY.current = e.nativeEvent.layout.y)}
              style={{
                borderTopLeftRadius: 32,
                borderTopRightRadius: 32,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.14)",
                borderBottomWidth: 0,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  paddingHorizontal: 24,
                  paddingTop: 30,
                  paddingBottom: 28,
                }}
              >
                {/* Số điện thoại */}
                <Text
                  onLayout={(e) => (phoneLabelY.current = e.nativeEvent.layout.y)}
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.65)",
                    marginBottom: 8,
                  }}
                >
                  Số điện thoại
                </Text>
                {/* Ô SĐT không dùng TextInput → không bật bàn phím hệ thống; chạm vào
                    mở bàn phím số tự vẽ (PhoneKeypad) ở đáy màn hình. */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={openKeypad}
                  accessibilityRole="button"
                  accessibilityLabel={
                    identity ? `Số điện thoại ${identity}` : "Nhập số điện thoại"
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.97)",
                    paddingHorizontal: 16,
                    height: 54,
                    marginBottom: 16,
                    borderWidth: 1.5,
                    borderColor: inputBorder("identity"),
                  }}
                >
                  <Ionicons name="call-outline" size={18} color="#B30014" />
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
                    {/* Ô trống: con trỏ đứng ĐẦU, trước chữ gợi ý — giống ô nhập hệ thống */}
                    {keypadOpen && !identity && (
                      <View style={{ marginRight: 2 }}>
                        <KeypadCaret />
                      </View>
                    )}
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: FONT_SIZE.xs,
                        fontWeight: "600",
                        color: identity ? "#1A1A2E" : "#926E6A",
                        fontVariant: ["tabular-nums"],
                      }}
                    >
                      {identity ? formatPhone(identity) : "0123 456 789"}
                    </Text>
                    {/* Có số: con trỏ đứng sau chữ số cuối */}
                    {keypadOpen && !!identity && (
                      <View style={{ marginLeft: 2 }}>
                        <KeypadCaret />
                      </View>
                    )}
                  </View>
                  {!!identity && keypadOpen && (
                    <TouchableOpacity
                      onPress={() => setIdentity("")}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Xoá số điện thoại"
                    >
                      <Ionicons name="close-circle" size={18} color="#926E6A" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>

                {/* Mật khẩu */}
                <Text
                  onLayout={(e) => (passwordLabelY.current = e.nativeEvent.layout.y)}
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    letterSpacing: 0.6,
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.65)",
                    marginBottom: 8,
                  }}
                >
                  Mật khẩu
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 16,
                    backgroundColor: "rgba(255,255,255,0.97)",
                    paddingHorizontal: 16,
                    height: 54,
                    borderWidth: 1.5,
                    borderColor: inputBorder("password"),
                  }}
                >
                  <Ionicons name="lock-closed-outline" size={18} color="#B30014" />
                  <TextInput
                    ref={passwordRef}
                    style={{
                      flex: 1,
                      height: "100%",
                      marginLeft: 12,
                      fontSize: FONT_SIZE.xs,
                      fontWeight: "600",
                      color: "#1A1A2E",
                    }}
                    placeholder="••••••••"
                    placeholderTextColor="#926E6A"
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={submitFromKeyboard}
                    inputAccessoryViewID={KEYBOARD_BAR_ID}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => {
                      setKeypadOpen(false);
                      setFocusedField("password");
                      // Bấm thẳng vào ô mật khẩu cũng cuộn lên cho thấy rõ.
                      scrollToPassword();
                    }}
                    onBlur={() => setFocusedField("")}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.5}
                  >
                    <Ionicons
                      name={showPassword ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color="#926E6A"
                    />
                  </TouchableOpacity>
                </View>

                {/* Quên mật khẩu */}
                <TouchableOpacity
                  style={{ alignSelf: "flex-end", marginTop: 12 }}
                  activeOpacity={0.6}
                  onPress={() =>
                    router.push("/(root)/(auth)/forgot-password" as any)
                  }
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
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
                      backgroundColor: "rgba(0,0,0,0.25)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color="#FCA5A5" />
                    <Text
                      style={{
                        fontSize: FONT_SIZE.xs,
                        fontWeight: "500",
                        color: "#FCA5A5",
                        marginLeft: 8,
                        flex: 1,
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : null}

                {/* Nút đăng nhập */}
                <View style={{ marginTop: 22 }}>
                  <PrimaryButton
                    label="Đăng nhập"
                    onPress={handleLogin}
                    loading={loading}
                    fullWidth
                  />
                </View>

                {/* Footer — chìm trên nền đỏ, cùng tông chữ với form */}
                <View style={{ marginTop: 28, alignItems: "flex-start" }}>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.card,
                      fontWeight: "700",
                      letterSpacing: 0.5,
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                      lineHeight: 22,
                    }}
                  >
                    © 2026 BenThanh Tourist Service Corporation
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.card,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 4,
                    }}
                  >
                    HOTLINE:{" "}
                    <Text style={{ fontWeight: "bold", color: "rgba(255,255,255,0.65)" }}>
                      1900 6668
                    </Text>
                  </Text>
                  <Text
                    style={{
                      fontSize: FONT_SIZE.card,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 4,
                    }}
                  >
                    Email:{" "}
                    <Text style={{ fontWeight: "bold", color: "rgba(255,255,255,0.65)" }}>
                      benthanh@benthanhtourist.com
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Thanh "Xong" phía trên bàn phím hệ thống của ô mật khẩu — chỉ iOS
            (InputAccessoryView không có trên Android; Android dùng phím hành động
            của bàn phím qua returnKeyType). */}
        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={KEYBOARD_BAR_ID}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                height: 46,
                backgroundColor: isDark ? "#1E222B" : "#F5F6FA",
                borderTopWidth: 1,
                borderTopColor: isDark ? "#2D3748" : "#E2E8F0",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={isDark ? "#94A3B8" : "#64748B"}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    marginLeft: 8,
                    fontSize: FONT_SIZE.card,
                    fontWeight: "600",
                    color: isDark ? "#CBD5E1" : "#475569",
                  }}
                >
                  Nhập mật khẩu
                </Text>
              </View>
              <TouchableOpacity
                onPress={submitFromKeyboard}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 12, right: 8 }}
                style={{
                  backgroundColor: isDark ? "#374151" : "#D0021B",
                  borderRadius: 999,
                  paddingHorizontal: 18,
                  height: 34,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: FONT_SIZE.card }}>
                  Xong
                </Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}
      </LinearGradient>

      {/* Bàn phím số tự vẽ cho ô SĐT — đặt ngoài LinearGradient để bám đáy màn hình */}
      <PhoneKeypad
        visible={keypadOpen}
        onKey={handleKeypadDigit}
        onDelete={() => setIdentity((prev) => prev.slice(0, -1))}
        onClear={() => setIdentity("")}
        onDone={goToPassword}
        onHeightChange={setKeypadHeight}
      />
    </View>
  );
}
