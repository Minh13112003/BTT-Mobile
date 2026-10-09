import { Footer } from "@/components/Footer";
import { getTier } from "@/components/MembershipBanner";
import TierAvatar from "@/components/profile/TierAvatar";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { logout as apiLogout } from "@/services/auth";
import { getTransactionHistory } from "@/services/booking";
import { getMyFavorites } from "@/services/favorite";
import { getVouchers } from "@/services/voucher";
import { getItem, setItem } from "@/utils/storage";
import { formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

const PROMO_KEY = "pref_promo_notifications";
const UPCOMING_DAYS = 5;
const UPCOMING_MAX = 5;
const BOOKED_STATUSES = ["CONFIRMED", "PAID"];

interface UpcomingTrip {
  id: string;
  name: string;
  image?: string;
  date: string;
  guests: number;
  daysLeft: number;
}

/** Số ngày từ hôm nay (00:00) đến ngày khởi hành; null nếu ngày không hợp lệ. */
function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export default function ProfileScreen() {
  const { isLoggedIn, user, earnedPoints, logout, refreshPoints } = useAuth();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

  const [trips, setTrips] = useState<UpcomingTrip[]>([]);
  const [favCount, setFavCount] = useState<number | null>(null);
  const [voucherCount, setVoucherCount] = useState<number | null>(null);
  const [promoOn, setPromoOn] = useState(true);

  const tier = getTier(earnedPoints ?? 0);
  const fullName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : "Người dùng";
  const initials =
    `${(user?.firstName ?? "").charAt(0)}${(user?.lastName ?? "").charAt(0)}`.toUpperCase() || "BT";

  useEffect(() => {
    getItem(PROMO_KEY)
      .then((v) => setPromoOn(v !== "off"))
      .catch(() => {});
  }, []);

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

  const loadSummary = useCallback(async () => {
    const [orders, favs, vouchers] = await Promise.allSettled([
      getTransactionHistory(1, 50),
      getMyFavorites(),
      getVouchers(1, 20),
    ]);

    if (orders.status === "fulfilled") {
      const items: any[] = Array.isArray(orders.value?.data?.items) ? orders.value.data.items : [];
      const list = items
        .filter((o) => BOOKED_STATUSES.includes(o.status))
        .map((o) => ({ o, days: daysUntil(o.departure?.departureDate) }))
        .filter((x) => x.days !== null && x.days >= 0 && x.days <= UPCOMING_DAYS)
        .sort((a, b) => (a.days as number) - (b.days as number))
        .slice(0, UPCOMING_MAX)
        .map(({ o, days }) => ({
          id: o.id,
          name: o.tour?.name ?? "Tour",
          image: Array.isArray(o.tour?.imageUrl) ? o.tour.imageUrl[0] : o.tour?.imageUrl,
          date: formatDepartureDate(o.departure?.departureDate),
          guests: o.quantity ?? 1,
          daysLeft: days as number,
        }));
      setTrips(list);
    }
    if (favs.status === "fulfilled") {
      setFavCount(Array.isArray(favs.value?.data) ? favs.value.data.length : 0);
    }
    if (vouchers.status === "fulfilled") {
      setVoucherCount(Array.isArray(vouchers.value?.data?.items) ? vouchers.value.data.items.length : 0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) {
        refreshPoints();
        loadSummary();
      }
    }, [isLoggedIn, refreshPoints, loadSummary]),
  );

  if (!isLoggedIn) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#D0021B" />
      </View>
    );
  }

  const togglePromo = (v: boolean) => {
    setPromoOn(v);
    setItem(PROMO_KEY, v ? "on" : "off").catch(() => {});
  };

  const textMain = isDark ? "text-slate-100" : "text-[#1A1A2E]";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const groupCls = isDark ? "bg-[#1A1F2B] border-[#272D3C]" : "bg-white border-slate-100";
  const divider = isDark ? "border-slate-700/60" : "border-slate-100";

  const Row = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
    last,
    right,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string;
    last?: boolean;
    right?: React.ReactNode;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      className={`flex-row items-center px-4 ${last ? "" : `border-b ${divider}`}`}
      style={{ minHeight: 64 }}
    >
      <View
        className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 ${
          isDark ? "bg-slate-700" : "bg-[#FDECEE]"
        }`}
      >
        <Ionicons name={icon} size={21} color={isDark ? "#FCA5A5" : "#C00119"} />
      </View>
      <View className="flex-1 py-2">
        <Text className={`font-bold ${textMain}`} style={{ fontSize: FONT_SIZE.xs }}>
          {title}
        </Text>
        {subtitle ? (
          <Text className={`mt-0.5 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {badge ? (
        <View className="bg-orange-700 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xxs }}>
            {badge}
          </Text>
        </View>
      ) : null}
      {right ??
        (onPress ? (
          <Ionicons name="chevron-forward" size={18} color={isDark ? "#6B7280" : "#A3A8B5"} />
        ) : null)}
    </TouchableOpacity>
  );

  const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View>
      <Text
        className={`font-bold uppercase tracking-wider mb-2 pl-1 ${textMuted}`}
        style={{ fontSize: FONT_SIZE.xxs }}
      >
        {label}
      </Text>
      <View className={`rounded-[20px] overflow-hidden border ${groupCls}`}>{children}</View>
    </View>
  );

  const Tile = ({
    icon,
    value,
    label,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: number | null;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`flex-1 rounded-[18px] p-3.5 border ${groupCls}`}
      style={{
        shadowColor: "#1A1A2E",
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
      }}
    >
      <View
        className={`w-9 h-9 rounded-xl items-center justify-center mb-2 ${
          isDark ? "bg-slate-700" : "bg-[#FDECEE]"
        }`}
      >
        <Ionicons name={icon} size={19} color={isDark ? "#FCA5A5" : "#C00119"} />
      </View>
      <Text className={`font-black ${textMain}`} style={{ fontSize: FONT_SIZE.xl }}>
        {value ?? "–"}
      </Text>
      <Text className={textMuted} style={{ fontSize: FONT_SIZE.xxs }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const heroColors = isDark
    ? (["#2A2E38", "#1E222B", "#14161C"] as const)
    : (["#B30014", "#8A0010", "#5C000B"] as const);

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero */}
        <LinearGradient
          colors={heroColors}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={{ paddingTop: insets.top + 14, paddingBottom: 76, paddingHorizontal: 20, overflow: "hidden" }}
        >
          <Svg width={390} height={260} style={{ position: "absolute", top: 0, right: 0 }}>
            <Circle cx={350} cy={30} r={150} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} />
            <Circle cx={350} cy={30} r={210} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1.5} />
          </Svg>
          <Image
            source={require("@/assets/images/Logo_BTT-2018-02.png")}
            style={{ position: "absolute", right: -60, bottom: -6, width: 260, height: 130, opacity: 0.12 }}
            resizeMode="contain"
          />
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-black" style={{ fontSize: FONT_SIZE.xl }}>
              Tài khoản
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/(profile)/selfprofile")}
              activeOpacity={0.8}
              className="flex-row items-center h-10 px-4 rounded-full border border-white/30 bg-white/15"
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text className="text-white font-bold ml-1.5" style={{ fontSize: FONT_SIZE.xxs }}>
                Sửa hồ sơ
              </Text>
            </TouchableOpacity>
          </View>

          <View className="items-center mt-1">
            <TierAvatar tier={tier.name} avatarUrl={user?.avatarUrl} initials={initials} />
            <Text className="text-white font-bold text-center" style={{ fontSize: FONT_SIZE.lg, marginTop: -2 }}>
              {fullName}
            </Text>
            <Text className="text-white/80 mt-0.5" style={{ fontSize: FONT_SIZE.xxs }}>
              {user?.phonenumber || user?.email}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(root)/membership")}
              activeOpacity={0.8}
              className="flex-row items-center mt-2 h-8 px-3 rounded-full"
              style={{
                backgroundColor: "rgba(255,230,128,0.18)",
                borderWidth: 1,
                borderColor: "rgba(255,230,128,0.55)",
              }}
            >
              <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: "#F0C020" }} />
              <Text className="font-bold" style={{ fontSize: FONT_SIZE.xxs, color: "#FFF1B8" }}>
                Hạng {tier.name} · Xem quyền lợi
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View className="px-4 gap-6" style={{ marginTop: -48 }}>
          {/* Ô thống kê nhanh */}
          <View className="flex-row gap-2.5">
            <Tile
              icon="calendar-outline"
              value={trips.length}
              label="Chuyến sắp đi"
              onPress={() => router.push("/(root)/(tabs)/history")}
            />
            <Tile
              icon="heart-outline"
              value={favCount}
              label="Tour yêu thích"
              onPress={() => router.push("/(root)/(tabs)/history")}
            />
            <Tile
              icon="pricetag-outline"
              value={voucherCount}
              label="Voucher"
              onPress={() => router.push("/(root)/(profile)/vouchers")}
            />
          </View>

          {/* Sắp khởi hành: tour đã đặt, còn ≤ 5 ngày, tối đa 5 */}
          {trips.length > 0 && (
            <View>
              <View className="flex-row items-baseline justify-between mb-2 px-1">
                <Text
                  className={`font-bold uppercase tracking-wider ${textMuted}`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  Tour sắp khởi hành của bạn · trong {UPCOMING_DAYS} ngày
                </Text>
                <Text className={`font-semibold ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                  {trips.length} chuyến
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginRight: -16 }}
                contentContainerStyle={{ paddingRight: 16, gap: 12 }}
              >
                {trips.map((t, i) => (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({ pathname: "/detailTour" as any, params: { id: t.id } })
                    }
                    className={`rounded-[20px] p-3.5 border ${groupCls}`}
                    style={{ width: 296 }}
                  >
                    <View className="flex-row gap-3">
                      {t.image ? (
                        <Image source={{ uri: t.image }} style={{ width: 64, height: 64, borderRadius: 14 }} />
                      ) : (
                        <View
                          style={{ width: 64, height: 64, borderRadius: 14 }}
                          className={isDark ? "bg-slate-700" : "bg-slate-200"}
                        />
                      )}
                      <View className="flex-1">
                        <Text
                          numberOfLines={2}
                          className={`font-bold ${textMain}`}
                          style={{ fontSize: FONT_SIZE.xxs }}
                        >
                          {t.name}
                        </Text>
                        <Text className={`mt-1 ${textMuted}`} style={{ fontSize: FONT_SIZE.xxs }}>
                          {t.date} · {t.guests} khách
                        </Text>
                      </View>
                    </View>
                    <View
                      className="flex-row items-center mt-3 rounded-2xl px-3 py-2.5"
                      style={{
                        backgroundColor: i === 0 ? "#8A0010" : isDark ? "#3A1F26" : "#FDECEE",
                      }}
                    >
                      <View className="items-center mr-3" style={{ minWidth: 44 }}>
                        <Text
                          className="font-black"
                          style={{ fontSize: FONT_SIZE.lg, color: i === 0 || isDark ? "#FFFFFF" : "#B30118" }}
                        >
                          {t.daysLeft}
                        </Text>
                        <Text
                          className="font-semibold"
                          style={{
                            fontSize: FONT_SIZE.xxs,
                            color: i === 0 ? "rgba(255,255,255,0.8)" : isDark ? "#FCA5A5" : "#B30118",
                          }}
                        >
                          {t.daysLeft === 0 ? "hôm nay" : "ngày nữa"}
                        </Text>
                      </View>
                      <Text
                        className="flex-1"
                        numberOfLines={2}
                        style={{
                          fontSize: FONT_SIZE.xxs,
                          color: i === 0 ? "#FFFFFF" : isDark ? "#E2E8F0" : "#4B4F5C",
                        }}
                      >
                        {i === 0
                          ? "Chuẩn bị CCCD, có mặt tại điểm hẹn trước giờ khởi hành"
                          : "Xem lịch trình và điểm hẹn"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <Group label="Tài khoản">
            <Row
              icon="person-outline"
              title="Thông tin cá nhân"
              subtitle="Họ tên, ngày sinh, CCCD, hộ chiếu"
              onPress={() => router.push("/(root)/(profile)/selfprofile")}
            />
            <Row
              icon="lock-closed-outline"
              title="Mật khẩu & mã PIN"
              subtitle="Đổi mật khẩu, mã PIN xác nhận đặt tour"
              onPress={() => router.push("/(root)/(profile)/security" as any)}
              last
            />
          </Group>

          <Group label="Hỗ trợ">
            <Row
              icon="call-outline"
              title="Gọi tổng đài 1900 6668"
              subtitle="Tư vấn & hỗ trợ đặt tour"
              onPress={() => Linking.openURL("tel:19006668").catch(() => {})}
            />
            <Row
              icon="chatbubble-outline"
              title="Nhắn tin qua Zalo"
              subtitle="Trao đổi trực tiếp với nhân viên"
              onPress={() => Linking.openURL("https://zalo.me/237833859403376914").catch(() => {})}
            />
            <Row
              icon="help-circle-outline"
              title="Câu hỏi thường gặp"
              subtitle="Hoàn huỷ, visa, thanh toán, hành lý"
              badge="Mới"
              onPress={() => router.push("/(root)/(profile)/faq" as any)}
            />
            <Row
              icon="chatbox-ellipses-outline"
              title="Gửi góp ý"
              subtitle="Giúp chúng tôi phục vụ tốt hơn"
              onPress={() => router.push("/(root)/(profile)/feedback")}
              last
            />
          </Group>

          <Group label="Cài đặt">
            <Row
              icon="moon-outline"
              title="Giao diện tối"
              right={
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: "#D7DAE2", true: "#D0021B" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row
              icon="notifications-outline"
              title="Thông báo khuyến mãi"
              subtitle="Tour mới, ưu đãi giờ chót"
              right={
                <Switch
                  value={promoOn}
                  onValueChange={togglePromo}
                  trackColor={{ false: "#D7DAE2", true: "#D0021B" }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <Row
              icon="document-text-outline"
              title="Điều khoản & chính sách"
              subtitle="Điều khoản sử dụng, bảo mật dữ liệu"
              onPress={() => router.push("/(root)/(profile)/terms" as any)}
            />
            <Row
              icon="information-circle-outline"
              title="Về BenThanh Tourist"
              subtitle="Giới thiệu, liên hệ, văn phòng"
              onPress={() => router.push("/(root)/(profile)/about" as any)}
              last
            />
          </Group>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className={`flex-row items-center justify-center h-14 rounded-[18px] border-[1.5px] ${
              isDark ? "bg-[#1A1F2B] border-red-900" : "bg-white border-[#F3C4CA]"
            }`}
          >
            <Ionicons name="log-out-outline" size={20} color={isDark ? "#FCA5A5" : "#B30118"} />
            <Text
              className="font-bold ml-2"
              style={{ fontSize: FONT_SIZE.xs, color: isDark ? "#FCA5A5" : "#B30118" }}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
        <Footer />
      </ScrollView>
      <ZaloFloatingButton />
    </View>
  );
}
