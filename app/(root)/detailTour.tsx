import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { getBookingById } from "@/services/booking";
import { TourDetail } from "@/services/tour";
import { formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";

import { HighlightChips } from "@/components/tour/HighlightChips";
import { TermsAccordion } from "@/components/tour/TermsAccordion";
import { TourScheduleAccordion } from "@/components/tour/TourScheduleAccordion";
import { TripInfoCard } from "@/components/tour/TripInfoCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
interface BookingDetail {
  id: string;
  tour: TourDetail;
  departure?: {
    id?: string;
    tourCode?: string;
    departureDate?: string;
    price?: number;
    availableSeats?: number;
  };
  quantity: number;
  passengers?: {
    adults?: number;
    adultUnitPrice?: number;
    adultTotal?: number;
    children?: number;
    childUnitPrice?: number;
    childTotal?: number;
    infants?: number;
    infantUnitPrice?: number;
    infantTotal?: number;
  };
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
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  status: string;
}

const MAP_STATUS_VN: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

export default function DetailTourScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const { scale: imageScale, setScale: setImageScale, panHandlers: imagePanHandlers } = usePinchToZoom(1, 1, 4.0);

  const handleCloseModal = () => {
    setZoomImageUrl(null);
    setImageScale(1);
  };

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");

  const sectionCardClass = `
        rounded-[24px]
        p-5
        mt-6
        border
        ${isDark ? "bg-slate-800/90 border-slate-700/60" : "bg-white border-slate-100"}
    `;

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

  const handleCopyTourCode = () => {
    const code = booking?.departure?.tourCode ?? booking?.tour?.code;
    if (code) {
      Clipboard.setString(code);
      Alert.alert("Thành công", `Đã sao chép mã tour: ${code}`);
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
    : (["#F5F6FA", "#F5F6FA"] as const);

  // Chọn màu status badge
  const getStatusBadgeConfig = (status: string) => {
    const statusVn = MAP_STATUS_VN[status] || status;
    switch (statusVn) {
      case "Đã nhận hàng":
      case "Đã thanh toán":
      case "Thành công":
      case "Đã xác nhận":
      case "Đã hoàn thành":
        return {
          bg: isDark
            ? "bg-green-950/40 border-green-800"
            : "bg-green-50 border-green-200",
          text: isDark ? "text-green-400" : "text-green-600",
          icon: "checkmark-circle-outline" as const,
        };
      case "Chờ xử lý":
      case "Chờ thanh toán":
      case "Đang diễn ra":
        return {
          bg: isDark
            ? "bg-amber-950/40 border-amber-800"
            : "bg-amber-50 border-amber-200",
          text: isDark ? "text-amber-400" : "text-amber-600",
          icon: "time-outline" as const,
        };
      case "Đã hủy":
      case "Đã hoàn tiền":
        return {
          bg: isDark
            ? "bg-red-950/40 border-red-800"
            : "bg-red-50 border-red-200",
          text: isDark ? "text-red-400" : "text-red-600",
          icon: "close-circle-outline" as const,
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
              color={isDark ? "#93C5FD" : "#D0021B"}
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
              color={isDark ? "#94A3B8" : "#D0021B"}
            />
            <Text
              className={`font-semibold mt-3 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
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
              className={`font-bold mt-4 text-center ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              {error || "Đã xảy ra lỗi khi tải dữ liệu"}
            </Text>
            <TouchableOpacity
              onPress={fetchBookingDetail}
              className={`mt-6 px-6 py-2.5 rounded-full ${
                isDark ? "bg-slate-700" : "bg-[#D0021B]"
              }`}
            >
              <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            ref={scrollViewRef}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setShowBackToTop(offsetY > 300);
            }}
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
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setZoomImageUrl(booking.tour.imageUrl)}
                  style={{ width: "100%", height: "100%" }}
                >
                  <Image
                    source={{ uri: booking.tour.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                {/* Rating Badge */}
                <View
                  className={`absolute top-4 right-4 rounded-full px-3 py-1 flex-row items-center ${
                    isDark ? "bg-slate-900/95" : "bg-white/95 shadow-sm"
                  }`}
                >
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text
                    className={`font-black ml-1 ${
                      isDark ? "text-slate-100" : "text-slate-800"
                    }`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    {booking.tour.rating}
                  </Text>
                  <Text className="text-slate-400 ml-0.5" style={{ fontSize: FONT_SIZE.xs }}>
                    ({booking.tour.reviewsCount})
                  </Text>
                </View>

                {/* Duration Badge */}
                <View className="absolute bottom-4 left-4 bg-[#D0021B] px-3.5 py-1.5 rounded-2xl shadow-md">
                  <Text className="text-white font-black uppercase tracking-wider" style={{ fontSize: FONT_SIZE.xs }}>
                    {booking.tour.duration}
                  </Text>
                </View>
              </View>

              {/* Title & Info */}
              <View className="p-5">
                <Text
                  className={`font-black leading-8 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xl }}
                >
                  {booking.tour.name}
                </Text>

                <View className="flex-row items-start justify-between mt-4 pt-4 border-t border-slate-100/50">
                  <View className="flex-1 mr-3">
                    <Text className="font-bold text-slate-400 uppercase tracking-wide" style={{ fontSize: FONT_SIZE.card }}>
                      Đơn giá trọn gói
                    </Text>

                    <Text
                      className={`text-lg font-black mt-0.5 ${
                        isDark ? "text-slate-200" : "text-[#D0021B]"
                      }`}
                    >
                      {formatCurrency(booking.price)}
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
                      className={`font-black ${
                        isDark ? "text-slate-300" : "text-red-500"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {booking.tour.hasVat ? "Đã bao gồm VAT" : "Chưa gồm VAT"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 2. ORDER DETAILS CARD */}
            <View className={sectionCardClass}>
              <Text
                className={`font-black mb-4 uppercase tracking-wider ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Thông tin giao dịch
              </Text>

              {/* Status Row */}
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
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
                          : getStatusBadgeConfig(booking.status).text ===
                            "text-amber-400"
                            ? "#FBBF24"
                            : getStatusBadgeConfig(booking.status).text ===
                              "text-red-400"
                              ? "#F87171"
                              : "#94A3B8"
                        : getStatusBadgeConfig(booking.status).text ===
                            "text-green-600"
                          ? "#16A34A"
                          : getStatusBadgeConfig(booking.status).text ===
                            "text-amber-600"
                            ? "#D97706"
                            : getStatusBadgeConfig(booking.status).text ===
                              "text-red-600"
                              ? "#DC2626"
                              : "#64748B"
                    }
                  />
                  <Text
                    className={`font-black ml-1 uppercase tracking-wide ${
                      getStatusBadgeConfig(booking.status).text
                    }`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    {MAP_STATUS_VN[booking.status] || booking.status}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Tour Code Row */}
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Mã Tour
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleCopyTourCode}
                  className="flex-row items-center"
                >
                  <Text
                    className={`font-black mr-1 ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    {booking?.departure?.tourCode ?? booking.tour.code ?? "-"}
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

              {/* Departure Date Row */}
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Ngày khởi hành
                </Text>
                <Text
                  className={`font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {booking?.departure?.departureDate
                    ? formatDepartureDate(booking.departure.departureDate)
                    : "Chưa cập nhật"}
                </Text>
              </View>

              {/* Reminder Row */}
              <View className="pb-2">
                <Text
                  className={`italic ${
                    isDark ? "text-amber-400" : "text-amber-600"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  * Thời gian chi tiết xin hãy xem ở phần{" "}
                  <Text className="font-extrabold not-italic uppercase" style={{ fontSize: FONT_SIZE.xs }}>
                    LỊCH TRÌNH CHI TIẾT
                  </Text>
                </Text>
              </View>

              {/* Divider */}
              <View
                className={`h-[1px] my-1 ${
                  isDark ? "bg-slate-700/40" : "bg-slate-100"
                }`}
              />

              {/* Quantity Row */}
              <View className="py-3.5">
                <View className="flex-col items-start gap-2">
                  <Text
                    className={`font-semibold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    Số lượng đặt
                  </Text>
                  <Text
                    className={`font-black ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    {booking.quantity} khách
                  </Text>
                </View>
                {/* Chi tiết người lớn / trẻ em / em bé */}
                {booking.passengers && (
                  <View
                    className={`flex-row flex-wrap gap-2 mt-2 px-3 py-2.5 rounded-2xl ${
                      isDark ? "bg-slate-900/50" : "bg-slate-50"
                    }`}
                  >
                    {(booking.passengers.adults ?? 0) > 0 && (
                      <View className="flex-row items-center mr-4">
                        <Ionicons
                          name="person"
                          size={13}
                          color={isDark ? "#94A3B8" : "#64748B"}
                        />
                        <Text
                          className={`ml-1 font-semibold ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                          style={{ fontSize: FONT_SIZE.xs }}
                        >
                          Người lớn: <Text className="font-black" style={{ fontSize: FONT_SIZE.xs }}>{booking.passengers.adults}</Text>
                        </Text>
                      </View>
                    )}
                    {(booking.passengers.children ?? 0) > 0 && (
                      <View className="flex-row items-center mr-4">
                        <Ionicons
                          name="happy"
                          size={13}
                          color={isDark ? "#94A3B8" : "#64748B"}
                        />
                        <Text
                          className={`ml-1 font-semibold ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                          style={{ fontSize: FONT_SIZE.xs }}
                        >
                          Trẻ em: <Text className="font-black" style={{ fontSize: FONT_SIZE.xs }}>{booking.passengers.children}</Text>
                        </Text>
                      </View>
                    )}
                    {(booking.passengers.infants ?? 0) > 0 && (
                      <View className="flex-row items-center">
                        <Ionicons
                          name="heart"
                          size={13}
                          color={isDark ? "#94A3B8" : "#64748B"}
                        />
                        <Text
                          className={`ml-1 font-semibold ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                          style={{ fontSize: FONT_SIZE.xs }}
                        >
                          Em bé: <Text className="font-black" style={{ fontSize: FONT_SIZE.xs }}>{booking.passengers.infants}</Text>
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Original Price Row (if present) */}
              {booking.originalPrice !== undefined && (
                <>
                  <View
                    className={`h-[1px] my-1 ${isDark ? "bg-slate-700/40" : "bg-slate-100"}`}
                  />
                  <View className="flex-col items-start gap-2 py-3.5">
                    <Text
                      className={`font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      Tạm tính
                    </Text>
                    <Text
                      className={`font-black ${isDark ? "text-slate-200" : "text-slate-800"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
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
                    <View className="flex-col items-start gap-2 py-3.5">
                      <Text className="font-semibold text-green-500" style={{ fontSize: FONT_SIZE.xs }}>
                        Giảm giá voucher
                      </Text>
                      <Text className="font-black text-green-500" style={{ fontSize: FONT_SIZE.xs }}>
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
                  <View className="flex-col items-start gap-2 py-3.5">
                    <Text
                      className={`font-semibold flex-shrink-0 mr-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      Voucher đã áp dụng
                    </Text>
                    <View className="flex-row items-center flex-shrink-0">
                      <Ionicons
                        name="gift-outline"
                        size={14}
                        color={isDark ? "#93C5FD" : "#D0021B"}
                      />
                      <Text
                        className="font-extrabold text-blue-500 dark:text-blue-400 ml-1"
                        style={{ fontSize: FONT_SIZE.xs }}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                      >
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
                  <View className="flex-col py-3.5">
                    <Text
                      className={`font-semibold mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      Ghi chú đặt tour
                    </Text>
                    <Text
                      className={`italic ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
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
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Tổng thanh toán
                </Text>
                <Text
                  className={`font-black ${
                    isDark ? "text-slate-200" : "text-[#D0021B]"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
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
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Thời gian đặt
                </Text>
                <Text
                  className={`font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
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
              <View className="flex-col items-start gap-2 py-3.5">
                <Text
                  className={`font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Cập nhật cuối
                </Text>
                <Text
                  className={`font-black ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {formatDateTime(booking.updatedAt)}
                </Text>
              </View>

              {/* Payment Method Row */}
              {booking.paymentMethod && (
                <>
                  <View
                    className={`h-[1px] my-1 ${
                      isDark ? "bg-slate-700/40" : "bg-slate-100"
                    }`}
                  />
                  <View className="py-3.5">
                    <View className="flex-col items-start gap-2">
                      <Text
                        className={`font-semibold ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        Phương thức thanh toán
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="mr-1 text-base" style={{ fontSize: FONT_SIZE.xs }}>
                          {booking.paymentMethod === "AT_OFFICE" ? "🏢" : "🏦"}
                        </Text>
                        <Text
                          className={`font-black ${
                            isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                          style={{ fontSize: FONT_SIZE.xs }}
                        >
                          {booking.paymentMethod === "AT_OFFICE"
                            ? "Tại Văn Phòng"
                            : "Chuyển khoản"}
                        </Text>
                      </View>
                    </View>

                    {booking.paymentMethod === "AT_OFFICE" && (
                      <View
                        className={`mt-2.5 rounded-2xl px-4 py-3 ${
                          isDark ? "bg-slate-900/60" : "bg-red-50/60"
                        }`}
                      >
                        <Text
                          style={{ lineHeight: 22, fontSize: FONT_SIZE.xs }}
                          className={`${
                            isDark ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {
                            "CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH (BENTHANH TOURIST)\nTrụ sở: Số 03 - 05 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh\nTel: 028 3822 7788"
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </View>

            {/*  HIGHLIGHTS */}
            <View className={sectionCardClass}>
              <HighlightChips items={booking.tour.highlights} />
            </View>

            {/* Lịch trình */}
            {booking.tour.schedules?.length ? (
              <View className={sectionCardClass}>
                <SectionTitle title="Lịch trình dự kiến" />
                <TourScheduleAccordion schedules={booking.tour.schedules} />
                <View
                  className={`flex-row items-start mt-4 p-3 rounded-2xl ${isDark ? "bg-amber-950/30 border border-amber-800/40" : "bg-amber-50 border border-amber-200"}`}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={isDark ? "#FCD34D" : "#D97706"}
                    style={{ marginTop: 1 }}
                  />
                  <Text
                    className={`flex-1 ml-2 italic leading-5 ${isDark ? "text-amber-300" : "text-amber-700"}`}
                    style={{ fontSize: FONT_SIZE.card }}
                  >
                    Lưu ý: Đây là lịch trình dự kiến cho chuyến đi, lịch trình
                    chi tiết chúng tôi sẽ cập nhật cho quý khách trước ngày khởi
                    hành 3 ngày.
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Thông tin chuyến đi */}
            <View className={sectionCardClass}>
              <TripInfoCard tour={booking.tour} />
            </View>

            {/* Điều khoản và Lưu ý chung */}
            <View className={sectionCardClass}>
              <SectionTitle title="Điều khoản & Lưu ý chung" />
              <TermsAccordion />
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
                className={`text-base font-black ml-2 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Bạn cần hỗ trợ về đơn hàng này?
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Image Zoom Modal */}
        <Modal
          visible={zoomImageUrl !== null}
          transparent={true}
          onRequestClose={handleCloseModal}
          animationType="fade"
        >
          <View
            {...imagePanHandlers}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.95)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              style={{
                position: "absolute",
                top: insets.top + 10,
                right: 20,
                zIndex: 10,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Full Screen Image */}
            {zoomImageUrl && (
              <Image
                source={{ uri: zoomImageUrl }}
                style={{
                  width: "100%",
                  height: "85%",
                  transform: [{ scale: imageScale }],
                }}
                resizeMode="contain"
              />
            )}
          </View>
        </Modal>

        {/* Back to Top Button */}
        {showBackToTop && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
            style={{
              position: "absolute",
              bottom: 30,
              right: 20,
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: "#D0021B",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 6,
              zIndex: 99,
            }}
          >
            <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
