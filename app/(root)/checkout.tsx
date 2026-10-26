import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { booking, getLaravelSeats, PaymentMethod } from "@/services/booking";
import { consumePendingVoucherSelection } from "@/services/voucherSelection";
import { getPinStatus, verifyPin } from "@/services/pin";
import PINInput from "@/components/PINInput";
// [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] bỏ comment 3 dòng dưới + các khối cùng ghi chú để bật lại
// import GuestSection from "@/components/guest/GuestSection";
// import { useCheckoutGuests } from "@/hooks/useCheckoutGuests";
// import { formToPayload, validateGuestForm } from "@/utils/guest";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "@/components/CustomAlert";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

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
  const paramSeats = params.availableSeats
    ? parseInt(params.availableSeats as string, 10)
    : Infinity;

  // DEMO — nguồn Laravel: khi có tourKey, gửi lên NestJS để backend gọi
  // benthanhtourist.com lấy snapshot & bỏ qua idTour/departureId.
  const isLaravelSource = params.source === "LARAVEL" && !!params.tourKey;
  const tourKey = (params.tourKey as string) || "";
  const departureKey = (params.departureKey as string) || "";

  // Số chỗ truyền từ trang tour là `stock_qty` của Laravel — chưa trừ khách đã đặt qua app. Hỏi lại
  // NestJS số chỗ thật (null = chưa có / lỗi mạng → tạm dùng số từ trang tour, backend vẫn chặn khi đặt).
  const [liveSeats, setLiveSeats] = useState<number | null>(null);
  const refreshSeats = useCallback(() => {
    if (!isLaravelSource || !departureKey) return;
    getLaravelSeats(tourKey, departureKey)
      .then((r) => setLiveSeats(r.availableSeats ?? Infinity))
      .catch(() => {});
  }, [isLaravelSource, tourKey, departureKey]);
  useEffect(() => {
    refreshSeats();
  }, [refreshSeats]);
  const availableSeats = liveSeats ?? paramSeats;

  const maxTotal = availableSeats === Infinity ? 99 : availableSeats;
  // Tour nước ngoài: mỗi khách bắt buộc hộ chiếu + visa (màn tour truyền sang theo đường dẫn ảnh /tour/nuoc-ngoai/).
  const isForeign = params.isForeign === "true";

  // Chatbot (bttAI) có thể dẫn khách tới đây với số người + thân nhân đã chọn sẵn; khách vẫn sửa được.
  const prefill = (v: unknown, min: number) => {
    const n = parseInt(String(v ?? ""), 10);
    return Number.isFinite(n) ? Math.min(Math.max(n, min), maxTotal) : min;
  };
  const [adults, setAdults] = useState(() => prefill(params.adults, 1));
  const [children, setChildren] = useState(() => prefill(params.children, 0));
  const [infants, setInfants] = useState(() => prefill(params.infants, 0));

  // Số chỗ thật về sau ít hơn số khách đang chọn → bớt em bé, rồi trẻ em, rồi người lớn (giữ tối thiểu 1).
  useEffect(() => {
    let over = adults + children + infants - maxTotal;
    if (over <= 0) return;
    const cutInfants = Math.min(infants, over);
    over -= cutInfants;
    const cutChildren = Math.min(children, over);
    over -= cutChildren;
    const cutAdults = Math.min(adults - 1, over);
    if (cutInfants) setInfants(infants - cutInfants);
    if (cutChildren) setChildren(children - cutChildren);
    if (cutAdults > 0) setAdults(adults - cutAdults);
  }, [maxTotal, adults, children, infants]);
  // [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] 
  // const prefillRelativeIds = ((params.relativeIds as string) || "").split(",").filter(Boolean);
  // const guestState = useCheckoutGuests(adults + children + infants, prefillRelativeIds);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [selectedVoucher, setSelectedVoucher] =
    useState<ExtendedVoucher | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error" | "warning" | "confirm">("warning");
  const [onAlertConfirm, setOnAlertConfirm] = useState<(() => void) | undefined>(undefined);

  const triggerAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "warning" | "confirm" = "warning",
    onConfirm?: () => void
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setOnAlertConfirm(() => onConfirm);
    setAlertVisible(true);
  };

  // Nhận voucher chọn từ voucher-picker khi quay lại màn checkout (xem services/voucherSelection.ts).
  useFocusEffect(
    useCallback(() => {
      const picked = consumePendingVoucherSelection<ExtendedVoucher>();
      if (picked !== undefined) {
        setSelectedVoucher(picked);
      }
    }, []),
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  // Pricing calculations per docs: adults 100%, children 80%, infants 40%
  const adultTotal = adults * tourPrice;
  const childTotal = children * tourPrice * 0.8;
  const infantTotal = infants * tourPrice * 0.4;
  const originalPrice = adultTotal + childTotal + infantTotal;

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

  const handleBookingSubmit = async () => {
    const hasDeparture = isLaravelSource ? !!departureKey : !!departureId;
    if (!hasDeparture) {
      triggerAlert("Thông báo", "Vui lòng chọn ngày khởi hành", "warning");
      return;
    }
    if (!paymentMethod) {
      triggerAlert("Thông báo", "Vui lòng chọn phương thức thanh toán", "warning");
      return;
    }
    if (adults < 1) {
      triggerAlert("Thông báo", "Phải có ít nhất 1 người lớn", "warning");
      return;
    }
    const totalPassengers = adults + children + infants;
    if (totalPassengers > maxTotal) {
      triggerAlert(
        "Thông báo",
        availableSeats === Infinity
          ? "Số lượng khách tối đa là 99 người"
          : availableSeats <= 0
            ? "Đợt khởi hành này đã hết chỗ. Vui lòng chọn ngày khác."
            : `Chỉ còn ${availableSeats} chỗ cho chuyến đi này`,
        "warning"
      );
      return;
    }

    // [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] 
    // Thông tin từng hành khách (bắt buộc đủ theo quy tắc; backend kiểm tra lại)
    // const refDate = departureDate ? new Date(departureDate) : undefined;
    // for (let i = 0; i < guestState.guests.length; i++) {
    //   const err = validateGuestForm(guestState.guests[i], {
    //     label: `Khách ${i + 1}`,
    //     requirePhone: i === 0,
    //     requireVisa: isForeign,
    //     refDate: refDate && !isNaN(refDate.getTime()) ? refDate : undefined,
    //   });
    //   if (err) {
    //     triggerAlert("Thiếu thông tin hành khách", err.charAt(0).toUpperCase() + err.slice(1), "warning");
    //     return;
    //   }
    // }

    try {
      const res = await getPinStatus();
      const hasPin = res.data?.hasPin ?? false;
      if (hasPin) {
        setPinError("");
        setShowPinModal(true);
      } else {
        triggerAlert(
          "Xác nhận đặt tour",
          "Bạn có chắc chắn muốn đặt chuyến đi này không?",
          "confirm",
          performBooking
        );
      }
    } catch {
      triggerAlert(
        "Xác nhận đặt tour",
        "Bạn có chắc chắn muốn đặt chuyến đi này không?",
        "confirm",
        performBooking
      );
    }
  };

  const handlePinSubmit = async (pin: string) => {
    try {
      setPinLoading(true);
      setPinError("");
      await verifyPin(pin);
      setShowPinModal(false);
      performBooking();
    } catch {
      setPinError("Mã PIN không chính xác. Vui lòng thử lại.");
    } finally {
      setPinLoading(false);
    }
  };

  const performBooking = async () => {
    try {
      setSubmitting(true);
      // [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] 
      // const guestPayloads = guestState.guests.map(formToPayload);
      // const saveToRelatives = guestState.saveFlags.flatMap((v, i) => (v && i > 0 && !guestState.picked[i] ? [i] : []));
      const bookingData = isLaravelSource
        ? {
            // DEMO — booking nguồn Laravel: backend NestJS gọi /api/tour/item lấy snapshot.
            tourKey,
            departureKey,
            departureDate: departureDate || undefined,
            unitPrice: tourPrice,
            adults,
            children,
            infants,
            paymentMethod: paymentMethod as PaymentMethod,
            voucherCode: selectedVoucher ? selectedVoucher.code : null,
            notice: notice || null,
            // guests: guestPayloads,
            // saveToRelatives,
          }
        : {
            idTour: tourId,
            departureId,
            adults,
            children,
            infants,
            paymentMethod: paymentMethod as PaymentMethod,
            voucherCode: selectedVoucher ? selectedVoucher.code : null,
            notice: notice || null,
            // guests: guestPayloads,
            // saveToRelatives,
          };

      const res = await booking(bookingData);
      if (res) {
        const tourCodeStr = res.data?.departure?.tourCode || res.data?.booking?.departure?.tourCode || tourCode;
        // replace (không push) để Back không quay lại màn đặt tour đã hoàn tất
        router.replace({
          pathname: "/(root)/booking-success",
          params: {
            tourName,
            tourCode: tourCodeStr,
            departureDate,
            adults: String(adults),
            children: String(children),
            infants: String(infants),
            total: String(finalPrice),
            paymentMethod: paymentMethod ?? "",
          },
        } as any);
      }
    } catch (error: any) {
      console.error("Lỗi đặt tour:", error);
      // Có thể vừa có người khác đặt mất chỗ — cập nhật lại số chỗ để nút "+" giới hạn đúng.
      refreshSeats();
      triggerAlert(
        "Thất bại",
        error.response?.data?.message ||
          "Đặt tour không thành công. Vui lòng thử lại sau.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

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
            className={`font-black ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
            style={{ fontSize: FONT_SIZE.xl }}
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
            paddingBottom: 160,
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
                  className={`font-black ml-1 ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {tourRating}
                </Text>
                <Text className="text-slate-400 ml-0.5" style={{ fontSize: FONT_SIZE.xs }}>
                  ({tourReviewsCount})
                </Text>
              </View>

              <View className="absolute bottom-4 left-4 bg-[#D0021B] px-3 py-1 rounded-2xl shadow-md">
                <Text className="text-white font-black uppercase tracking-wider" style={{ fontSize: FONT_SIZE.xs }}>
                  {tourDuration}
                </Text>
              </View>
            </View>

            <View className="p-5">
              <Text
                style={{ fontSize: FONT_SIZE.xl }}
                className={`font-black leading-8 ${
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

              <View className="mt-3 pt-3 border-t border-slate-100/50">
                {tourHasVat && (
                  <View
                    className={`self-start border px-2 py-0.5 rounded-lg mb-2 ${
                      isDark
                        ? "border-slate-700 bg-slate-750"
                        : "border-red-100 bg-red-50/50"
                    }`}
                  >
                    <Text className="font-black uppercase text-red-500" style={{ fontSize: FONT_SIZE.xs }}>
                      Đã gồm VAT
                    </Text>
                  </View>
                )}

                <View>
                  <Text className="font-bold text-slate-400 uppercase tracking-wide" style={{ fontSize: FONT_SIZE.xs }}>
                    Đơn giá trọn gói
                  </Text>
                  <Text
                    className={`font-black mt-0.5 ${
                      isDark ? "text-slate-200" : "text-[#D0021B]"
                    }`}
                    style={{ fontSize: FONT_SIZE.sm }}
                  >
                    {formatCurrency(tourPrice)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* 2. PASSENGER SELECTOR */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <Text
              className={`font-black uppercase tracking-wider mb-4 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontSize: FONT_SIZE.lg }}
            >
              Số lượng khách
            </Text>

            {(
              [
                {
                  label: "Người lớn",
                  sublabel: "Từ 16 tuổi · 100%",
                  value: adults,
                  onDec: () => setAdults(Math.max(1, adults - 1)),
                  onInc: () =>
                    setAdults(
                      Math.max(adults, Math.min(maxTotal - children - infants, adults + 1)),
                    ),
                  unitPrice: tourPrice,
                },
                {
                  label: "Trẻ em",
                  sublabel: "Từ 06 – 10 tuổi · 80%",
                  value: children,
                  onDec: () => setChildren(Math.max(0, children - 1)),
                  onInc: () =>
                    setChildren(
                      Math.max(children, Math.min(maxTotal - adults - infants, children + 1)),
                    ),
                  unitPrice: tourPrice * 0.8,
                },
                {
                  label: "Em bé",
                  sublabel: "Dưới 05 tuổi · 40%",
                  value: infants,
                  onDec: () => setInfants(Math.max(0, infants - 1)),
                  onInc: () =>
                    setInfants(
                      Math.max(infants, Math.min(maxTotal - adults - children, infants + 1)),
                    ),
                  unitPrice: tourPrice * 0.4,
                },
              ] as const
            ).map((row) => (
              <View
                key={row.label}
                className="py-3.5 border-b border-slate-100/40"
              >
                {/* Row 1: Passenger Type Title and Counter Selector */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 mr-3">
                    <Text
                      className={`font-bold ${
                        isDark ? "text-slate-200" : "text-slate-800"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {row.label}
                    </Text>
                    <Text className="text-slate-400 mt-0.5" style={{ fontSize: FONT_SIZE.card }}>
                      {row.sublabel}
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={row.onDec}
                      className={`w-9 h-9 rounded-xl items-center justify-center border ${
                        isDark
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-100 border-slate-200"
                      }`}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={isDark ? "#E5E7EB" : "#1F2937"}
                      />
                    </TouchableOpacity>

                    <Text
                      className={`font-black w-10 text-center ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      {row.value}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={row.onInc}
                      // Đủ số chỗ còn lại thì khoá "+" của cả 3 loại khách
                      disabled={adults + children + infants >= maxTotal}
                      className={`w-9 h-9 rounded-xl items-center justify-center border ${
                        isDark
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-100 border-slate-200"
                      }`}
                      style={{ opacity: adults + children + infants >= maxTotal ? 0.35 : 1 }}
                    >
                      <Ionicons
                        name="add"
                        size={18}
                        color={isDark ? "#E5E7EB" : "#1F2937"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Row 2: Price details */}
                <View className="mt-2.5">
                  <Text className="text-slate-400 font-medium" style={{ fontSize: 16 }}>
                    Đơn giá:{" "}
                    <Text className={`font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`} style={{ fontSize: 16 }}>
                      {formatCurrency(row.unitPrice)}
                    </Text>
                  </Text>
                  <Text
                    className={`font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    style={{ fontSize: 16 }}
                  >
                    Thành tiền:{" "}
                    <Text
                      className={`font-black ${isDark ? "text-slate-200" : "text-[#D0021B]"}`}
                      style={{ fontSize: 16 }}
                    >
                      {row.value > 0 ? formatCurrency(row.value * row.unitPrice) : "0 đ"}
                    </Text>
                  </Text>
                </View>
              </View>
            ))}

            {/* Cảnh báo số chỗ */}
            {availableSeats !== Infinity && adults + children + infants >= maxTotal && (
              <View className="mt-3 flex-row items-center" style={{ gap: 6 }}>
                <Ionicons name="warning-outline" size={16} color="#F97316" />
                <Text style={{ fontSize: FONT_SIZE.xs, color: "#F97316", fontWeight: "700" }}>
                  Đã đặt tối đa {maxTotal} chỗ còn lại
                </Text>
              </View>
            )}
            {availableSeats !== Infinity && availableSeats <= 5 && adults + children + infants < maxTotal && (
              <View className="mt-3 flex-row items-center" style={{ gap: 6 }}>
                <Ionicons name="alert-circle-outline" size={16} color="#EAB308" />
                <Text style={{ fontSize: FONT_SIZE.xs, color: "#EAB308", fontWeight: "600" }}>
                  Chỉ còn {availableSeats} chỗ — đặt ngay!
                </Text>
              </View>
            )}

            {/* Total passengers + total cost summary */}
            <View className="flex-row justify-between items-center mt-4 pt-3 border-t border-slate-200/60">
              <Text
                className={`font-black uppercase tracking-wide ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Tổng chi phí
              </Text>
              <Text
                className={`font-black ${
                  isDark ? "text-slate-100" : "text-[#D0021B]"
                }`}
                style={{ fontSize: FONT_SIZE.sm }}
              >
                {formatCurrency(originalPrice)}
              </Text>
            </View>
          </View>

          {/* // [TẠM TẮT — chủ dự án chưa cần nhân thân/CCCD/hộ chiếu] */}
          {/* <GuestSection state={guestState} adults={adults} children={children} isForeign={isForeign} /> */}

          {/* Voucher — gọn kiểu Grab, bấm mở trang chọn voucher riêng */}
          <View className="mt-5 border-t border-slate-100/50 pt-4">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/(root)/voucher-picker" as any,
                  params: selectedVoucher ? { selectedId: selectedVoucher.id } : {},
                })
              }
              className={`flex-row items-center rounded-2xl p-4 border ${
                isDark
                  ? "bg-slate-900/40 border-slate-750"
                  : "bg-slate-50 border-slate-200/60"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center ${
                  isDark
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-[#D0021B] shadow-sm shadow-red-500/10"
                }`}
              >
                <Ionicons name="gift" size={20} color={isDark ? "#93C5FD" : "#FFFFFF"} />
              </View>

              <View className="ml-3.5 flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Voucher
                </Text>
                {selectedVoucher ? (
                  <Text
                    className={`font-black mt-0.5 ${isDark ? "text-blue-400" : "text-[#D0021B]"}`}
                    style={{ fontSize: FONT_SIZE.xs }}
                    numberOfLines={1}
                  >
                    {selectedVoucher.title}
                  </Text>
                ) : (
                  <Text
                    className={isDark ? "text-slate-500 mt-0.5" : "text-slate-400 mt-0.5"}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    Chọn voucher ưu đãi
                  </Text>
                )}
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#64748B" : "#94A3B8"}
              />
            </TouchableOpacity>
          </View>

          {/* 4. NOTICE/REMARKS FIELD */}
          <View
            className={`rounded-[32px] p-5 mt-6 border shadow-sm ${
              isDark
                ? "bg-slate-800/90 border-slate-700/60"
                : "bg-white border-slate-100"
            }`}
          >
            <Text
              className={`font-black uppercase tracking-wider mb-2.5 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
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
              className={`rounded-xl p-3 border font-medium min-h-[80px] text-left vertical-align-top ${
                isDark
                  ? "bg-slate-900/60 border-slate-700/50 text-slate-100"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
              style={{ textAlignVertical: "top", fontSize: FONT_SIZE.xs }}
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
                        ? "border-[#D0021B]"
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
                      color={isSelected ? "#D0021B" : "#94A3B8"}
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
              className={`font-black uppercase tracking-wider mb-3.5 ${
                isDark ? "text-slate-200" : "text-slate-800"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Chi tiết giá tiền
            </Text>

            {/* Subtotal */}
            <View className="flex-row justify-between items-center mb-2.5">
              <Text
                className={`font-semibold ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Tạm tính ({adults + children + infants} khách)
              </Text>
              <Text
                className={`font-bold ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                {formatCurrency(originalPrice)}
              </Text>
            </View>

            {/* Discount */}
            {discountAmount > 0 && (
              <View className="flex-row justify-between items-center mb-2.5">
                <Text className="font-semibold text-green-500" style={{ fontSize: FONT_SIZE.xs }}>
                  Giảm giá voucher
                </Text>
                <Text className="font-black text-green-500" style={{ fontSize: FONT_SIZE.xs }}>
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
                className={`font-black ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Tổng thanh toán
              </Text>
              <Text
                className={`font-black ${
                  isDark ? "text-slate-200" : "text-[#D0021B]"
                }`}
                style={{ fontSize: FONT_SIZE.sm }}
              >
                {formatCurrency(finalPrice)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* 6. BOOKING ACTION BOTTOM BAR */}
        <View
          className={`absolute bottom-0 left-0 right-0 px-5 pt-4 border-t flex-row items-center justify-between ${
            isDark
              ? "bg-[#1E222B] border-slate-800"
              : "bg-white border-slate-100 shadow-lg shadow-black/10"
          }`}
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}
        >
          <View className="flex-1 mr-3" style={{ minWidth: 0 }}>
            <Text className="font-bold text-slate-400 uppercase" style={{ fontSize: FONT_SIZE.card }}>
              Tổng số tiền
            </Text>
            <Text
              className={`font-black ${
                isDark ? "text-slate-200" : "text-[#D0021B]"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {formatCurrency(finalPrice)}
            </Text>
          </View>

          <PrimaryButton
            label="Đặt tour ngay"
            onPress={handleBookingSubmit}
            loading={submitting}
            trailingIcon={<Ionicons name="arrow-forward" size={16} color="#FFFFFF" />}
          />
        </View>
      </SafeAreaView>

      <ZaloFloatingButton baseBottom={130} />

      <CustomAlert
        visible={alertVisible}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        onConfirm={onAlertConfirm}
      />
      <PINInput
        visible={showPinModal}
        title="Xác nhận đặt tour"
        subtitle="Nhập mã PIN 6 chữ số để xác nhận đặt tour"
        loading={pinLoading}
        error={pinError}
        onSubmit={handlePinSubmit}
        onClose={() => setShowPinModal(false)}
      />
    </LinearGradient>
  );
}
