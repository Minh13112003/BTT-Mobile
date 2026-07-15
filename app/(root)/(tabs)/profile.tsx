import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { logout as apiLogout } from "@/services/auth";
import { getPinStatus } from "@/services/pin";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileScreen() {
  const { isLoggedIn, user, logout, refreshPoints } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const [hasPin, setHasPin] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      getPinStatus()
        .then((res) => setHasPin(res.data?.hasPin ?? false))
        .catch(() => {});
    }
  }, [isLoggedIn]);

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
            <TouchableOpacity
              activeOpacity={user?.avatarUrl ? 0.85 : 1}
              onPress={() => user?.avatarUrl && setAvatarZoom(true)}
              style={{ marginBottom: 16 }}
            >
              <View
                className={`items-center justify-center shadow-xl border-[6px] ${
                  isDark
                    ? "bg-slate-700 border-slate-650 shadow-black/50"
                    : "bg-[#D0021B] border-white shadow-[#D0021B]/30"
                }`}
                style={{ width: 200, height: 200, borderRadius: 100 }}
              >
                {/* View con riêng để clip ảnh tròn, không clip touch của TouchableOpacity cha */}
                <View style={{ width: "100%", height: "100%", borderRadius: 100, overflow: "hidden" }}>
                  {user?.avatarUrl ? (
                    <Image
                      source={{ uri: user.avatarUrl }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={100} color={isDark ? "#E5E7EB" : "#FFFFFF"} />
                  )}
                </View>
              </View>
              {user?.avatarUrl && (
                <View
                  style={{
                    position: "absolute",
                    bottom: 4,
                    right: 4,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "#D0021B",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: "white",
                  }}
                >
                  <Ionicons name="expand-outline" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

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

            {/* Chức năng: Bảo mật PIN */}
            <TouchableOpacity
              onPress={() =>
                router.push(
                  (hasPin
                    ? "/(root)/(profile)/change-pin"
                    : "/(root)/(profile)/setup-pin") as any,
                )
              }
              activeOpacity={0.7}
              className={`flex-row items-center p-4 border-b ${
                isDark ? "border-slate-700/60" : "border-slate-100"
              }`}
            >
              <View
                className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${
                  isDark
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-orange-50"
                }`}
              >
                <Ionicons
                  name="keypad-outline"
                  size={22}
                  color={isDark ? "#FCD34D" : "#F97316"}
                />
              </View>
              <View className="flex-1">
                <Text
                  className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {hasPin ? "Đổi mã PIN bảo mật" : "Thiết lập mã PIN"}
                </Text>
                <Text
                  className="text-slate-400 mt-0.5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  {hasPin
                    ? "Thay đổi mã PIN xác nhận đặt tour"
                    : "Tạo PIN 6 số để bảo vệ giao dịch"}
                </Text>
              </View>
              {!hasPin && (
                <View className="bg-orange-500 rounded-full px-2 py-0.5 mr-2">
                  <Text className="text-white text-xs font-bold">Mới</Text>
                </View>
              )}
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
          <View className="px-6 mt-6">
            <TouchableOpacity
              onPress={handleLogout}
              activeOpacity={0.85}
              style={{
                borderRadius: 18,
                overflow: "hidden",
                shadowColor: "#D0021B",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.25 : 0.35,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={
                  isDark ? ["#7F1D1D", "#991B1B"] : ["#D0021B", "#B30118"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.18)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={{
                    fontSize: FONT_SIZE.sm,
                    fontWeight: "800",
                    color: "#FFFFFF",
                    letterSpacing: 0.5,
                  }}
                >
                  Đăng xuất tài khoản
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Footer />
        </ScrollView>
      </LinearGradient>

      <ZaloFloatingButton />

      {/* Modal xem ảnh avatar phóng to — đặt ngoài ScrollView để không bị clip */}
      <Modal visible={avatarZoom} transparent animationType="fade" onRequestClose={() => setAvatarZoom(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.93)", justifyContent: "center", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => setAvatarZoom(false)}
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
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          {user?.avatarUrl && (
            <Image
              source={{ uri: user.avatarUrl }}
              style={{ width: "90%", height: "60%", borderRadius: 16 }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}
