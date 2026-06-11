import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { booking, PaymentMethod } from "@/services/booking";
import { getVouchers } from "@/services/voucher";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Local interface that matches both mock and API fields to avoid TS compilation errors
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

const DEFAULT_TOUR = {
  id: "t1",
  name: "Du lịch Hàn Quốc (Mùa Hoa Anh Đào): Seoul - Nami - Everland - Công viên Yeouido",
  imageUrl:
    "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500",
  imagePublicId: "tours/f11n619f816v7q004l9b",
  price: 15990000,
  duration: "5 Ngày 4 Đêm",
  rating: 4.9,
  reviewsCount: 124,
  hasVat: true,
};

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  icon: string;
  detail: string;
}[] = [
  {
    id: "AT_OFFICE",
    label: "Tại Văn Phòng",
    icon: "🏢",
    detail: `CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH (BENTHANH TOURIST)
Trụ sở: Số 03 - 05 Nguyễn Huệ, Phường Sài Gòn, TP. Hồ Chí Minh
Tel: 028 3822 7788`,
  },
  {
    id: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    detail: `THÔNG TIN THANH TOÁN CHUYỂN KHOẢN
- Ngân hàng TMCP Ngoại Thương Việt Nam - CN TP.HCM (VCB)
- Tên đơn vị hưởng: CÔNG TY CỔ PHẦN DỊCH VỤ DU LỊCH BẾN THÀNH
- Số tài khoản VNĐ: 007.1001204617
- Tại Ngân Hàng VCB - CN TP.HCM`,
  },
];

const formatFullDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Parse parameters passed from index.tsx or fallback to defaults
  const tourId = (params.id as string) || DEFAULT_TOUR.id;
  const tourName = (params.name as string) || DEFAULT_TOUR.name;
  const tourCode = (params.tourCode as string) || "";
  const tourImageUrl = (params.imageUrl as string) || DEFAULT_TOUR.imageUrl;
  const tourPrice = params.price
    ? parseFloat(params.price as string)
    : DEFAULT_TOUR.price;
  const tourDuration = (params.duration as string) || DEFAULT_TOUR.duration;
  const tourRating = params.rating
    ? parseFloat(params.rating as string)
    : DEFAULT_TOUR.rating;
  const tourReviewsCount = params.reviewsCount
    ? parseInt(params.reviewsCount as string, 10)
    : DEFAULT_TOUR.reviewsCount;
  const tourHasVat =
    params.hasVat !== undefined
      ? params.hasVat === "true"
      : DEFAULT_TOUR.hasVat;

  // Departure info passed from the tour detail screen.
  const departureId = (params.departureId as string) || "";
  const departureDate = (params.departureDate as string) || "";
  const availableSeats = params.availableSeats
    ? parseInt(params.availableSeats as string, 10)
    : Infinity;

  const [quantity, setQuantity] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [vouchers, setVouchers] = useState<ExtendedVoucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<ExtendedVoucher | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  // Load vouchers when component mounts
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoadingVouchers(true);
        // Call the service getVouchers
        const res = await getVouchers(1, 50);
        if (res) {
          const voucherData = Array.isArray(res.data?.items)
            ? res.data.items
            : [];
          setVouchers(voucherData);
        }
      } catch (error) {
        console.error("Lỗi tải vouchers trong checkout:", error);
      } finally {
        setLoadingVouchers(false);
      }
    };
    fetchVouchers();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Pricing calculations
  const originalPrice = tourPrice * quantity;

  // Smart discount calculation parser
  const calculateDiscount = (
    origPrice: number,
    voucherObj: ExtendedVoucher | null,
  ) => {
    if (!voucherObj) return 0;

    // 1. Try to parse percentage from title (e.g. "Giảm 5% tối đa 300k")
    const percentMatch = voucherObj.title?.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1], 10);
      let discount = origPrice * (percent / 100);

      // Apply max limit if available
      if (voucherObj.max) {
        discount = Math.min(discount, voucherObj.max);
      } else {
        // Try parsing max from title (e.g., "tối đa 300k" or "tối đa 2tr")
        const maxMatch = voucherObj.title?.match(
          /tối đa\s+(\d+)\s*(k|tr|triệu)/i,
        );
        if (maxMatch) {
          let multiplier = 1000;
          if (
            maxMatch[2].toLowerCase() === "tr" ||
            maxMatch[2].toLowerCase() === "triệu"
          ) {
            multiplier = 1000000;
          }
          const maxLimit = parseInt(maxMatch[1], 10) * multiplier;
          discount = Math.min(discount, maxLimit);
        }
      }
      return discount;
    }

    // 2. Try to use direct value field (if it exists)
    if (voucherObj.value) {
      if (voucherObj.value <= 100) {
        // percentage
        let discount = origPrice * (voucherObj.value / 100);
        if (voucherObj.max) {
          discount = Math.min(discount, voucherObj.max);
        }
        return discount;
      }
      return Math.min(voucherObj.value, origPrice);
    }

    return 0;
  };

  const discountAmount = calculateDiscount(originalPrice, selectedVoucher);
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  const handleApplyVoucher = (voucher: ExtendedVoucher) => {
    if (selectedVoucher?.id === voucher.id) {
      // Toggle off if already selected
      setSelectedVoucher(null);
    } else {
      setSelectedVoucher(voucher);
    }
  };

  const handleBookingSubmit = () => {
    // Validation before confirming.
    if (!departureId) {
      Alert.alert("Thông báo", "Vui lòng chọn ngày khởi hành");
      return;
    }
    if (!paymentMethod) {
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (availableSeats < quantity) {
      Alert.alert("Thông báo", "Số chỗ không đủ, vui lòng giảm số lượng");
      return;
    }

    Alert.alert(
      "Xác nhận đặt tour",
      "Bạn có chắc chắn muốn đặt chuyến đi này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: performBooking,
        },
      ],
    );
  };

  const performBooking = async () => {
    try {
      setSubmitting(true);
      const bookingData = {
        idTour: tourId,
        departureId,
        quantity,
        paymentMethod: paymentMethod as PaymentMethod,
        voucherCode: selectedVoucher ? selectedVoucher.code : null,
        notice: notice || null,
      };

      const res = await booking(bookingData);
      if (res) {
        Alert.alert("Thành công", "Đặt tour thành công!", [
          {
            text: "Xem lịch sử",
            onPress: () => {
              router.replace("/(root)/(tabs)/history");
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error("Lỗi đặt tour:", error);
      Alert.alert(
        "Thất bại",
        error.response?.data?.message ||
          "Đặt tour không thành công. Vui lòng thử lại sau.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

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
            Thanh Toán
          </Text>
          <View className="w-10 h-10" />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 120,
          }}
        >
          {/* 1. TOUR CARD DETAILS */}
          <View
            className={`rounded-[32px] overflow-hidden border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <View className="relative h-48 w-full bg-slate-900/10">
              <Image
                source={{ uri: tourImageUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
              <View
                className={`absolute top-4 right-4 rounded-full px-3 py-1 flex-row items-center ${
                  isDark ? "bg-slate-900/95" : "bg-white/95 shadow-sm"
                }`}
              >
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text
                  className={`text-base font-black ml-1 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {tourRating}
                </Text>
                <Text className="text-base text-slate-400 ml-0.5">
                  ({tourReviewsCount})
                </Text>
              </View>

              <View className="absolute bottom-4 left-4 bg-[#E51F27] px-3 py-1 rounded-2xl shadow-md">
                <Text className="text-base text-white font-black uppercase tracking-wider">
                  {tourDuration}
                </Text>
              </View>
            </View>

            <View className="p-5">
              <Text
                style={{ fontSize: FONT_SIZE.lg }}
                className={`font-black leading-7 ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                {tourName}
              </Text>

              {/* Selected departure summary */}
              {!!departureDate && (
                <View className="mt-2.5">
                  {!!tourCode && (
                    <Text
                      style={{ fontSize: FONT_SIZE.xs }}
                      className={`font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      🏷️ Mã tour: {tourCode}
                    </Text>
                  )}
                  <Text
                    style={{ fontSize: FONT_SIZE.xs }}
                    className={`font-semibold ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    } ${!!tourCode ? "mt-1" : ""}`}
                  >
                    📅 Ngày khởi hành: {formatFullDate(departureDate)}
                  </Text>
                  {availableSeats !== Infinity && (
                    <Text
                      style={{ fontSize: FONT_SIZE.xs }}
                      className={`mt-1 font-semibold ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      👥 Số chỗ còn: {availableSeats}
                    </Text>
                  )}
                </View>
              )}

              <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                <View>
                  <Text className="text-base font-bold text-slate-400 uppercase tracking-wide">
                    Đơn giá trọn gói
                  </Text>
                  <Text
                    className={`text-base font-black mt-0.5 ${
                      isDark ? "text-slate-200" : "text-[#E51F27]"
                    }`}
                  >
                    {formatCurrency(tourPrice)}
                  </Text>
                </View>

                {tourHasVat && (
                  <View
                    className={`border px-2 py-0.5 rounded-lg ${
                      isDark
                        ? "border-slate-700 bg-slate-750"
                        : "border-red-100 bg-red-50/50"
                    }`}
                  >
                    <Text className="text-base font-black uppercase text-red-500">
                      Đã gồm VAT
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 2. QUANTITY SELECTOR */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text
                  className={`text-base font-black uppercase tracking-wider ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Số lượng khách
                </Text>
                <Text className="text-base text-slate-400 mt-0.5">
                  Đặt chỗ cho chuyến đi của bạn
                </Text>
              </View>

              <View className="flex-row items-center">
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-10 h-10 rounded-xl items-center justify-center border ${
                    isDark
                      ? "bg-slate-700 border-slate-600 active:bg-slate-650"
                      : "bg-slate-100 border-slate-200 active:bg-slate-200"
                  }`}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={isDark ? "#E5E7EB" : "#1F2937"}
                  />
                </TouchableOpacity>

                <Text
                  className={`text-base font-black px-4 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {quantity}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setQuantity(Math.min(availableSeats, quantity + 1))
                  }
                  className={`w-10 h-10 rounded-xl items-center justify-center border ${
                    isDark
                      ? "bg-slate-700 border-slate-600 active:bg-slate-650"
                      : "bg-slate-100 border-slate-200 active:bg-slate-200"
                  }`}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={isDark ? "#E5E7EB" : "#1F2937"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {vouchers && (
            <View className="mt-5 border-t border-slate-100/50 pt-4">
              {/* Input Voucher */}
              <View className="mb-5">
                <Text
                  className={`text-base font-bold mb-2 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
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
                    className={`flex-1 rounded-xl px-4 py-3 border ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-white"
                        : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />

                  <TouchableOpacity
                    className="ml-2 bg-[#E51F27] rounded-xl px-4 py-3"
                    onPress={() => {
                      const voucher = vouchers.find(
                        (v) =>
                          v.code.trim().toLowerCase() ===
                          voucherCode.trim().toLowerCase(),
                      );

                      if (!voucher) {
                        Alert.alert(
                          "Thông báo",
                          "Mã voucher không tồn tại hoặc không khả dụng.",
                        );
                        return;
                      }

                      handleApplyVoucher(voucher);
                    }}
                  >
                    <Text className="text-white font-bold">Áp dụng</Text>
                  </TouchableOpacity>
                </View>

                <Text
                  className={`text-base mt-2 ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Hoặc chọn một voucher bên dưới
                </Text>
              </View>

              {/* Voucher List */}
              {loadingVouchers ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#94A3B8" : "#E51F27"}
                  className="py-4"
                />
              ) : vouchers.length > 0 ? (
                vouchers.map((item) => {
                  const isApplied = selectedVoucher?.id === item.id;

                  return (
                    <View
                      key={item.id}
                      className={`rounded-2xl p-4 mb-4 border ${
                        isDark
                          ? "bg-slate-900/40 border-slate-750"
                          : "bg-slate-50 border-slate-200/60"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <View
                          className={`w-10 h-10 rounded-xl items-center justify-center ${
                            isDark
                              ? "bg-slate-800 border border-slate-700"
                              : "bg-[#E51F27] shadow-sm shadow-red-500/10"
                          }`}
                        >
                          <Ionicons
                            name="gift"
                            size={20}
                            color={isDark ? "#93C5FD" : "#FFFFFF"}
                          />
                        </View>

                        <View className="ml-3.5 flex-1">
                          <Text
                            className={`text-base font-black uppercase tracking-wider ${
                              isDark ? "text-blue-400" : "text-[#E51F27]"
                            }`}
                          >
                            {item.subtitle}
                          </Text>

                          <Text
                            className={`text-base font-black mt-0.5 ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {item.title}
                          </Text>

                          <Text className="text-base font-semibold text-slate-400 mt-0.5">
                            {item.expiry}
                          </Text>
                        </View>
                      </View>

                      <Text
                        className={`text-base mt-3 leading-5 ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {item.description}
                      </Text>

                      <View
                        className={`h-[0.5px] my-3 ${
                          isDark ? "bg-slate-800" : "bg-slate-200/50"
                        }`}
                      />

                      <View className="flex-row justify-end items-center">
                        {isApplied && (
                          <Text className="text-green-600 text-base font-semibold mr-3">
                            Đang sử dụng
                          </Text>
                        )}

                        <TouchableOpacity
                          onPress={() => {
                            setVoucherCode(item.code);
                            handleApplyVoucher(item);
                          }}
                          activeOpacity={0.7}
                          className={`rounded-lg px-3.5 py-1.5 ${
                            isApplied
                              ? "bg-green-600 active:bg-green-700"
                              : isDark
                                ? "bg-slate-700 active:bg-slate-650 border border-slate-600"
                                : "bg-[#E51F27] active:bg-[#C41A21]"
                          }`}
                        >
                          <Text className="text-white font-bold text-base">
                            {isApplied ? "Đã áp dụng" : "Áp dụng"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              ) : (
                <Text
                  className={`text-base text-center py-4 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Không tìm thấy voucher nào khả dụng
                </Text>
              )}
            </View>
          )}

          {/* 4. NOTICE/REMARKS FIELD */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <Text
              className={`text-base font-black uppercase tracking-wider mb-2.5 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              Ghi chú thêm
            </Text>
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Nhập ghi chú hoặc yêu cầu đặc biệt của bạn tại đây..."
              placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
              value={notice}
              onChangeText={setNotice}
              className={`rounded-xl p-3 border text-base font-medium min-h-[80px] text-left vertical-align-top ${
                isDark
                  ? "bg-slate-900/60 border-slate-700/50 text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
              style={{ textAlignVertical: "top" }}
            />
          </View>

          {/* 4b. PAYMENT METHOD PICKER */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <Text
              style={{ fontSize: FONT_SIZE.md }}
              className={`font-black mb-3 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              💳 Phương thức thanh toán
            </Text>

            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <View key={method.id} className="mb-3">
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPaymentMethod(method.id)}
                    className={`flex-row items-center rounded-2xl px-4 py-3.5 border-2 ${
                      isSelected
                        ? "border-[#E51F27]"
                        : isDark
                          ? "border-slate-700"
                          : "border-slate-200"
                    } ${isDark ? "bg-slate-900/40" : "bg-slate-50"}`}
                  >
                    <Ionicons
                      name={
                        isSelected
                          ? "radio-button-on"
                          : "radio-button-off"
                      }
                      size={22}
                      color={isSelected ? "#E51F27" : "#94A3B8"}
                    />
                    <Text style={{ fontSize: FONT_SIZE.lg }} className="ml-2">
                      {method.icon}
                    </Text>
                    <Text
                      style={{ fontSize: FONT_SIZE.xs }}
                      className={`ml-2 flex-1 font-bold ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      {method.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#16A34A"
                      />
                    )}
                  </TouchableOpacity>

                  {/* Expanded detail when selected */}
                  {isSelected && (
                    <View
                      className={`rounded-2xl px-4 py-3 mt-2 ${
                        isDark ? "bg-slate-900/60" : "bg-red-50/60"
                      }`}
                    >
                      <Text
                        style={{ fontSize: FONT_SIZE.xs, lineHeight: 22 }}
                        className={`${
                          isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                      >
                        {method.detail}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* 5. PRICE BREAKDOWN */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <Text
              className={`text-base font-black uppercase tracking-wider mb-3.5 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
            >
              Chi tiết giá tiền
            </Text>

            {/* Subtotal */}
            <View className="flex-row justify-between items-center mb-2.5">
              <Text
                className={`text-base font-semibold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Tạm tính ({quantity} khách)
              </Text>
              <Text
                className={`text-base font-bold ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {formatCurrency(originalPrice)}
              </Text>
            </View>

            {/* Discount */}
            {discountAmount > 0 && (
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="text-base font-semibold text-green-500">
                  Giảm giá voucher
                </Text>
                <Text className="text-base font-black text-green-500">
                  -{formatCurrency(discountAmount)}
                </Text>
              </View>
            )}

            {/* Divider */}
            <View
              className={`h-[1px] my-2.5 ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />

            {/* Total */}
            <View className="flex-row justify-between items-center">
              <Text
                className={`text-base font-black ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Tổng thanh toán
              </Text>
              <Text
                className={`text-base font-black ${
                  isDark ? "text-slate-200" : "text-[#E51F27]"
                }`}
              >
                {formatCurrency(finalPrice)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 6. BOOKING ACTION BOTTOM BAR */}
        <View
          className={`absolute bottom-0 left-0 right-0 p-5 border-t flex-row items-center justify-between ${
            isDark
              ? "bg-[#1E222B] border-slate-800"
              : "bg-white border-slate-100 shadow-lg shadow-black/10"
          }`}
        >
          <View>
            <Text className="text-base font-bold text-slate-400 uppercase">
              Tổng số tiền
            </Text>
            <Text
              className={`text-base font-black ${
                isDark ? "text-slate-200" : "text-[#E51F27]"
              }`}
            >
              {formatCurrency(finalPrice)}
            </Text>
          </View>

          <TouchableOpacity
            disabled={submitting}
            onPress={handleBookingSubmit}
            activeOpacity={0.85}
            className={`rounded-2xl px-6 py-3.5 flex-row items-center justify-center ${
              isDark
                ? "bg-slate-700 active:bg-slate-650 border border-slate-600"
                : "bg-[#E51F27] active:bg-[#C41A21]"
            }`}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white font-black text-base uppercase tracking-wide mr-1.5">
                  Đặt tour ngay
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
