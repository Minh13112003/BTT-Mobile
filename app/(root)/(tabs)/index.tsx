import { CollapsingHeader } from "@/components/CollapsingHeader";
import { Footer } from "@/components/Footer";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { FONT_SIZE } from "@/constants/typography";
import { getPalette, RADIUS, getShadow } from "@/constants/theme";
import { RedesignedMembershipBanner } from "../membership";
import { FeaturedCarousel } from "@/components/tour/FeaturedCarousel";
import { SectionRow } from "@/components/tour/SectionHeader";
import { TourCard } from "@/components/tour/TourCard";
import { SECTION_LABELS } from "@/constants/tourFilters";
import { useAuth } from "@/context/Auth_Context";
import { useHideOnScroll } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { useHomeTours, HomeSections } from "@/hooks/useHomeTours";
import { getNews, NewsItem } from "@/services/news";
import { TourItem } from "@/services/tour";
import { getMe } from "@/services/user";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DatePickerCalendar from "@/components/tour/DatePickerCalendar";

/** Vertical sections rendered below the hot-tour carousel, in order. */
const HOME_SECTIONS: (keyof HomeSections)[] = ["upcoming"];

function QuickIcon({
  label,
  icon,
  bgLight,
  bgDark,
  color,
  onPress,
  isDark,
}: {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  bgLight: string;
  bgDark: string;
  color: string;
  onPress: () => void;
  isDark: boolean;
}) {
  const palette = getPalette(isDark);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={{ flex: 1, minHeight: 44, alignItems: "center", justifyContent: "center" }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: RADIUS.md,
          backgroundColor: isDark ? bgDark : bgLight,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
        }}
      >
        <Ionicons name={icon} size={26} color={color} />
      </View>
      <Text
        style={{
          fontSize: FONT_SIZE.card,
          fontWeight: "700",
          color: palette.textSecondary,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, rewardPoints } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);

  const { sections, loading, refreshing, onRefresh } = useHomeTours();
  const onScroll = useHideOnScroll();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [iconScrollProgress, setIconScrollProgress] = useState(0);

  // States for Date filter widget
  const [dateSearchMode, setDateSearchMode] = useState<"specific" | "range">("specific");
  const [specificDate, setSpecificDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickerTarget, setPickerTarget] = useState<null | "specific" | "start" | "end">(null);

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const clearDateFilters = () => {
    setSpecificDate("");
    setStartDate("");
    setEndDate("");
  };

  const submitSearch = () => {
    const params: Record<string, string> = {};
    if (searchQuery.trim()) {
      params.q = searchQuery.trim();
    }
    const hasDateFilter =
      dateSearchMode === "specific"
        ? !!specificDate
        : dateSearchMode === "range" && (!!startDate || !!endDate);

    if (hasDateFilter) {
      params.dateMode = dateSearchMode;
      if (dateSearchMode === "specific" && specificDate) {
        params.specificDate = specificDate;
      } else if (dateSearchMode === "range") {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }
    }
    openSearch(params);
  };

  useEffect(() => {
    getNews()
      .then((res) => setNews(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
    getMe()
      .then((res) => {
        const me = res?.data?.data ?? res?.data;
        setEarnedPoints(typeof me?.earnedPoints === "number" ? me.earnedPoints : 0);
      })
      .catch(() => {});
  }, []);

  const openDetail = (tour: TourItem) => {
    let matchingDeparture = null;
    if (dateSearchMode === "specific" && specificDate) {
      const target = new Date(specificDate);
      matchingDeparture = tour.departures?.find((dep) => {
        const depDate = new Date(dep.departureDate);
        return (
          depDate.getFullYear() === target.getFullYear() &&
          depDate.getMonth() === target.getMonth() &&
          depDate.getDate() === target.getDate()
        );
      });
    } else if (dateSearchMode === "range" && (startDate || endDate)) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date(8640000000000000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matchingDeparture = tour.departures?.find((dep) => {
        const depDate = new Date(dep.departureDate);
        return depDate >= start && depDate <= end;
      });
    }

    const nearest = matchingDeparture || getNearestDeparture(tour.departures ?? []);
    const displayPrice = nearest?.price ?? null;

    router.push({
      pathname: "/(root)/tour/[id]",
      params: {
        id: tour.id,
        name: tour.name,
        imageUrl: Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl,
        price: displayPrice != null ? String(displayPrice) : "0",
        duration: tour.duration,
        rating: String(tour.rating),
        reviewsCount: String(tour.reviewsCount),
        hasVat: tour.hasVat ? "true" : "false",
        searchDateMode: dateSearchMode,
        searchSpecificDate: specificDate,
        searchStartDate: startDate,
        searchEndDate: endDate,
      },
    });
  };

  const openSearch = (params?: Record<string, string>) => {
    router.push({
      pathname: "/(root)/(tabs)/search" as any,
      params: { referrer: "home", ...params },
    });
  };

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  /** A vertical section (Tour sắp khởi hành) using the full TourCard. */
  const renderSection = (mode: keyof HomeSections) => {
    const data = sections[mode];
    return (
      <View key={mode} className="mt-9">
        <SectionRow
          title={SECTION_LABELS[mode]}
          onSeeAll={() => openSearch({ mode })}
        />
        <View className="mx-5">
          {data.length ? (
            data.map((item) => (
              <TourCard key={item.id} tour={item} onPress={() => openDetail(item)} />
            ))
          ) : (
            <Text
              className={`font-semibold ${isDark ? "text-slate-500" : "text-slate-400"}`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Chưa có tour trong mục này.
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <AppLoadingScreen message="Đang tải trang chủ..." />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" backgroundColor={isDark ? palette.surface : "#E51F27"} />
      <CollapsingHeader title="BENTHANH TOURIST" showActions={true} />

      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={(event) => {
            const offsetY = event.nativeEvent.contentOffset.y;
            setShowBackToTop(offsetY > 300);
            if (onScroll) onScroll(event);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.spinner}
            />
          }
        >
          {/* MEMBERSHIP RANK BANNER — clickable → trang quyền lợi */}
          {!!user && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="px-5 mt-8"
              style={{ overflow: "visible" }}
              onPress={() =>
                router.push({
                  pathname: "/(root)/membership" as any,
                  params: { earnedPoints: String(earnedPoints) },
                })
              }
            >
              <View style={{ alignItems: "center", paddingVertical: 10 }}>
                <RedesignedMembershipBanner
                  earnedPoints={earnedPoints}
                  rewardPoints={rewardPoints}
                  name={
                    user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : undefined
                  }
                />
              </View>
              <Text
                className={`font-semibold text-right mt-3 pr-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Nhấn để xem quyền lợi thành viên →
              </Text>
            </TouchableOpacity>
          )}

          {/* SEARCH BAR & WELCOME GREETING */}
          <View className="px-5 mt-9">
            <Text
              className={`font-semibold uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Chào mừng bạn trở lại,
            </Text>
            <Text
              className={`font-black tracking-tight pl-1 ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
              style={{ fontSize: FONT_SIZE.xl }}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Khách du lịch"}{" "}
              👋
            </Text>
          </View>

          {/* DATE PICKER WIDGET */}
          <View className="px-5 mt-9">
            <View
              style={{
                backgroundColor: palette.surface,
                borderRadius: RADIUS.lg,
                borderWidth: 1,
                borderColor: palette.border,
                padding: 16,
                ...getShadow(isDark, "sm"),
              }}
            >
              {/* Ô tìm kiếm tích hợp vào lịch */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: palette.border,
                  backgroundColor: palette.surfaceAlt,
                  paddingHorizontal: 16,
                  height: 48,
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={palette.iconMuted}
                />
                <TextInput
                  className={`flex-1 h-full ml-3 font-semibold ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xs }}
                  placeholder="Bạn muốn tìm tour du lịch nào?"
                  placeholderTextColor={palette.iconMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                  onSubmitEditing={submitSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={palette.iconMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text
                style={{
                  fontSize: FONT_SIZE.xs,
                  fontWeight: "700",
                  color: palette.textPrimary,
                  marginBottom: 10,
                }}
              >
                📅 Chọn ngày du lịch / khởi hành
              </Text>

              {/* Mode Tabs */}
              <View style={{ flexDirection: "row", marginTop: 5 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDateSearchMode("specific")}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottomWidth: 2,
                    borderBottomColor: dateSearchMode === "specific" ? (isDark ? "#FFFFFF" : palette.brand) : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: dateSearchMode === "specific" ? (isDark ? "#FFFFFF" : palette.brand) : palette.textSecondary,
                    }}
                  >
                    Ngày cụ thể
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setDateSearchMode("range")}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    paddingVertical: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottomWidth: 2,
                    borderBottomColor: dateSearchMode === "range" ? (isDark ? "#FFFFFF" : palette.brand) : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: dateSearchMode === "range" ? (isDark ? "#FFFFFF" : palette.brand) : palette.textSecondary,
                    }}
                  >
                    Khoảng ngày
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Input Selectors */}
              {dateSearchMode === "specific" ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setPickerTarget("specific")}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 44,
                    padding: 12,
                    borderRadius: RADIUS.sm,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: palette.surfaceAlt,
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color={palette.brand} style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      fontSize: FONT_SIZE.xs,
                      fontWeight: "600",
                      color: specificDate ? palette.textPrimary : palette.textMuted,
                    }}
                  >
                    {specificDate ? formatDateDisplay(specificDate) : "Chọn ngày khởi hành"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPickerTarget("start")}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: 44,
                      padding: 12,
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: palette.border,
                      backgroundColor: palette.surfaceAlt,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={palette.brand} style={{ marginRight: 6 }} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: FONT_SIZE.xs,
                        fontWeight: "600",
                        color: startDate ? palette.textPrimary : palette.textMuted,
                      }}
                    >
                      {startDate ? formatDateDisplay(startDate) : "Từ ngày"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPickerTarget("end")}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      minHeight: 44,
                      padding: 12,
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: palette.border,
                      backgroundColor: palette.surfaceAlt,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={palette.brand} style={{ marginRight: 6 }} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: FONT_SIZE.xs,
                        fontWeight: "600",
                        color: endDate ? palette.textPrimary : palette.textMuted,
                      }}
                    >
                      {endDate ? formatDateDisplay(endDate) : "Đến ngày"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={{ flexDirection: "row", gap: 10 }}>
                {(specificDate || startDate || endDate) && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={clearDateFilters}
                    style={{
                      minWidth: 44,
                      minHeight: 44,
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: palette.border,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="refresh-outline" size={18} color={palette.textSecondary} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={submitSearch}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    backgroundColor: palette.brand,
                    paddingVertical: 12,
                    borderRadius: RADIUS.sm,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: FONT_SIZE.xs }}>
                    Tìm kiếm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 5 TOUR TYPE ICONS */}
          <View className="mt-6">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 14, paddingVertical: 4 }}
              onScroll={(event) => {
                const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
                const maxScroll = contentSize.width - layoutMeasurement.width;
                if (maxScroll > 0) {
                  setIconScrollProgress(contentOffset.x / maxScroll);
                }
              }}
              scrollEventThrottle={16}
            >
              {[
                {
                  mode: "tour_of_the_year_2026",
                  label: "TOUR OF THE\nYEAR 2026",
                  image: require("@/assets/images/tour_year_2026.png"),
                },
                {
                  mode: "tour_cao_cap",
                  label: "TOUR\nCAO CẤP",
                  image: require("@/assets/images/tour_cao_cap.png"),
                },
                {
                  mode: "tour_mice",
                  label: "TOUR\nMICE",
                  image: require("@/assets/images/tour_mice.png"),
                },
                {
                  mode: "tour_he",
                  label: "TOUR\nHÈ",
                  image: require("@/assets/images/tour_he.png"),
                },
                {
                  mode: "tour_du_lich_xanh",
                  label: "DU LỊCH\nXANH",
                  image: require("@/assets/images/tour_du_lich_xanh.png"),
                },
              ].map((item) => (
                 <TouchableOpacity
                  key={item.mode}
                  activeOpacity={0.8}
                  onPress={() => openSearch({ mode: item.mode })}
                  style={{ alignItems: "center", width: 100 }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      borderWidth: 2,
                      borderColor: palette.brand,
                      overflow: "hidden",
                      backgroundColor: palette.surface,
                      justifyContent: "center",
                      alignItems: "center",
                      ...getShadow(isDark, "sm"),
                    }}
                  >
                    <Image
                      source={item.image}
                      style={{ width: 74, height: 74 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "800",
                      color: isDark ? "#CBD5E1" : palette.textPrimary,
                      textAlign: "center",
                      marginTop: 6,
                      lineHeight: 16,
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Custom horizontal scroll indicator (Shopee/Lazada style) */}
            <View style={{ alignItems: "center", marginTop: 10 }}>
              <View style={{ width: 64, height: 6, borderRadius: 3, backgroundColor: isDark ? "#334155" : "#CBD5E1", overflow: "hidden", flexDirection: "row" }}>
                <View style={{
                  width: 22,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: palette.brand,
                  marginLeft: iconScrollProgress * 42
                }} />
              </View>
            </View>
          </View>

          {/* QUICK ACCESS GRID — Shopee style */}
          <View
            className="mx-5 mt-9"
            style={{
              backgroundColor: palette.surface,
              borderRadius: RADIUS.md,
              ...getShadow(isDark, "sm"),
              paddingVertical: 16,
              paddingHorizontal: 8,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <QuickIcon
                label="Tin tức"
                icon="newspaper-outline"
                bgLight="#ECFDF5"
                bgDark="#1A2D20"
                color="#10B981"
                isDark={isDark}
                onPress={() => router.push("/(root)/news" as any)}
              />
              <QuickIcon
                label="Mẹo hay"
                icon="bulb-outline"
                bgLight="#FFFBEB"
                bgDark="#2A2010"
                color="#F59E0B"
                isDark={isDark}
                onPress={() => router.push("/(root)/tips" as any)}
              />
              <QuickIcon
                label="Ưu đãi"
                icon="gift-outline"
                bgLight="#FFF1F2"
                bgDark="#2A1520"
                color="#E11D48"
                isDark={isDark}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/(tabs)/search" as any,
                    params: { mode: "hot" },
                  })
                }
              />
            </View>
          </View>

          {/* SECTION: TOUR HOT NHẤT — carousel tự động 5s */}
          <View className="mt-9">
            <SectionRow
              title={SECTION_LABELS.hot}
              onSeeAll={() => openSearch({ mode: "hot" })}
            />
          </View>
          <FeaturedCarousel tours={sections.hot} onPressTour={openDetail} />

          {/* SECTION: TOUR SẮP KHỞI HÀNH */}
          {!loading && HOME_SECTIONS.map((mode) => renderSection(mode))}

          {/* TIN TỨC NỔI BẬT */}
          {news.length > 0 && (
            <View className="mt-9">
              <View className="flex-row justify-between items-center px-5 mb-3">
                <Text
                  className={`font-black tracking-tight ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                  style={{ fontSize: FONT_SIZE.xl }}
                >
                  Tin tức nổi bật
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(root)/news" as any)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text className="font-black" style={{ fontSize: FONT_SIZE.xs, color: palette.brand }}>Xem tất cả →</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 8 }}
              >
                {news.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.9}
                    onPress={() =>
                      router.push({
                        pathname: "/(root)/news/[id]" as any,
                        params: { id: item.id },
                      })
                    }
                    className={`w-64 rounded-2xl border shadow-sm mr-3 overflow-hidden mb-2 ${
                      isDark
                        ? "bg-slate-800/90 border-slate-700/50 shadow-black/40"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      className="w-full h-32 bg-slate-900/10"
                      resizeMode="cover"
                    />
                    <View className="p-3">
                      <Text
                        className={`font-bold ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        numberOfLines={2}
                        style={{ fontSize: FONT_SIZE.xs, lineHeight: 26 }}
                      >
                        {item.title}
                      </Text>
                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="text-slate-400 font-semibold" style={{ fontSize: FONT_SIZE.card }}>
                          {item.date}
                        </Text>
                        <Text
                          className={`font-black uppercase ${
                            isDark ? "color-[#CBD5E1]" : "text-blue-600"
                          }`}
                          style={{ fontSize: FONT_SIZE.card }}
                        >
                          Xem chi tiết
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <View className="mt-9">
            <Footer />
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Date Picker Calendar Modal */}
      <DatePickerCalendar
        visible={pickerTarget !== null}
        onClose={() => setPickerTarget(null)}
        selectedDate={
          pickerTarget === "specific"
            ? specificDate
            : pickerTarget === "start"
            ? startDate
            : pickerTarget === "end"
            ? endDate
            : undefined
        }
        onSelectDate={(dateStr) => {
          if (pickerTarget === "specific") {
            setSpecificDate(dateStr);
          } else if (pickerTarget === "start") {
            setStartDate(dateStr);
          } else if (pickerTarget === "end") {
            setEndDate(dateStr);
          }
        }}
        title={
          pickerTarget === "specific"
            ? "Chọn ngày khởi hành"
            : pickerTarget === "start"
            ? "Chọn ngày bắt đầu"
            : "Chọn ngày kết thúc"
        }
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
            bottom: 30,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: palette.brand,
            alignItems: "center",
            justifyContent: "center",
            ...(isDark
              ? getShadow(isDark, "lg")
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 6,
                }),
            zIndex: 99,
          }}
        >
          <Ionicons name="arrow-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <ZaloFloatingButton liftBy={showBackToTop ? 60 : 0} />
    </View>
  );
}
