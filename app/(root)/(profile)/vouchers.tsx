import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { getVouchers, VoucherItem } from "@/services/voucher";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function VouchersScreen() {
  const router = useRouter();
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await getVouchers(1, 20);
        const voucherData = Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        setVouchers(voucherData);
      } catch (error) {
        console.error("Lỗi khi tải vouchers:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách voucher.");
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const handleCopyCode = (code: string) => {
    Clipboard.setStringAsync(code);
    Alert.alert("Thành công", `Đã sao chép mã voucher: ${code}`);
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1">
        {/* Header quay lại */}
        <View className="flex-row items-center px-4 py-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white/60"}`}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#93C5FD" : "#D0021B"}
            />
          </TouchableOpacity>
          <Text
            className={`text-xl font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}
          >
            Kho Voucher Của Bạn
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#D0021B"}
            />
            <Text
              className={`font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Đang tải danh sách voucher...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 20,
              paddingBottom: 40,
            }}
          >
            {vouchers.map((item) => (
              <View
                key={item.id}
                className={`rounded-[24px] p-5 mb-5 border ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                    : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
                }`}
              >
                {/* Top row: Icon and title info */}
                <View className="flex-row items-center">
                  <View
                    className={`w-12 h-12 rounded-2xl items-center justify-center shadow-md ${
                      isDark
                        ? "bg-slate-700 border border-slate-600 shadow-black/20"
                        : "bg-[#D0021B] shadow-red-500/20"
                    }`}
                  >
                    <Ionicons
                      name="gift"
                      size={24}
                      color={isDark ? "#93C5FD" : "#FFFFFF"}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text
                      className={`font-black uppercase tracking-wider ${
                        isDark ? "text-blue-400" : "text-[#D0021B]"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {item.subtitle}
                    </Text>
                    <Text
                      className={`font-black mt-0.5 ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      className={`font-semibold mt-1 ${
                        isDark ? "text-slate-400" : "text-slate-400"
                      }`}
                      style={{ fontSize: FONT_SIZE.card }}
                    >
                      {item.expiry}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text
                  className={`mt-4 leading-6 ${
                    isDark ? "text-slate-300" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {item.description}
                </Text>

                {/* Divider */}
                <View
                  className={`h-[1px] my-4 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                />

                {/* Code row: copy button */}
                <View
                  className={`flex-row justify-between items-center rounded-2xl p-3 border ${
                    isDark
                      ? "bg-slate-900/60 border-slate-700/50"
                      : "bg-slate-50 border-slate-100"
                  }`}
                >
                  <View>
                    <Text
                      className={`font-bold uppercase ${
                        isDark ? "text-slate-500" : "text-slate-400"
                      }`}
                      style={{ fontSize: FONT_SIZE.card }}
                    >
                      Mã ưu đãi
                    </Text>
                    <Text
                      className={`font-black mt-0.5 uppercase tracking-wider ${
                        isDark ? "text-blue-400" : "text-[#1E3A8A]"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {item.code}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleCopyCode(item.code)}
                    activeOpacity={0.7}
                    className={`rounded-xl px-4 py-2 ${
                      isDark
                        ? "bg-slate-700 active:bg-slate-600 border border-slate-600"
                        : "bg-[#D0021B]"
                    }`}
                  >
                    <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>
                      Sao chép mã
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
