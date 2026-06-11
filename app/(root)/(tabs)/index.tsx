import Header from "@/components/Header";
import MembershipBanner from "@/components/MembershipBanner";
import { TourCard } from "@/components/tour/TourCard";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import { getNews, NewsItem } from "@/services/news";
import { getMe } from "@/services/user";
import { getTours, TourItem } from "@/services/tour";
import { getNearestDeparture, formatPrice, formatDepartureDate } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tours, setTours] = useState<TourItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const loadData = async () => {
    try {
      const [toursRes, newsRes, meRes] = await Promise.all([
        getTours(1, 5),
        getNews(),
        getMe().catch(() => null),
      ]);

      const toursData: TourItem[] = Array.isArray(toursRes.data?.items)
        ? toursRes.data.items
        : [];

      setTours(toursData);
      setNews(newsRes.data);

      const me = meRes?.data?.data ?? meRes?.data;
      setEarnedPoints(typeof me?.earnedPoints === "number" ? me.earnedPoints : 0);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu trang chủ:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredTours = Array.isArray(tours)
    ? tours.filter((tour) =>
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

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
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#E51F27"}
            />
            <Text
              className={`text-base font-medium mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Đang tải dữ liệu...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
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
                />
              </View>
            </View>

            {/* CHUYẾN DU LỊCH HIỆN CÓ */}
            <View className="mx-5 mt-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className={`text-lg font-black tracking-tight ${
                    isDark ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  Chuyến du lịch hiện có
                </Text>
                <Text className="text-base text-slate-400 font-semibold">
                  Có {filteredTours.length} tour
                </Text>
              </View>

              {filteredTours.length > 0 ? (
                filteredTours.map((item) => {
                  const nearest = getNearestDeparture(item.departures ?? []);
                  const displayPrice = nearest?.price ?? null;
                  return (
                    <TourCard
                      key={item.id}
                      tour={item}
                      onPress={() => {
                        router.push({
                          pathname: "/(root)/tour/[id]",
                          params: {
                            id: item.id,
                            name: item.name,
                            imageUrl: item.imageUrl,
                            price: displayPrice != null ? String(displayPrice) : "0",
                            duration: item.duration,
                            rating: item.rating.toString(),
                            reviewsCount: item.reviewsCount.toString(),
                            hasVat: item.hasVat ? "true" : "false",
                          },
                        });
                      }}
                    />
                  );
                })
              ) : (
                <View
                  className={`rounded-[24px] p-8 items-center justify-center border border-dashed mt-2 ${
                    isDark
                      ? "bg-slate-800/40 border-slate-700"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <Ionicons name="search-outline" size={48} color="#94A3B8" />
                  <Text
                    className={`font-bold text-base mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Không tìm thấy chuyến du lịch phù hợp
                  </Text>
                  <Text className="text-slate-400 text-base text-center mt-1">
                    Vui lòng thử lại bằng một từ khóa khác.
                  </Text>
                </View>
              )}
            </View>

            {/* TIN TỨC NỔI BẬT */}
            <View className="mt-4">
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
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}
