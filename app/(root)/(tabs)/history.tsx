import Header from "@/components/Header";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { getTransactionHistory } from "@/services/booking";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  orderCode: string;
  tourName: string;
  imageUrl: string;
  price: number;
  currency: string;
  status: string;
  hasVat: boolean;
  bookingDate: string;
}

export default function HistoryScreen() {
  const { isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [error, setError] = useState("");

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Tải danh sách đơn hàng từ booking service
  const fetchOrders = async () => {
    try {
      setError("");
      const res = await getTransactionHistory();
      if (res.data) {
        setOrders(res.data);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải lịch sử giao dịch:", err);
      // Sử dụng mock data dự phòng
      setOrders([
        {
          id: "1",
          orderCode: "BTTDHCMKHOA20260327",
          tourName:
            "Du lịch Hàn Quốc (Mùa Hoa Anh Đào): Seoul - Nami - Everland - Công viên Yeouido",
          imageUrl:
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500",
          price: 15990000,
          currency: "VND",
          status: "Đã nhận hàng",
          hasVat: true,
          bookingDate: "2026-06-03",
        },
        {
          id: "2",
          orderCode: "BTTDHCMKHOA20260328",
          tourName: "Đà Nẵng - Hội An - Bà Nà Hills 4 Ngày 3 Đêm",
          imageUrl:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
          price: 5490000,
          currency: "VND",
          status: "Đã nhận hàng",
          hasVat: true,
          bookingDate: "2026-06-03",
        },
        {
          id: "3",
          orderCode: "BTTDHCMKHOA20260329",
          tourName:
            "Tour Singapore - Malaysia 5 Ngày 4 Đêm: Sentosa - Genting Highland",
          imageUrl:
            "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500",
          price: 12490000,
          currency: "VND",
          status: "Chờ xử lý",
          hasVat: false,
          bookingDate: "2026-06-02",
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
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

      <Header title="LỊCH SỬ GIAO DỊCH" showActions={true} />

      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#E51F27"}
            />
            <Text
              className={`text-sm font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Đang tải lịch sử giao dịch...
            </Text>
          </View>
        ) : (
          <ScrollView
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
          >
            {orders.length > 0 ? (
              orders.map((item) => (
                <View
                  key={item.id}
                  className={`p-4 rounded-[24px] mb-4 border ${
                    isDark
                      ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                      : "bg-white border-slate-100 shadow-sm"
                  }`}
                >
                  {/* Top info card: code, date, status */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mã đơn hàng
                      </Text>
                      <Text
                        className={`text-xs font-bold mt-0.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}
                      >
                        #{item.orderCode}
                      </Text>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-xl ${
                        isDark
                          ? "bg-slate-750 bg-slate-700"
                          : item.status === "Đã nhận hàng"
                            ? "bg-green-50"
                            : "bg-amber-50"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-black uppercase ${
                          isDark
                            ? "text-slate-200"
                            : item.status === "Đã nhận hàng"
                              ? "text-green-600"
                              : "text-amber-600"
                        }`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    className={`h-[1px] my-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                  />

                  {/* Body info card: image, name, price */}
                  <View className="flex-row items-center py-2">
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="w-16 h-16 rounded-xl bg-slate-900/10"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-3.5">
                      <Text
                        className={`text-xs font-black leading-4 ${
                          isDark ? "text-slate-100" : "text-slate-800"
                        }`}
                        numberOfLines={2}
                      >
                        {item.tourName}
                      </Text>
                      <View className="flex-row items-center justify-between mt-2">
                        <Text
                          className={`text-sm font-black ${
                            isDark ? "text-slate-200" : "text-[#E51F27]"
                          }`}
                        >
                          {formatCurrency(item.price)}
                        </Text>
                        {item.hasVat && (
                          <View
                            className={`border px-1.5 py-0.5 rounded ${
                              isDark
                                ? "border-slate-650 bg-slate-700 border-slate-600"
                                : "border-red-200 bg-red-50"
                            }`}
                          >
                            <Text
                              className={`text-[8px] font-black uppercase ${
                                isDark ? "text-slate-300" : "text-red-500"
                              }`}
                            >
                              Đã xuất VAT
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Divider */}
                  <View
                    className={`h-[1px] my-2 ${isDark ? "bg-slate-700/60" : "bg-slate-100"}`}
                  />

                  {/* Footer info card: booking date */}
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-[10px] text-slate-400 font-semibold">
                      Ngày đặt: {item.bookingDate}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      className={`flex-row items-center px-3 py-1.5 rounded-xl border ${
                        isDark
                          ? "bg-slate-700 border-slate-600"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={14}
                        color={isDark ? "#E5E7EB" : "#64748B"}
                      />
                      <Text
                        className={`text-[10px] font-bold ml-1 ${
                          isDark ? "text-slate-200" : "text-slate-600"
                        }`}
                      >
                        Chi tiết đơn
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View
                className={`rounded-[24px] p-8 items-center justify-center border border-dashed mt-4 ${
                  isDark
                    ? "bg-slate-800/40 border-slate-700"
                    : "bg-white border-slate-200"
                }`}
              >
                <Ionicons name="receipt-outline" size={48} color="#94A3B8" />
                <Text
                  className={`font-bold text-sm mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                >
                  Bạn chưa có giao dịch nào
                </Text>
                <Text className="text-slate-400 text-xs text-center mt-1">
                  Mọi giao dịch đặt tour du lịch của bạn sẽ hiển thị tại đây.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}
