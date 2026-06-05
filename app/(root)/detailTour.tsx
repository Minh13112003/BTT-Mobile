import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { getBookingById } from "@/services/booking";
import { TourItem } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface BookingDetail {
  id: string;
  tour: TourItem;
  quantity: number;
  originalPrice?: number;
  discountAmount?: number;
  price: number;
  voucher?: {
    id: string;
    code: string;
    title: string;
    subtitle: string;
    expiry: string;
    tag: string;
    description: string;
    value?: number;
    max?: number;
    status?: boolean;
    reuse?: boolean;
  };
  notice?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export default function DetailTourScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");

  const fetchBookingDetail = async () => {
    if (!id) {
      setError("Mã đơn hàng không hợp lệ");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getBookingById(id);
      if (res && res.data) {
        setBooking(res.data);
      } else {
        setError("Không tìm thấy thông tin đơn hàng");
      }
    } catch (err: any) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      setError("Không thể kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleCopyId = () => {
    if (booking?.id) {
      Clipboard.setString(booking.id);
      Alert.alert("Thành công", `Đã sao chép mã đơn hàng: ${booking.id}`);
    }
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Liên hệ hỗ trợ",
      "Vui lòng gọi hotline 1900 1808 hoặc gửi email tới info@benthanhtourist.com để được trợ giúp sớm nhất.",
    );
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  // Chọn màu status badge
  const getStatusBadgeConfig = (status: string) => {
    switch (status) {
      case "Đã nhận hàng":
      case "Đã thanh toán":
      case "Thành công":
        return {
          bg: isDark
            ? "bg-green-950/40 border-green-800"
            : "bg-green-50 border-green-200",
          text: isDark ? "text-green-400" : "text-green-600",
          icon: "checkmark-circle-outline" as const,
        };
      case "Chờ xử lý":
      case "Chờ thanh toán":
        return {
          bg: isDark
            ? "bg-amber-950/40 border-amber-800"
            : "bg-amber-50 border-amber-200",
          text: isDark ? "text-amber-400" : "text-amber-600",
          icon: "time-outline" as const,
        };
      default:
        return {
          bg: isDark
            ? "bg-slate-800/40 border-slate-700"
            : "bg-slate-50 border-slate-200",
          text: isDark ? "text-slate-400" : "text-slate-600",
          icon: "information-circle-outline" as const,
        };
    }
  };

  return (
    <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header bar */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className={`p-2 rounded-full ${
              isDark ? "bg-slate-800" : "bg-white shadow-sm shadow-slate-200"
            }`}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={isDark ? "#93C5FD" : "#E51F27"}
            />
          </TouchableOpacity>
          <Text
            className={`text-lg font-black ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            Chi Tiết Đơn Hàng
          </Text>
          <View className="w-10 h-10" />
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#E51F27"}
            />
            <Text
              className={`text-sm font-semibold mt-3 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Đang tải thông tin chi tiết...
            </Text>
          </View>
        ) : error || !booking ? (
          <View className="flex-1 justify-center items-center px-6">
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={isDark ? "#EF4444" : "#DC2626"}
            />
            <Text
              className={`text-base font-bold mt-4 text-center ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              {error || "Đã xảy ra lỗi khi tải dữ liệu"}
            </Text>
            <TouchableOpacity
              onPress={fetchBookingDetail}
              className={`mt-6 px-6 py-2.5 rounded-full ${
                isDark ? "bg-slate-700" : "bg-[#E51F27]"
              }`}
            >
              <Text className="text-white font-bold text-sm">Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: 40,
            }}
          >
            {/* 1. TOUR CARD SHOWN */}
            <View
              className={`rounded-[32px] overflow-hidden border shadow-sm ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/60"
                  : "bg-white border-slate-100"
              }`}
            >
              {/* Cover image with overlays */}
              <View className="relative h-56 w-full bg-slate-900/10">
                <Image
                  source={{ uri: booking.tour.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
                {/* Rating Badge */}
                <View
                  className={`absolute top-4 right-4 rounded-full px-3 py-1 flex-row items-center ${
                    isDark ? "bg-slate-900/95" : "bg-white/95 shadow-sm"
                  }`}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    className={`text-xs font-black ml-1 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                  >
                    {booking.tour.rating}
                  </Text>
                  <Text className="text-[10px] text-slate-400 ml-0.5">
                    ({booking.tour.reviewsCount})
                  </Text>
                </View>

                {/* Duration Badge */}
                <View className="absolute bottom-4 left-4 bg-[#E51F27] px-3.5 py-1.5 rounded-2xl shadow-md">
                  <Text className="text-[11px] text-white font-black uppercase tracking-wider">
                    {booking.tour.duration}
                  </Text>
                </View>
              </View>

              {/* Title & Info */}
              <View className="p-5">
                <Text
                  className={`text-base font-black leading-6 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {booking.tour.name}
                </Text>

                <View className="flex-row items-start justify-between mt-4 pt-4 border-t border-slate-100/50">
                  <View className="flex-1 mr-3">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Đơn giá trọn gói
                    </Text>

                    <Text
                      className={`text-lg font-black mt-0.5 ${
                        isDark ? "text-slate-200" : "text-[#E51F27]"
                      }`}
                    >
                      {formatCurrency(booking.tour.price)}
                    </Text>
                  </View>

                  <View
                    className={`px-3 py-1.5 rounded-full border self-start ${
                      isDark
                        ? "border-slate-700 bg-slate-800"
                        : "border-red-100 bg-red-50"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black ${
                        isDark ? "text-slate-300" : "text-red-500"
                      }`}
                    >
                      {booking.tour.hasVat ? "Đã bao gồm VAT" : "Chưa gồm VAT"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. ORDER DETAILS CARD */}
            <View
              className={`rounded-[32px] p-6 mt-6 border shadow-sm ${
                isDark
                  ? "bg-slate-800/90 border-slate-700/60"
                  : "bg-white border-slate-100"
              }`}
            >
              <Text
                className={`text-sm font-black mb-4 uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Thông tin giao dịch
              </Text>

              {/* Status Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Trạng thái đơn hàng
                </Text>
                <View
                  className={`flex-row items-center px-3 py-1 rounded-full border ${
                    getStatusBadgeConfig(booking.status).bg
                  }`}
                >
                  <Ionicons
                    name={getStatusBadgeConfig(booking.status).icon}
                    size={13}
                    color={
                      isDark
                        ? getStatusBadgeConfig(booking.status).text ===
                          "text-green-400"
                          ? "#4ADE80"
                          : "#FBBF24"
                        : getStatusBadgeConfig(booking.status).text ===
                            "text-green-600"
                          ? "#16A34A"
                          : "#D97706"
                    }
                  />
                  <Text
                    className={`text-[11px] font-black ml-1 uppercase tracking-wide ${
                      getStatusBadgeConfig(booking.status).text
                    }`}
                  >
                    {booking.status}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Order ID Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Mã đơn hàng
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyId}
                  className="flex-row items-center"
                >
                  <Text
                    className={`text-xs font-black mr-1 ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    #{booking.id}
                  </Text>
                  <Ionicons
                    name="copy-outline"
                    size={14}
                    color={isDark ? "#94A3B8" : "#64748B"}
                  />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Quantity Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Số lượng đặt
                </Text>
                <Text
                  className={`text-xs font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {booking.quantity} khách
                </Text>
              </View>

              {/* Original Price Row (if present) */}
              {booking.originalPrice !== undefined && (
                <>
                  <View
                    className={`h-[1px] my-1 ${isDark ? "bg-slate-700/40" : "bg-slate-100"}`}
                  />
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text
                      className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Tạm tính
                    </Text>
                    <Text
                      className={`text-xs font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}
                    >
                      {formatCurrency(booking.originalPrice)}
                    </Text>
                  </View>
                </>
              )}

              {/* Discount Amount Row (if present) */}
              {booking.discountAmount !== undefined &&
                booking.discountAmount > 0 && (
                  <>
                    <View
                      className={`h-[1px] my-1 ${isDark ? "bg-slate-700/40" : "bg-slate-100"}`}
                    />
                    <View className="flex-row justify-between items-center py-2.5">
                      <Text className="text-xs font-semibold text-green-500">
                        Giảm giá voucher
                      </Text>
                      <Text className="text-xs font-black text-green-500">
                        -{formatCurrency(booking.discountAmount)}
                      </Text>
                    </View>
                  </>
                )}

              {/* Voucher Row (if present) */}
              {booking.voucher && (
                <>
                  <View
                    className={`h-[1px] my-1 ${isDark ? "bg-slate-700/40" : "bg-slate-100"}`}
                  />
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text
                      className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Voucher đã áp dụng
                    </Text>
                    <View className="flex-row items-center">
                      <Ionicons
                        name="gift-outline"
                        size={14}
                        color={isDark ? "#93C5FD" : "#E51F27"}
                      />
                      <Text className="text-xs font-extrabold text-blue-500 dark:text-blue-400 ml-1">
                        {booking.voucher.code}
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {/* Notice Row (if present) */}
              {booking.notice ? (
                <>
                  <View
                    className={`h-[1px] my-1 ${isDark ? "bg-slate-700/40" : "bg-slate-100"}`}
                  />
                  <View className="flex-col py-2.5">
                    <Text
                      className={`text-xs font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Ghi chú đặt tour
                    </Text>
                    <Text
                      className={`text-xs italic ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {booking.notice}
                    </Text>
                  </View>
                </>
              ) : null}

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Price Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Tổng thanh toán
                </Text>
                <Text
                  className={`text-sm font-black ${
                    isDark ? "text-slate-200" : "text-[#E51F27]"
                  }`}
                >
                  {formatCurrency(booking.price)}
                </Text>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Created At Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Thời gian đặt
                </Text>
                <Text
                  className={`text-xs font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {formatDateTime(booking.createdAt)}
                </Text>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Updated At Row */}
              <View className="flex-row justify-between items-center py-2.5">
                <Text
                  className={`text-xs font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Cập nhật cuối
                </Text>
                <Text
                  className={`text-xs font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {formatDateTime(booking.updatedAt)}
                </Text>
              </View>
            </View>

            {/* 3. HELP / CONTACT ACTION */}
            <TouchableOpacity
              onPress={handleContactSupport}
              activeOpacity={0.8}
              className={`rounded-[24px] p-4 mt-6 flex-row items-center justify-center border border-dashed ${
                isDark
                  ? "bg-slate-800/20 border-slate-700"
                  : "bg-slate-50/50 border-slate-200"
              }`}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color={isDark ? "#94A3B8" : "#475569"}
              />
              <Text
                className={`text-xs font-black ml-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Bạn cần hỗ trợ về đơn hàng này?
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
