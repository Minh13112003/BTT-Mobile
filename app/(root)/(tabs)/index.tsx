import { CollapsingHeader } from "@/components/CollapsingHeader";
import MembershipBanner from "@/components/MembershipBanner";
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
import React, { useEffect, useState } from "react";
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

/** Vertical sections rendered below the newest-tour carousel, in order. */
const HOME_SECTIONS: SearchMode[] = ["hot", "popular", "domestic", "foreign"];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { sections, loading, refreshing, onRefresh } = useHomeTours();
  const onScroll = useHideOnScroll();

  const [searchQuery, setSearchQuery] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

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
    const nearest = getNearestDeparture(tour.departures ?? []);
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
      },
    });
  };

  const openSearch = (params?: Record<string, string>) => {
    router.push({ pathname: "/(root)/(tabs)/search" as any, params });
  };

  const submitSearch = () => {
    const q = searchQuery.trim();
    openSearch(q ? { q } : undefined);
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
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          onScroll={onScroll}
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
              onPress={() =>
                router.push({
                  pathname: "/(root)/membership" as any,
                  params: { earnedPoints: String(earnedPoints) },
                })
              }
            >
              <MembershipBanner
                earnedPoints={earnedPoints}
                name={
                  user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : undefined
                }
              />
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

          {/* SECTION: TOUR MỚI NHẤT — carousel tự động 5s */}
          <SectionRow
            title={SECTION_LABELS.newest}
            onSeeAll={() => openSearch({ mode: "newest" })}
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
            <FeaturedCarousel tours={sections.newest} onPressTour={openDetail} />
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
        </ScrollView>
      </LinearGradient>
    </View>
  );
}
