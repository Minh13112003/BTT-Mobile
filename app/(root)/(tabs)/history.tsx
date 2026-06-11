import Header from "@/components/Header";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { formatDateTime } from "@/helper/datetime_helper";
import { getTransactionHistory } from "@/services/booking";
import { TourItem } from "@/services/tour";
import { formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function HistoryScreen() {
  const router = useRouter();
  useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("Tất cả");

  const filteredOrders = orders.filter((item) => {
    if (selectedStatus === "Tất cả") return true;
    const statusVn = MAP_STATUS_VN[item.status] || item.status;
    return statusVn === selectedStatus;
  });

  const LIMIT = 5;

  const { theme } = useTheme();
  const isDark = theme === "dark";

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
    fetchOrders();
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

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F1F5F9]"}`}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#E51F27"}
      />

      <Header title="BENTHANH TOURIST" showActions={true} />

      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        {/* Horizontal filter chips */}
        <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
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
                  className={`px-4 py-2 rounded-full border ${
                    isActive
                      ? "bg-[#E51F27] border-[#E51F27]"
                      : isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-200"
                  }`}
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

        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#E51F27"}
            />
            <Text
              className={`text-base font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Đang tải lịch sử giao dịch...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 16,
              paddingBottom: 100,
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDark ? "#94A3B8" : "#E51F27"}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 justify-center items-center">
                  <ActivityIndicator
                    size="small"
                    color={isDark ? "#94A3B8" : "#E51F27"}
                  />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View
                className={`rounded-[24px] p-8 items-center justify-center border border-dashed mt-4 ${
                  isDark
                    ? "bg-slate-800/40 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
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
            renderItem={({ item }) => (
              <View
                className={`p-4 rounded-[24px] mb-4 border ${
                  isDark
                    ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                    : "bg-white border-slate-100 shadow-sm"
                }`}
              >
                {/* Top info card: status badge */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-3">
                    <Text
                      style={{ fontSize: FONT_SIZE.md }}
                      className={`font-black leading-6 ${isDark ? "text-slate-100" : "text-slate-800"}`}
                      numberOfLines={2}
                    >
                      {item.tour.name}
                    </Text>
                    
                    {/* Mã tour */}
                    <Text
                      style={{ fontSize: FONT_SIZE.xs }}
                      className={`font-semibold mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Mã tour: {item.departure?.tourCode || (item.tour as any).code || "-"}
                    </Text>

                    {/* Ngày khởi hành */}
                    <Text
                      style={{ fontSize: FONT_SIZE.xs }}
                      className={`font-semibold mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      Ngày khởi hành: {formatDepartureDate(item.departure?.departureDate)}
                    </Text>
                  </View>
                  <View
                    className={`px-2.5 py-1.5 rounded-xl self-start ${
                      isDark
                        ? "bg-slate-700"
                        : (MAP_STATUS_VN[item.status] || item.status) === "Đã thanh toán" ||
                          (MAP_STATUS_VN[item.status] || item.status) === "Đã nhận hàng" ||
                          (MAP_STATUS_VN[item.status] || item.status) === "Đã xác nhận" ||
                          (MAP_STATUS_VN[item.status] || item.status) === "Đã hoàn thành"
                          ? "bg-green-50 border border-green-200"
                          : (MAP_STATUS_VN[item.status] || item.status) === "Đã hủy" ||
                            (MAP_STATUS_VN[item.status] || item.status) === "Đã hoàn tiền"
                            ? "bg-red-50 border border-red-200"
                            : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <Text
                      className={`text-xs font-black uppercase ${
                        isDark
                          ? "text-slate-200"
                          : (MAP_STATUS_VN[item.status] || item.status) === "Đã thanh toán" ||
                            (MAP_STATUS_VN[item.status] || item.status) === "Đã nhận hàng" ||
                            (MAP_STATUS_VN[item.status] || item.status) === "Đã xác nhận" ||
                            (MAP_STATUS_VN[item.status] || item.status) === "Đã hoàn thành"
                            ? "text-green-600"
                            : (MAP_STATUS_VN[item.status] || item.status) === "Đã hủy" ||
                              (MAP_STATUS_VN[item.status] || item.status) === "Đã hoàn tiền"
                              ? "text-red-600"
                              : "text-amber-600"
                      }`}
                    >
                      {MAP_STATUS_VN[item.status] || item.status}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View
                  className={`h-[1px] my-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                />

                {/* Body info card: image + price/quantity */}
                <View className="flex-row items-center py-2">
                  <Image
                    source={{ uri: item.tour.imageUrl }}
                    className="w-20 h-20 rounded-2xl bg-slate-900/10"
                    resizeMode="cover"
                  />
                  <View className="flex-1 ml-3.5">
                    {item.discountAmount && item.discountAmount > 0 ? (
                      <View>
                        <View className="flex-row items-center flex-wrap gap-x-2">
                          <Text
                            className={`text-base font-black ${isDark ? "text-slate-200" : "text-[#E51F27]"}`}
                          >
                            {formatCurrency(item.price)}
                          </Text>
                          <Text className="text-xs text-slate-400 line-through">
                            {formatCurrency(item.originalPrice || 0)}
                          </Text>
                        </View>
                        <Text className="text-xs text-green-500 font-bold mt-0.5">
                          Giảm {formatCurrency(item.discountAmount)}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        className={`text-base font-black ${isDark ? "text-slate-200" : "text-[#E51F27]"}`}
                      >
                        {formatCurrency(item.price)}
                      </Text>
                    )}

                    <Text
                      className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {item.quantity} khách · {item.tour.duration}
                    </Text>

                    {item.tour.hasVat && (
                      <View
                        className={`self-start mt-1.5 px-2 py-0.5 rounded-full border ${
                          isDark
                            ? "border-slate-600 bg-slate-700"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <Text
                          className={`text-xs font-black uppercase ${isDark ? "text-slate-300" : "text-red-500"}`}
                        >
                          Đã xuất VAT
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Voucher & Notice details if present */}
                {((item as any).voucher || (item as any).notice) && (
                  <View
                    className={`mt-2 p-3 rounded-2xl border ${
                      isDark
                        ? "bg-slate-900/40 border-slate-700/40"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    {(item as any).voucher && (
                      <View className="flex-row items-center mb-1">
                        <Ionicons
                          name="gift-outline"
                          size={12}
                          color={isDark ? "#93C5FD" : "#E51F27"}
                        />
                        <Text
                          className={`text-base font-bold ml-1.5 ${
                            isDark ? "text-slate-300" : "text-slate-600"
                          }`}
                        >
                          Voucher:{" "}
                          <Text className="font-extrabold text-blue-500 dark:text-blue-400">
                            {(item as any).voucher.code}
                          </Text>{" "}
                          ({(item as any).voucher.title})
                        </Text>
                      </View>
                    )}
                    {(item as any).notice && (
                      <View className="flex-row items-start mt-0.5">
                        <Ionicons
                          name="chatbox-ellipses-outline"
                          size={12}
                          color={isDark ? "#94A3B8" : "#64748B"}
                          style={{ marginTop: 1 }}
                        />
                        <Text
                          className={`text-base ml-1.5 flex-1 italic ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Ghi chú: {(item as any).notice}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Divider */}
                <View
                  className={`h-[1px] my-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                />

                {/* Footer info card: booking date & details button */}
                <View className="mt-1.5 gap-y-2">
                  <Text className="text-base text-slate-400 font-semibold">
                    Ngày đặt: {formatDateTime(item.createdAt)}
                  </Text>
                  <View className="flex-row justify-end">
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/detailTour" as any,
                          params: { id: item.id },
                        })
                      }
                      activeOpacity={0.7}
                      className={`flex-row items-center px-3.5 py-2 rounded-xl border ${
                        isDark
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={15}
                        color={isDark ? "#E5E7EB" : "#64748B"}
                      />
                      <Text
                        className={`text-base font-bold ml-1.5 ${
                          isDark ? "text-slate-200" : "text-slate-600"
                        }`}
                      >
                        Chi tiết đơn
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}
      </LinearGradient>
    </View>
  );
}
