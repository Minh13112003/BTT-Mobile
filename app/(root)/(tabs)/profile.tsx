import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { logout as apiLogout } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  // Lấy trạng thái đăng nhập và thông tin user (bao gồm cả role) từ Context
  const { isLoggedIn, user, logout, refreshPoints } = useAuth();
  const router = useRouter();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.log("Logout error, forcing client redirect:", error);
    } finally {
      await logout();
      router.replace("/login");
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
    }
  }, [isLoggedIn]);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        refreshPoints();
      }
    }, [isLoggedIn, refreshPoints]),
  );

  if (!isLoggedIn) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#F5F6FA", "#F5F6FA"] as const);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F5F6FA]"}`}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#D0021B"}
      />
      <Header title="BENTHANH TOURIST" showActions={true} />
      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Header & Avatar */}
          <View className="items-center my-8 px-6">
            <View
              className={`items-center justify-center mb-4 shadow-xl border-[6px] ${
                isDark
                  ? "bg-slate-700 border-slate-650 shadow-black/50"
                  : "bg-[#D0021B] border-white shadow-[#D0021B]/30"
              }`}
              style={{ width: 200, height: 200, borderRadius: 100, overflow: "hidden" }}
            >
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Ionicons
                  name="person"
                  size={100}
                  color={isDark ? "#E5E7EB" : "#FFFFFF"}
                />
              )}
            </View>
            <Text
              className={`text-2xl font-black tracking-tight text-center ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Người dùng"}
            </Text>
            {/* Hiển thị Email kèm theo Chức vụ (Role) nhỏ bên cạnh để dễ nhận biết */}
            <Text
              className={`font-medium mt-1 text-center ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              {user?.email}
            </Text>
          </View>

          {/* Menu Chức năng */}
          <View
            className={`rounded-[24px] mx-6 p-4 border ${
              isDark
                ? "bg-slate-800/90 border-slate-700/50 shadow-2xl shadow-black/40"
                : "bg-white border-slate-100 shadow-xl shadow-slate-900/5"
            }`}
          >
            {/* Chức năng 1: Thông tin cá nhân */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(profile)/selfprofile")}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 border-b ${
                isDark ? "border-slate-700/60" : "border-slate-100"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  isDark ? "bg-slate-700 border border-slate-600" : "bg-blue-50"
                }`}
              >
                <Ionicons
                  name="id-card-outline"
                  size={22}
                  color={isDark ? "#93C5FD" : "#3B82F6"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Thông tin cá nhân
                </Text>
                <Text
                  className="text-slate-400 mt-0.5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Xem chi tiết hồ sơ tài khoản
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#6B7280" : "#94A3B8"}
              />
            </TouchableOpacity>

            {/* Chức năng mới: Kho voucher */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(profile)/vouchers")}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 border-b ${
                isDark ? "border-slate-700/60" : "border-slate-100"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  isDark ? "bg-slate-700 border border-slate-600" : "bg-red-50"
                }`}
              >
                <Ionicons
                  name="ticket-outline"
                  size={22}
                  color={isDark ? "#FCA5A5" : "#EF4444"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Kho voucher của bạn
                </Text>
                <Text
                  className="text-slate-400 mt-0.5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Quản lý mã giảm giá, khuyến mãi
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#6B7280" : "#94A3B8"}
              />
            </TouchableOpacity>

            {/* Chức năng mới: Giới thiệu bạn bè */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(profile)/referral")}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 border-b ${
                isDark ? "border-slate-700/60" : "border-slate-100"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  isDark
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-purple-50"
                }`}
              >
                <Ionicons
                  name="people-outline"
                  size={22}
                  color={isDark ? "#D8B4FE" : "#A855F7"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Giới thiệu bạn bè
                </Text>
                <Text
                  className="text-slate-400 mt-0.5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Chia sẻ nhận điểm thưởng, quà tặng
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#6B7280" : "#94A3B8"}
              />
            </TouchableOpacity>

            {/* Chức năng mới: Góp ý */}
            <TouchableOpacity
              onPress={() => router.push("/(root)/(profile)/feedback")}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 ${
                user?.role === "ADMIN"
                  ? isDark
                    ? "border-b border-slate-700/60"
                    : "border-b border-slate-100"
                  : ""
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  isDark
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-amber-50"
                }`}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={22}
                  color={isDark ? "#FDE047" : "#F59E0B"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Gửi góp ý phản hồi
                </Text>
                <Text
                  className="text-slate-400 mt-0.5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Đóng góp ý kiến nâng cao dịch vụ
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#6B7280" : "#94A3B8"}
              />
            </TouchableOpacity>

            {/* Chức năng 2: CHỈ hiển thị nếu user là ADMIN */}
            {user?.role === "ADMIN" && (
              <TouchableOpacity
                onPress={() =>
                  router.push("/(root)/(profile)/registercustomer")
                }
                activeOpacity={0.7}
                className="flex-row items-center p-4"
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                    isDark
                      ? "bg-slate-700 border border-slate-600"
                      : "bg-emerald-50"
                  }`}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={22}
                    color={isDark ? "#6EE7B7" : "#10B981"}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    Đăng ký khách hàng
                  </Text>
                  <Text
                    className="text-slate-400 mt-0.5"
                    style={{ fontSize: FONT_SIZE.xs }}
                  >
                    Thêm mới thông tin khách hàng tiềm năng
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDark ? "#6B7280" : "#94A3B8"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Nút Đăng xuất */}
          <View className="px-6 mt-4">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.8}
              className={`flex-row items-center justify-center rounded-2xl h-14 shadow-lg ${
                isDark
                  ? "bg-red-700 active:bg-red-800 shadow-black/30 border border-red-600"
                  : "bg-red-500 active:bg-red-600 shadow-red-500/20"
              }`}
            >
              <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              <Text
                className="text-white font-bold tracking-wide ml-2"
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Đăng xuất tài khoản
              </Text>
            </TouchableOpacity>
          </View>
          <Footer />
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
