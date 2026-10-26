import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { getVouchers } from "@/services/voucher";
import { setPendingVoucherSelection } from "@/services/voucherSelection";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Mirrors checkout's local ExtendedVoucher — API returns more fields than the base VoucherItem.
interface ExtendedVoucher {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  expiry: string;
  tag: string;
  description: string;
  value?: number;
  max?: number;
  userId?: string;
  usercreatedId?: string;
  status?: boolean;
  reuse?: boolean;
}

/**
 * Grab-style voucher picker: a dedicated screen (not inline in checkout) listing
 * every available voucher plus a manual code entry. Tapping "Chọn" on a row or
 * confirming a typed code writes the selection via {@link setPendingVoucherSelection}
 * and navigates back — checkout reads it on focus (see checkout.tsx).
 */
export default function VoucherPickerScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const params = useLocalSearchParams<{ selectedId?: string }>();

  const [vouchers, setVouchers] = useState<ExtendedVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(params.selectedId ?? null);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true);
        const res = await getVouchers(1, 50);
        const data = Array.isArray(res.data?.items) ? res.data.items : [];
        setVouchers(data);
      } catch (error) {
        console.error("Lỗi tải vouchers trong voucher-picker:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVouchers();
  }, []);

  const confirmSelection = (voucher: ExtendedVoucher | null) => {
    setPendingVoucherSelection<ExtendedVoucher>(voucher);
    router.back();
  };

  const handleApplyTypedCode = () => {
    const voucher = vouchers.find(
      (v) => v.code.trim().toLowerCase() === voucherCode.trim().toLowerCase(),
    );
    if (!voucher) {
      setCodeError("Mã voucher không tồn tại hoặc không khả dụng.");
      return;
    }
    setCodeError("");
    confirmSelection(voucher);
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
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
          <Text
            className={`font-black ml-4 ${isDark ? "text-slate-100" : "text-slate-800"}`}
            style={{ fontSize: FONT_SIZE.xl }}
          >
            Chọn voucher
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        >
          {/* Manual code entry */}
          <Text
            className={`font-bold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
            style={{ fontSize: FONT_SIZE.xs }}
          >
            Nhập mã ưu đãi
          </Text>
          <View className="flex-row items-center">
            <TextInput
              placeholder="Ví dụ: SUMMER2026"
              placeholderTextColor={isDark ? "#64748B" : "#94A3B8"}
              value={voucherCode}
              onChangeText={setVoucherCode}
              autoCapitalize="characters"
              style={{ fontSize: FONT_SIZE.xs }}
              className={`flex-1 rounded-xl px-4 py-3 border ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-white"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            />
            <TouchableOpacity
              className="ml-2 bg-[#D0021B] rounded-xl px-4 py-3"
              onPress={handleApplyTypedCode}
            >
              <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
          {!!codeError && (
            <Text className="text-red-500 mt-2" style={{ fontSize: FONT_SIZE.xs }}>
              {codeError}
            </Text>
          )}

          <Text
            className={`mt-4 mb-2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            style={{ fontSize: FONT_SIZE.xs }}
          >
            Hoặc chọn một voucher bên dưới (bấm lần nữa để bỏ chọn)
          </Text>

          {/* Voucher list */}
          {loading ? (
            <ActivityIndicator size="small" color={isDark ? "#94A3B8" : "#D0021B"} className="py-6" />
          ) : vouchers.length > 0 ? (
            vouchers.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  // Kiểu Grab: bấm để chọn, bấm lần nữa vào đúng voucher đó để bỏ chọn.
                  onPress={() => setSelectedId((prev) => (prev === item.id ? null : item.id))}
                  className={`rounded-2xl p-4 mb-3 border ${
                    isSelected
                      ? isDark
                        ? "bg-slate-800 border-blue-400"
                        : "bg-red-50 border-[#D0021B]"
                      : isDark
                        ? "bg-slate-900/40 border-slate-750"
                        : "bg-white border-slate-200/60"
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-10 h-10 rounded-xl items-center justify-center ${
                        isDark ? "bg-slate-800 border border-slate-700" : "bg-[#D0021B]"
                      }`}
                    >
                      <Ionicons name="gift" size={20} color={isDark ? "#93C5FD" : "#FFFFFF"} />
                    </View>
                    <View className="ml-3.5 flex-1">
                      <Text
                        className={`font-black uppercase tracking-wider ${
                          isDark ? "text-blue-400" : "text-[#D0021B]"
                        }`}
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        {item.subtitle}
                      </Text>
                      <Text
                        className={`font-black mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        {item.title}
                      </Text>
                      <Text className="font-semibold text-slate-400 mt-0.5" style={{ fontSize: FONT_SIZE.card }}>
                        {item.expiry}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={24}
                      color={isSelected ? "#D0021B" : isDark ? "#475569" : "#CBD5E1"}
                    />
                  </View>
                  <Text
                    className={`mt-3 leading-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    {item.description}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text
              className={`text-center py-4 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Không tìm thấy voucher nào khả dụng
            </Text>
          )}
        </ScrollView>

        {/* OK button */}
        <View className="px-5 pb-4 pt-2">
          <PrimaryButton
            label="OK"
            fullWidth
            onPress={() => {
              const chosen = selectedId ? vouchers.find((v) => v.id === selectedId) ?? null : null;
              confirmSelection(chosen);
            }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
