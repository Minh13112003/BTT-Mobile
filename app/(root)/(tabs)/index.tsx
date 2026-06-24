import { CollapsingHeader } from "@/components/CollapsingHeader";
import { Footer } from "@/components/Footer";
import { RedesignedMembershipBanner } from "../membership";
import { FeaturedCarousel } from "@/components/tour/FeaturedCarousel";
import { SectionRow } from "@/components/tour/SectionHeader";
import { TourCard } from "@/components/tour/TourCard";
import { SECTION_LABELS, SearchMode } from "@/constants/tourFilters";
import { useAuth } from "@/context/Auth_Context";
import { useHideOnScroll } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { useHomeTours } from "@/hooks/useHomeTours";
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
  ActivityIndicator,
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
const HOME_SECTIONS: SearchMode[] = ["newest", "popular", "domestic", "foreign"];

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
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={{ flex: 1, alignItems: "center" }}>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
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
          fontSize: 12,
          fontWeight: "700",
          color: isDark ? "#94A3B8" : "#475569",
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

  const { sections, loading, refreshing, onRefresh } = useHomeTours();
  const onScroll = useHideOnScroll();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

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
        imageUrl: tour.imageUrl,
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

  /** A vertical section (Hot / Popular / Domestic / Foreign) using the full TourCard. */
  const renderSection = (mode: SearchMode) => {
    const data = sections[mode];
    return (
      <View key={mode}>
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
              style={{ fontSize: 16 }}
            >
              Chưa có tour trong mục này.
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className={`flex-1 ${isDark ? "bg-[#111318]" : "bg-[#F1F5F9]"}`}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#E51F27"} />
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
              tintColor={isDark ? "#94A3B8" : "#E51F27"}
            />
          }
        >
          {/* MEMBERSHIP RANK BANNER — clickable → trang quyền lợi */}
          {!!user && (
            <TouchableOpacity
              activeOpacity={0.85}
              className="px-5 mt-4"
              style={{ overflow: "visible" }}
              onPress={() =>
                router.push({
                  pathname: "/(root)/membership" as any,
                  params: { earnedPoints: String(earnedPoints) },
                })
              }
            >
              <View style={{ overflow: "visible", alignItems: "center", paddingVertical: 10 }}>
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
                className={`text-base font-semibold text-right mt-1 pr-1 ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Nhấn để xem quyền lợi thành viên →
              </Text>
            </TouchableOpacity>
          )}

          {/* SEARCH BAR & WELCOME GREETING */}
          <View className="px-5 mt-4">
            <Text
              className={`text-base font-semibold uppercase tracking-wider pl-1 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Chào mừng bạn trở lại,
            </Text>
            <Text
              className={`text-xl font-black tracking-tight pl-1 mb-3 ${
                isDark ? "text-slate-100" : "text-slate-800"
              }`}
            >
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Khách du lịch"}{" "}
              👋
            </Text>

            <View
              className={`flex-row items-center rounded-2xl border-2 px-4 h-14 shadow-sm ${
                isDark
                  ? "bg-slate-850 border-slate-700/60 bg-[#1E222B]"
                  : "bg-white border-slate-100"
              }`}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={isDark ? "#6B7280" : "#94A3B8"}
              />
              <TextInput
                className={`flex-1 h-full ml-3 font-semibold text-base ${
                  isDark ? "text-slate-100" : "text-slate-800"
                }`}
                placeholder="Bạn muốn tìm tour du lịch nào?"
                placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={submitSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={isDark ? "#6B7280" : "#94A3B8"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* DATE PICKER WIDGET */}
          <View className="px-5 mt-3">
            <View
              style={{
                backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: isDark ? "#334155" : "#E2E8F0",
                padding: 14,
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowOffset: { width: 0, height: 2 },
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? "#F8FAFC" : "#0F172A",
                  marginBottom: 10,
                }}
              >
                📅 Chọn ngày du lịch / khởi hành
              </Text>

              {/* Mode Tabs */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDateSearchMode("specific")}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: dateSearchMode === "specific" ? (isDark ? "#D0021B" : "#FFF1F2") : "transparent",
                    borderWidth: 1,
                    borderColor: dateSearchMode === "specific" ? "#D0021B" : (isDark ? "#334155" : "#E2E8F0"),
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: dateSearchMode === "specific" ? (isDark ? "#FFFFFF" : "#D0021B") : (isDark ? "#94A3B8" : "#64748B"),
                    }}
                  >
                    Ngày cụ thể
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDateSearchMode("range")}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 10,
                    backgroundColor: dateSearchMode === "range" ? (isDark ? "#D0021B" : "#FFF1F2") : "transparent",
                    borderWidth: 1,
                    borderColor: dateSearchMode === "range" ? "#D0021B" : (isDark ? "#334155" : "#E2E8F0"),
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: dateSearchMode === "range" ? (isDark ? "#FFFFFF" : "#D0021B") : (isDark ? "#94A3B8" : "#64748B"),
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
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    backgroundColor: isDark ? "#111318" : "#F8FAFC",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="calendar-outline" size={18} color="#D0021B" style={{ marginRight: 8 }} />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: specificDate ? (isDark ? "#F8FAFC" : "#0F172A") : (isDark ? "#64748B" : "#94A3B8"),
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
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      backgroundColor: isDark ? "#111318" : "#F8FAFC",
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#D0021B" style={{ marginRight: 6 }} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: startDate ? (isDark ? "#F8FAFC" : "#0F172A") : (isDark ? "#64748B" : "#94A3B8"),
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
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#334155" : "#E2E8F0",
                      backgroundColor: isDark ? "#111318" : "#F8FAFC",
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color="#D0021B" style={{ marginRight: 6 }} />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 13,
                        fontWeight: "600",
                        color: endDate ? (isDark ? "#F8FAFC" : "#0F172A") : (isDark ? "#64748B" : "#94A3B8"),
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
                      paddingVertical: 10,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDark ? "#4A5568" : "#CBD5E0",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="refresh-outline" size={18} color={isDark ? "#CBD5E1" : "#475569"} />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={submitSearch}
                  style={{
                    flex: 1,
                    backgroundColor: "#D0021B",
                    paddingVertical: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>
                    Tìm kiếm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* QUICK ACCESS GRID — Shopee style */}
          <View
            className="mx-5 mt-5 rounded-2xl"
            style={{
              backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
              shadowColor: "#000",
              shadowOpacity: 0.06,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 10,
              elevation: 3,
              paddingVertical: 16,
              paddingHorizontal: 8,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <QuickIcon
                label="Du lịch"
                icon="map-outline"
                bgLight="#EFF6FF"
                bgDark="#1A2640"
                color="#3B82F6"
                isDark={isDark}
                onPress={() => router.push("/(root)/(tabs)/search" as any)}
              />
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
          <SectionRow
            title={SECTION_LABELS.hot}
            onSeeAll={() => openSearch({ mode: "hot" })}
          />
          {loading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color={isDark ? "#94A3B8" : "#E51F27"} />
              <Text
                className={`mt-2 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}
                style={{ fontSize: 16 }}
              >
                Đang tải dữ liệu...
              </Text>
            </View>
          ) : (
            <FeaturedCarousel tours={sections.hot} onPressTour={openDetail} />
          )}

          {/* SECTIONS: HOT / POPULAR / DOMESTIC / FOREIGN */}
          {!loading && HOME_SECTIONS.map((mode) => renderSection(mode))}

          {/* TIN TỨC NỔI BẬT */}
          {news.length > 0 && (
            <View className="mt-8">
              <View className="flex-row justify-between items-center px-5 mb-3">
                <Text
                  className={`text-lg font-black tracking-tight ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  Tin tức nổi bật
                </Text>
                <TouchableOpacity onPress={() => router.push("/(root)/news" as any)} activeOpacity={0.7}>
                  <Text className="text-base font-black text-[#D0021B]">Xem tất cả →</Text>
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
                        className={`text-base font-bold leading-4 ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                        numberOfLines={2}
                      >
                        {item.title}
                      </Text>
                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="text-base text-slate-400 font-semibold">
                          {item.date}
                        </Text>
                        <Text
                          className={`text-base font-black uppercase ${
                            isDark ? "color-[#CBD5E1]" : "text-blue-600"
                          }`}
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
          <Footer />
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
