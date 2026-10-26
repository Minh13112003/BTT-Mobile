import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";
import { getBookingById } from "@/services/booking";
import { getTourItemMapped, TourDetail } from "@/services/tour";
import { formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TourHero } from "@/components/tour/TourHero";
import { useChatbotLift } from "@/components/chatbot/ChatbotFloatingButton";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import CustomAlert from "@/components/CustomAlert";
import { HighlightChips } from "@/components/tour/HighlightChips";
import { TermsAccordion } from "@/components/tour/TermsAccordion";
import { TourScheduleAccordion } from "@/components/tour/TourScheduleAccordion";
// DEMO — biến thể HTML cho booking nguồn Laravel (song song bản NestJS tĩnh phía trên)
import { TermsHtmlAccordion } from "@/components/tour/TermsHtmlAccordion";
import { TourScheduleHtmlAccordion } from "@/components/tour/TourScheduleHtmlAccordion";
import { PriceIncludedCard } from "@/components/tour/PriceIncludedCard";
import { FeaturedHighlightsCard } from "@/components/tour/FeaturedHighlightsCard";
import { TripInfoCard } from "@/components/tour/TripInfoCard";
import { BookingGuest } from "@/components/guest/BookingGuestList"; // [TẠM TẮT] BookingGuestList đang comment ở JSX bên dưới
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
  /** DEMO — nguồn booking: "NESTJS" | "LARAVEL" (xem .claude/rules/laravel-migration.md). */
  source?: string;
  /** DEMO — id tour Laravel, dùng gọi lại GET /api/tour/item để render đầy đủ. */
  tourKey?: string | null;
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
  /** Danh sách hành khách (booking cũ không có). */
  guests?: BookingGuest[];
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
  const chatbotLift = useChatbotLift();
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const {
    scale: imageScale,
    setScale: setImageScale,
    panHandlers: imagePanHandlers,
  } = usePinchToZoom(1, 1, 4.0);

  const handleCloseModal = () => {
    setZoomImageUrl(null);
    setImageScale(1);
  };

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning">("success");

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
        const data: BookingDetail = res.data;

        // DEMO — booking nguồn Laravel: NestJS chỉ lưu snapshot rút gọn.
        // Gọi lại benthanhtourist.com /api/tour/item bằng tourKey để có
        // hero ảnh + lịch trình HTML + điều khoản đầy đủ, merge vào booking.tour.
        // Thông tin riêng của đơn (số khách, giá chốt, voucher, status, ngày KH)
        // vẫn giữ nguyên từ NestJS.
        if (data.source === "LARAVEL" && data.tourKey) {
          try {
            const laravelTour = await getTourItemMapped(data.tourKey);
            data.tour = {
              ...laravelTour,
              // Giữ mã tour & VAT theo snapshot NestJS (đúng đợt đã đặt)
              code: data.tour?.code ?? laravelTour.code,
              hasVat: data.tour?.hasVat ?? laravelTour.hasVat,
            };
          } catch (e) {
            console.warn("Không tải được chi tiết tour Laravel, dùng snapshot:", e);
          }
        }

        setBooking(data);
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

  const showAlert = (title: string, message: string, type: "success" | "error" | "warning") => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const handleCopyTourCode = () => {
    const code = booking?.departure?.tourCode ?? booking?.tour?.code;
    if (code) {
      Clipboard.setString(code);
      showAlert("Thành công", `Đã sao chép mã tour: ${code}`, "success");
    }
  };

  const handleContactSupport = () => {
    showAlert(
      "Liên hệ hỗ trợ",
      "Vui lòng gọi hotline 1900 6668 hoặc gửi email tới benthanh@benthanhtourist.com để được trợ giúp sớm nhất.",
      "warning",
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
      <SafeAreaView className="flex-1" edges={[]}>
        {loading ? (
          <>
            <View className="flex-row items-center px-4 py-3" style={{ paddingTop: insets.top + 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white shadow-sm"}`}
              >
                <Ionicons name="arrow-back" size={22} color={isDark ? "#93C5FD" : "#D0021B"} />
              </TouchableOpacity>
              <Text className={`ml-3 text-lg font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                Chi Tiết Đơn Hàng
              </Text>
            </View>
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={isDark ? "#94A3B8" : "#D0021B"} />
              <Text
                className={`font-semibold mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Đang tải thông tin chi tiết...
              </Text>
            </View>
          </>
        ) : error || !booking ? (
          <>
            <View className="flex-row items-center px-4 py-3" style={{ paddingTop: insets.top + 12 }}>
              <TouchableOpacity
                onPress={() => router.back()}
                className={`p-2 rounded-full ${isDark ? "bg-slate-800" : "bg-white shadow-sm"}`}
              >
                <Ionicons name="arrow-back" size={22} color={isDark ? "#93C5FD" : "#D0021B"} />
              </TouchableOpacity>
              <Text className={`ml-3 text-lg font-black ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                Chi Tiết Đơn Hàng
              </Text>
            </View>
            <View className="flex-1 justify-center items-center px-6">
              <Ionicons name="alert-circle-outline" size={64} color={isDark ? "#EF4444" : "#DC2626"} />
              <Text
                className={`font-bold mt-4 text-center ${isDark ? "text-slate-200" : "text-slate-800"}`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                {error || "Đã xảy ra lỗi khi tải dữ liệu"}
              </Text>
              <TouchableOpacity
                onPress={fetchBookingDetail}
                className={`mt-6 px-6 py-2.5 rounded-full ${isDark ? "bg-slate-700" : "bg-[#D0021B]"}`}
              >
                <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>
                  Thử lại
                </Text>
              </TouchableOpacity>
            </View>
          </>
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
              paddingTop: 0,
              paddingBottom: 40,
            }}
          >
          {/* Hero — full-bleed, cuộn cùng nội dung */}
          <View style={{ marginHorizontal: -20 }}>
            <TourHero
              tour={booking.tour}
              onBack={() => router.back()}
              onPressImage={(url) => setZoomImageUrl(url)}
              hideActions
            />
          </View>

          {/* Tên tour + giá + VAT — giống tour/[id] */}
          <View className="px-0 pt-3 pb-1">
            <Text
              className={`font-black leading-8 ${isDark ? "text-slate-50" : "text-slate-900"}`}
              style={{ fontSize: FONT_SIZE.xl }}
            >
              {booking.tour.name}
            </Text>
            <Text
              className="mt-1 font-black text-[#D0021B]"
              style={{ fontSize: FONT_SIZE.xs }}
            >
              {booking.tour.hasVat ? "Đã gồm VAT" : "Chưa gồm VAT"}
            </Text>
            <View className="flex-row items-baseline mt-2">
              <Text
                className={`font-semibold mr-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Đơn giá trọn gói
              </Text>
              <Text
                className={`font-black ${isDark ? "text-slate-200" : "text-[#D0021B]"}`}
                style={{ fontSize: FONT_SIZE.lg }}
              >
                {formatCurrency(booking.price)}
              </Text>
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
                  <Text
                    className="font-extrabold not-italic uppercase"
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
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
                          Người lớn:{" "}
                          <Text
                            className="font-black"
                            style={{ fontSize: FONT_SIZE.xs }}
                          >
                            {booking.passengers.adults}
                          </Text>
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
                          Trẻ em:{" "}
                          <Text
                            className="font-black"
                            style={{ fontSize: FONT_SIZE.xs }}
                          >
                            {booking.passengers.children}
                          </Text>
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
                          Em bé:{" "}
                          <Text
                            className="font-black"
                            style={{ fontSize: FONT_SIZE.xs }}
                          >
                            {booking.passengers.infants}
                          </Text>
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
                      <Text
                        className="font-semibold text-green-500"
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
                        Giảm giá voucher
                      </Text>
                      <Text
                        className="font-black text-green-500"
                        style={{ fontSize: FONT_SIZE.xs }}
                      >
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
                        <Text
                          className="mr-1 text-base"
                          style={{ fontSize: FONT_SIZE.xs }}
                        >
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

            {/* [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] DANH SÁCH HÀNH KHÁCH
            {!!booking.guests?.length && (
              <View className={sectionCardClass}>
                <BookingGuestList guests={booking.guests} />
              </View>
            )}
            */}

            {/*  HIGHLIGHTS */}
            {!!booking.tour.highlights?.length && (
              <View className={sectionCardClass}>
                <HighlightChips items={booking.tour.highlights} />
              </View>
            )}

            {/* DEMO — Lịch trình + dịch vụ + điểm nổi bật (nguồn Laravel, HTML thô) */}
            {booking.source === "LARAVEL" && (
              <>
                <FeaturedHighlightsCard
                  featuredDescription={booking.tour.htmlFeaturedDescription}
                />
                <View className={sectionCardClass}>
                  <SectionTitle title="Lịch trình chuyến đi" />
                  <TourScheduleHtmlAccordion plans={booking.tour.htmlPlans} />
                </View>
                <PriceIncludedCard
                  priceIncluded={booking.tour.htmlPriceIncluded}
                  priceNotIncluded={booking.tour.htmlPriceNotIncluded}
                />
              </>
            )}

            {/* Lịch trình (nguồn NestJS — cấu trúc sáng/trưa/chiều/tối) */}
            {booking.source !== "LARAVEL" && booking.tour.schedules?.length ? (
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

                {/* Lịch trình chi tiết — link sẽ được bổ sung sau */}
                <View className="mt-5">
                  <SectionTitle title="Lịch trình chi tiết" />
                  <View
                    className={`mt-3 rounded-2xl px-4 py-4 border border-dashed ${
                      isDark
                        ? "bg-slate-900/40 border-slate-600"
                        : "bg-slate-50 border-slate-300"
                    }`}
                  >
                    <Text
                      className={`text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      Lịch trình chi tiết sẽ được cập nhật sớm.
                    </Text>
                  </View>
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
              {booking.source === "LARAVEL" ? (
                <TermsHtmlAccordion terms={booking.tour.htmlTerms} />
              ) : (
                <TermsAccordion />
              )}
            </View>

            {/* Đánh giá — chỉ hiển thị khi tour đã hoàn thành */}
            {booking.status === "COMPLETED" && (
              <View className={sectionCardClass}>
                <SectionTitle title="Đánh giá chuyến đi" />
                <View
                  className={`mt-4 rounded-2xl px-4 py-4 border border-dashed ${
                    isDark
                      ? "bg-slate-900/40 border-slate-600"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  <Text
                    className={`text-center ${isDark ? "text-slate-500" : "text-slate-400"}`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    Tính năng đánh giá sẽ được cập nhật sớm.
                  </Text>
                </View>
              </View>
            )}

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

        <CustomAlert
          visible={alertVisible}
          type={alertType}
          title={alertTitle}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />

        {/* Back to Top Button */}
        {showBackToTop && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
            style={{
              position: "absolute",
              bottom: 94 + chatbotLift,
              right: 20,
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: "rgba(208,2,27,0.55)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0,
              shadowRadius: 8,
              elevation: 0,
              zIndex: 99,
            }}
          >
            <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <ZaloFloatingButton />
      </SafeAreaView>
    </LinearGradient>
  );
}
