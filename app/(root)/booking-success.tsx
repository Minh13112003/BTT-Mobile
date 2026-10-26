import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { getShadow, RADIUS } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, BackHandler, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PAYMENT_LABEL: Record<string, string> = {
  AT_OFFICE: "Tại văn phòng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const toInt = (v: unknown) => {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/**
 * Trang đặt tour thành công — checkout.tsx `router.replace` sang đây sau khi booking() trả về.
 * Thông tin hiển thị đi theo params (không gọi lại API) nên mở lại từ lịch sử không dùng màn này.
 * Hai nút: "Đến lịch sử" và "Đến trang chủ"; nút Back (Android/vuốt iOS) cũng về trang chủ
 * để khách không lùi lại màn đặt tour vừa hoàn tất.
 */
export default function BookingSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const tourName = (params.tourName as string) || "";
  const tourCode = (params.tourCode as string) || "";
  const departureDate = (params.departureDate as string) || "";
  const adults = toInt(params.adults);
  const children = toInt(params.children);
  const infants = toInt(params.infants);
  const total = Number(params.total);
  const paymentMethod = (params.paymentMethod as string) || "";

  const goHome = useCallback(() => router.replace("/(root)/(tabs)"), [router]);
  const goHistory = useCallback(() => router.replace("/(root)/(tabs)/history"), [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        goHome();
        return true;
      });
      return () => sub.remove();
    }, [goHome]),
  );

  // Dấu tích nảy vào khi mở màn
  const scale = useRef(new Animated.Value(0.4)).current;
  const fade = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  const guests = [
    adults > 0 ? `${adults} người lớn` : "",
    children > 0 ? `${children} trẻ em` : "",
    infants > 0 ? `${infants} em bé` : "",
  ]
    .filter(Boolean)
    .join(", ");

  const rows: [string, string][] = [
    ...(tourCode ? ([["Mã tour", tourCode]] as [string, string][]) : []),
    ...(departureDate ? ([["Ngày khởi hành", formatFullDate(departureDate)]] as [string, string][]) : []),
    ...(guests ? ([["Số khách", guests]] as [string, string][]) : []),
    ...(PAYMENT_LABEL[paymentMethod] ? ([["Thanh toán", PAYMENT_LABEL[paymentMethod]]] as [string, string][]) : []),
  ];

  const textMain = isDark ? "#F8FAFC" : "#0F172A";
  const textSub = isDark ? "#94A3B8" : "#475569";
  const cardBg = isDark ? "#1E222B" : "#FFFFFF";
  const cardBorder = isDark ? "#2D3748" : "#E2E8F0";

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111318" : "#F5F6FA" }}>
      <Stack.Screen options={{ gestureEnabled: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top", "bottom"]}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 16, paddingTop: 24, paddingBottom: 150 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center">
            <Animated.View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark ? "#00754525" : "#E6F2EC",
                opacity: fade,
                transform: [{ scale }],
              }}
            >
              <Ionicons name="checkmark-circle" size={64} color="#007545" />
            </Animated.View>

            <Text className="font-black text-center mt-5" style={{ color: textMain, fontSize: FONT_SIZE.xl + 2 }}>
              Đặt tour thành công
            </Text>
            <Text className="text-center mt-2" style={{ color: textSub, fontSize: FONT_SIZE.sm, lineHeight: 22, maxWidth: 340 }}>
              Yêu cầu đặt tour của bạn đã được ghi nhận và đang chờ xác nhận. Nhân viên chăm sóc khách hàng sẽ liên hệ với bạn trong thời gian sớm nhất.
            </Text>
          </View>

          <View
            className="mt-6 p-4"
            style={[
              { backgroundColor: cardBg, borderWidth: 1, borderColor: cardBorder, borderRadius: RADIUS.lg },
              getShadow(isDark, "sm"),
            ]}
          >
            {!!tourName && (
              <Text className="font-black" style={{ color: textMain, fontSize: FONT_SIZE.md, lineHeight: 24 }} numberOfLines={3}>
                {tourName}
              </Text>
            )}
            {rows.map(([k, v]) => (
              <View key={k} className="flex-row justify-between mt-2.5" style={{ gap: 12 }}>
                <Text style={{ color: textSub, fontSize: FONT_SIZE.sm }}>{k}</Text>
                <Text className="font-semibold flex-1 text-right" style={{ color: textMain, fontSize: FONT_SIZE.sm }}>
                  {v}
                </Text>
              </View>
            ))}
            {Number.isFinite(total) && total > 0 && (
              <View
                className="flex-row justify-between items-center mt-3 pt-3"
                style={{ borderTopWidth: 1, borderTopColor: cardBorder }}
              >
                <Text className="font-bold" style={{ color: textMain, fontSize: FONT_SIZE.sm }}>
                  Tổng tiền tạm tính
                </Text>
                <Text className="font-black" style={{ color: "#D0021B", fontSize: FONT_SIZE.lg }}>
                  {formatCurrency(total)}
                </Text>
              </View>
            )}
          </View>

          <View className="mt-6" style={{ gap: 10 }}>
            <TouchableOpacity activeOpacity={0.85} onPress={goHistory} accessibilityRole="button">
              <LinearGradient
                colors={isDark ? ["#7F1D1D", "#991B1B"] : ["#D0021B", "#B30118"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: 50, borderRadius: RADIUS.pill, alignItems: "center", justifyContent: "center", flexDirection: "row" }}
              >
                <Ionicons name="receipt-outline" size={18} color="#FFFFFF" />
                <Text className="font-bold text-white ml-2" style={{ fontSize: FONT_SIZE.md }}>
                  Đến lịch sử
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goHome}
              accessibilityRole="button"
              className="items-center justify-center flex-row"
              style={{
                height: 50,
                borderRadius: RADIUS.pill,
                borderWidth: 1.5,
                borderColor: isDark ? "#F87171" : "#D0021B",
                backgroundColor: isDark ? "transparent" : "#FFFFFF",
              }}
            >
              <Ionicons name="home-outline" size={18} color={isDark ? "#F87171" : "#D0021B"} />
              <Text className="font-bold ml-2" style={{ color: isDark ? "#F87171" : "#D0021B", fontSize: FONT_SIZE.md }}>
                Đến trang chủ
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <ZaloFloatingButton />
    </View>
  );
}
