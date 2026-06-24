import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FONT_SIZE } from "@/constants/typography";
import { getPalette } from "@/constants/theme";
import { useAuth } from "@/context/Auth_Context";
import { useScrollVisibility } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { getTransactionHistory } from "@/services/booking";
import { TourItem } from "@/services/tour";
import { formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  ActivityIndicator,
  FlatList,
  ImageBackground,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Định nghĩa kiểu dữ liệu đơn hàng
interface OrderItem {
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
  createdAt: string | Date;
  updatedAt: string | Date;
  status: string;
  departure?: {
    id?: string;
    tourCode?: string;
    departureDate?: string;
  };
}

export const MAP_STATUS_VN: Record<string, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  PAID: "Đã thanh toán",
  ONGOING: "Đang diễn ra",
  COMPLETED: "Đã hoàn thành",
  CANCELLED: "Đã hủy",
  REFUNDED: "Đã hoàn tiền",
};

const STATUS_OPTIONS = ["Tất cả", "Chờ xử lý", "Đã xác nhận", "Đã thanh toán", "Đang diễn ra", "Đã hoàn thành", "Đã hủy", "Đã hoàn tiền"];

const GREEN_STATUSES = ["Đã thanh toán", "Đã nhận hàng", "Đã xác nhận", "Đã hoàn thành"];
const RED_STATUSES = ["Đã hủy", "Đã hoàn tiền"];

/** Resolve the pill colors for a status, supporting light & dark themes. */
function statusTone(statusVn: string, isDark: boolean) {
  if (GREEN_STATUSES.includes(statusVn)) {
    return isDark
      ? { bg: "bg-slate-700", text: "text-emerald-300" }
      : { bg: "bg-green-50", text: "text-green-700" };
  }
  if (RED_STATUSES.includes(statusVn)) {
    return isDark
      ? { bg: "bg-slate-700", text: "text-red-300" }
      : { bg: "bg-red-50", text: "text-red-600" };
  }
  return isDark
    ? { bg: "bg-slate-700", text: "text-amber-300" }
    : { bg: "bg-[#FFF3DC]", text: "text-[#B5710A]" };
}

export default function HistoryScreen() {
  const router = useRouter();
  useAuth();
  const insets = useSafeAreaInsets();
  const { setHidden } = useScrollVisibility();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");
  const [chromeH, setChromeH] = useState(0);

  const flatListRef = useRef<FlatList<OrderItem>>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Collapsing header
  const headerOffset = useRef(new Animated.Value(0)).current;
  const lastY = useRef(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: new Animated.Value(0) } } }],
    {
      useNativeDriver: false,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        lastY.current = y;
        setShowBackToTop(y > 300);
        if (y <= 8) {
          setHidden(false);
          Animated.timing(headerOffset, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        } else if (dy > 8) {
          setHidden(true);
          Animated.timing(headerOffset, { toValue: -chromeH, duration: 150, useNativeDriver: true }).start();
        } else if (dy < -8) {
          setHidden(false);
          Animated.timing(headerOffset, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        }
      },
    },
  );

  useFocusEffect(
    useCallback(() => {
      headerOffset.setValue(0);
      lastY.current = 0;
      setHidden(false);
      return () => setHidden(false);
    }, [headerOffset, setHidden]),
  );

  const filteredOrders = orders.filter((item) => {
    if (selectedStatus === "Tất cả") return true;
    const statusVn = MAP_STATUS_VN[item.status] || item.status;
    return statusVn === selectedStatus;
  });

  const LIMIT = 5;

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  // Tải danh sách đơn hàng từ booking service
  const fetchOrders = async (pageNumber = 1, isLoadMore = false) => {
    try {
      const res = await getTransactionHistory(pageNumber, LIMIT);

      if (res?.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : [];

        const meta = res.data.meta;

        setOrders((prev) => (isLoadMore ? [...prev, ...items] : items));

        setHasNext(meta?.hasNext ?? false);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải lịch sử giao dịch:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrders(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchOrders(1);
  };

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return;

    const nextPage = page + 1;

    setLoadingMore(true);
    setPage(nextPage);

    await fetchOrders(nextPage, true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const pendingCount = orders.filter(
    (o) => (MAP_STATUS_VN[o.status] || o.status) === "Chờ xử lý",
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#D0021B"} />

      {/* Safe-area backdrop */}
      <View style={{ height: insets.top, backgroundColor: isDark ? "#1E222B" : "#D0021B", zIndex: 20 }} />

      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center" style={{ paddingTop: chromeH }}>
            <ActivityIndicator size="large" color={palette.spinner} />
            <Text className={`text-base font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Đang tải lịch sử giao dịch...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: chromeH + 10,
              paddingBottom: 24,
            }}
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.spinner}
                progressViewOffset={chromeH}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              <>
                {loadingMore ? (
                  <View className="py-4 justify-center items-center">
                    <ActivityIndicator size="small" color={palette.spinner} />
                  </View>
                ) : null}
                <Footer />
              </>
            }
            ListEmptyComponent={
              <View
                className={`rounded-[24px] p-8 items-center justify-center border border-dashed mt-4 ${
                  isDark
                    ? "bg-slate-800/40 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <Ionicons name="receipt-outline" size={48} color="#9CA3AF" />
                <Text
                  className={`font-bold text-base mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Bạn chưa có giao dịch nào
                </Text>
                <Text className="text-slate-400 text-base text-center mt-1">
                  Mọi giao dịch đặt tour du lịch của bạn sẽ hiển thị tại đây.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const statusVn = MAP_STATUS_VN[item.status] || item.status;
              const tone = statusTone(statusVn, isDark);
              const hasDiscount = !!item.discountAmount && item.discountAmount > 0;
              const pct =
                hasDiscount && item.originalPrice
                  ? Math.round((item.discountAmount! / item.originalPrice) * 100)
                  : null;

              return (
                <View
                  className={`rounded-[24px] mb-4 overflow-hidden border ${
                    isDark
                      ? "bg-slate-800/90 border-slate-700/50"
                      : "bg-white border-slate-100"
                  }`}
                  style={
                    isDark
                      ? undefined
                      : {
                          shadowColor: "#000",
                          shadowOpacity: 0.07,
                          shadowRadius: 16,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 2,
                        }
                  }
                >
                  {/* Faint tour image blended under the card background */}
                  <ImageBackground
                    source={{ uri: item.tour.imageUrl }}
                    resizeMode="cover"
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                    imageStyle={{ opacity: isDark ? 0.3 : 0.22 }}
                  />

                  <View className="p-4">
                    {/* Top: name + code | status pill */}
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-3">
                        <Text
                          style={{ fontSize: FONT_SIZE.md }}
                          className={`font-black leading-6 ${isDark ? "text-slate-100" : "text-[#1A1A2E]"}`}
                          numberOfLines={2}
                        >
                          {item.tour.name}
                        </Text>
                        <Text
                          style={{ fontSize: FONT_SIZE.xs }}
                          className={`font-medium mt-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                        >
                          # {item.departure?.tourCode || (item.tour as any).code || "—"}
                        </Text>
                      </View>
                      <View className={`px-2.5 py-1.5 rounded-full self-start ${tone.bg}`}>
                        <Text className={`text-xs font-extrabold uppercase ${tone.text}`}>
                          {statusVn}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View
                      className={`h-[1px] my-3 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                    />

                    {/* Departure row */}
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color={isDark ? "#94A3B8" : "#9CA3AF"}
                      />
                      <Text
                        style={{ fontSize: FONT_SIZE.xs }}
                        className={`ml-2 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                      >
                        Khởi hành: {formatDepartureDate(item.departure?.departureDate)} ·{" "}
                        {item.tour.duration}
                      </Text>
                    </View>

                    {/* Guests + voucher / booking date */}
                    <View className="flex-row items-center mb-2">
                      <Ionicons
                        name="person-outline"
                        size={15}
                        color={isDark ? "#94A3B8" : "#9CA3AF"}
                      />
                      <Text
                        style={{ fontSize: FONT_SIZE.xs }}
                        className={`ml-2 font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}
                        numberOfLines={1}
                      >
                        {item.quantity} khách ·{" "}
                        {item.voucher
                          ? `Voucher: ${item.voucher.code}`
                          : `Ngày đặt: ${formatDateTime(item.createdAt)}`}
                      </Text>
                    </View>

                    {/* Price row */}
                    <View className="flex-row items-center flex-wrap">
                      <Ionicons name="cash-outline" size={15} color="#D0021B" />
                      <Text className="ml-2 text-[#D0021B] font-black" style={{ fontSize: 16 }}>
                        {formatCurrency(item.price)}
                      </Text>
                      {hasDiscount && (
                        <>
                          <Text className="ml-2 text-slate-400 line-through text-xs">
                            {formatCurrency(item.originalPrice || 0)}
                          </Text>
                          {pct != null && (
                            <Text className="ml-2 text-green-600 font-bold text-xs">
                              −{pct}%
                            </Text>
                          )}
                        </>
                      )}
                      {item.tour.hasVat && (
                        <View className="ml-2 px-2 py-0.5 rounded-full bg-[#D0021B]/10">
                          <Text className="text-[#D0021B] font-extrabold text-xs uppercase">
                            Đã xuất VAT
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Notice if present */}
                    {!!item.notice && (
                      <Text
                        style={{ fontSize: FONT_SIZE.xs }}
                        className={`italic mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                      >
                        Ghi chú: {item.notice}
                      </Text>
                    )}

                    {/* Actions */}
                    <View className="flex-row justify-end mt-3">
                      <TouchableOpacity
                        onPress={() =>
                          router.push({
                            pathname: "/detailTour" as any,
                            params: { id: item.id },
                          })
                        }
                        activeOpacity={0.8}
                        className={`flex-row items-center px-4 py-2 rounded-xl ${
                          isDark ? "bg-slate-700" : "bg-[#D0021B]/10"
                        }`}
                      >
                        <Text
                          className={`font-extrabold mr-1.5 ${isDark ? "text-slate-200" : "text-[#D0021B]"}`}
                          style={{ fontSize: 16 }}
                        >
                          Chi tiết đơn
                        </Text>
                        <Ionicons
                          name="arrow-forward"
                          size={14}
                          color={isDark ? "#E5E7EB" : "#D0021B"}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </LinearGradient>

      {/* Floating collapsing chrome: Header + filter chips */}
      <Animated.View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && Math.abs(h - chromeH) > 1) setChromeH(h);
        }}
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateY: headerOffset }],
          backgroundColor: palette.gradient[0],
        }}
      >
        <Header title="BENTHANH TOURIST" showActions={true} safeArea={false} />

        <View className="px-5 pt-3 pb-1">
          <Text
            className={`font-black tracking-tight ${isDark ? "text-slate-100" : "text-[#1A1A2E]"}`}
            style={{ fontSize: 22 }}
          >
            Lịch sử đặt tour
          </Text>
          <Text
            className={`font-medium mt-0.5 ${isDark ? "text-slate-400" : "text-slate-400"}`}
            style={{ fontSize: 16 }}
          >
            {pendingCount > 0
              ? `${pendingCount} đơn hàng đang xử lý`
              : `${orders.length} đơn hàng`}
          </Text>
        </View>

        {/* Horizontal filter chips */}
        <View style={{ paddingTop: 8, paddingBottom: 8 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
          >
            {STATUS_OPTIONS.map((status) => {
              const isActive = selectedStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setSelectedStatus(status)}
                  className={`px-[18px] py-2 rounded-full ${
                    isActive
                      ? "bg-[#D0021B]"
                      : isDark
                        ? "bg-[#1E222B] border border-slate-700"
                        : "bg-white"
                  }`}
                  style={
                    isActive || isDark
                      ? undefined
                      : {
                          shadowColor: "#000",
                          shadowOpacity: 0.07,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 1 },
                          elevation: 1,
                        }
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={{ fontSize: 16 }}
                    className={`font-bold ${
                      isActive
                        ? "text-white"
                        : isDark
                          ? "text-slate-300"
                          : "text-slate-600"
                    }`}
                  >
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Animated.View>

      {/* Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
    </View>
  );
}
