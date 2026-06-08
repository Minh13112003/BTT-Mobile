import Header from "@/components/Header";
import { useTheme } from "@/context/Theme_Context";
import { getTours, TourItem } from "@/services/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LIMIT = 5;

// Nút "Đặt ngay" có hiệu ứng animated đẹp
function BookButton({
  onPress,
  isDark,
}: {
  onPress: () => void;
  isDark: boolean;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
    onPress();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: glowOpacity,
        }}
      >
        <LinearGradient
          colors={
            isDark
              ? (["#475569", "#334155"] as const)
              : (["#FF3B30", "#E51F27"] as const)
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 14,
            paddingHorizontal: 18,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            shadowColor: isDark ? "#000" : "#E51F27",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="flash" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "800",
              fontSize: 12,
              letterSpacing: 0.3,
            }}
          >
            Đặt ngay
          </Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [tours, setTours] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gradientColors = isDark
    ? (["#1E222B", "#111318"] as const)
    : (["#E0F2FE", "#F1F5F9"] as const);

  const fetchTours = async (pageNumber = 1, isLoadMore = false) => {
    try {
      const res = await getTours(pageNumber, LIMIT);
      if (res?.data) {
        const items = Array.isArray(res.data.items) ? res.data.items : [];
        const meta = res.data.meta;
        setTours((prev) => (isLoadMore ? [...prev, ...items] : items));
        setHasNext(meta?.hasNext ?? false);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách tour:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTours(1);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchTours(1);
  };

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    setPage(nextPage);
    await fetchTours(nextPage, true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const filteredTours = Array.isArray(tours)
    ? tours.filter((tour) =>
        tour.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderTourItem = ({ item }: { item: TourItem }) => (
    <View
      style={{
        borderRadius: 24,
        marginBottom: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: isDark ? "rgba(71,85,105,0.5)" : "#F1F5F9",
        backgroundColor: isDark ? "rgba(30,34,43,0.95)" : "#FFFFFF",
        shadowColor: isDark ? "#000" : "#94A3B8",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {/* Tour Image */}
      <View style={{ height: 180, width: "100%", backgroundColor: "#0F172A" }}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.45)"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
          }}
        />

        {/* Rating badge */}
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.95)",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              marginLeft: 4,
              color: isDark ? "#F1F5F9" : "#1E293B",
            }}
          >
            {item.rating}
          </Text>
        </View>

        {/* Duration badge */}
        <View
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            backgroundColor: isDark ? "rgba(71,85,105,0.95)" : "rgba(229,31,39,0.92)",
            borderRadius: 10,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 10,
              fontWeight: "800",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {item.duration}
          </Text>
        </View>

        {/* VAT badge */}
        {item.hasVat && (
          <View
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              backgroundColor: isDark ? "rgba(71,85,105,0.9)" : "rgba(239,246,255,0.95)",
              borderRadius: 8,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderWidth: 1,
              borderColor: isDark ? "#475569" : "#BFDBFE",
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                textTransform: "uppercase",
                color: isDark ? "#94A3B8" : "#3B82F6",
              }}
            >
              Đã VAT
            </Text>
          </View>
        )}
      </View>

      {/* Tour Info */}
      <View style={{ padding: 16 }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "800",
            lineHeight: 20,
            color: isDark ? "#F1F5F9" : "#1E293B",
          }}
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Reviews */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <Ionicons
            name="people-outline"
            size={12}
            color={isDark ? "#64748B" : "#94A3B8"}
          />
          <Text
            style={{
              fontSize: 11,
              color: isDark ? "#64748B" : "#94A3B8",
              marginLeft: 4,
              fontWeight: "600",
            }}
          >
            {item.reviewsCount} đánh giá
          </Text>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            marginTop: 12,
            marginBottom: 12,
            backgroundColor: isDark ? "rgba(71,85,105,0.4)" : "#F1F5F9",
          }}
        />

        {/* Price & Book button */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "700",
                color: "#94A3B8",
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Giá trọn gói
            </Text>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "900",
                marginTop: 2,
                color: isDark ? "#F1F5F9" : "#E51F27",
              }}
            >
              {formatCurrency(item.price)}
            </Text>
          </View>

          <BookButton
            isDark={isDark}
            onPress={() => {
              router.push({
                pathname: "/(root)/checkout",
                params: {
                  id: item.id,
                  name: item.name,
                  imageUrl: item.imageUrl,
                  price: item.price.toString(),
                  duration: item.duration,
                  rating: item.rating.toString(),
                  reviewsCount: item.reviewsCount.toString(),
                  hasVat: item.hasVat ? "true" : "false",
                },
              });
            }}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111318" : "#F1F5F9" }}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#E51F27"}
      />

      <Header title="BENTHANH TOURIST" showActions={true} />

      <LinearGradient colors={gradientColors} style={{ flex: 1 }}>
        {loading && !refreshing ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator
              size="large"
              color={isDark ? "#94A3B8" : "#E51F27"}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                marginTop: 8,
                color: isDark ? "#64748B" : "#94A3B8",
              }}
            >
              Đang tải danh sách tour...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredTours}
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
            ListHeaderComponent={
              <View style={{ marginBottom: 20 }}>
                {/* Tiêu đề */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    color: isDark ? "#64748B" : "#94A3B8",
                    marginBottom: 4,
                    paddingLeft: 2,
                  }}
                >
                  Khám phá
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "900",
                      color: isDark ? "#F1F5F9" : "#1E293B",
                      letterSpacing: -0.3,
                    }}
                  >
                    Tour du lịch
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: "#94A3B8",
                    }}
                  >
                    {filteredTours.length} tour
                  </Text>
                </View>

                {/* Search bar */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 18,
                    borderWidth: 2,
                    paddingHorizontal: 16,
                    height: 52,
                    backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
                    borderColor: isDark ? "rgba(71,85,105,0.6)" : "#F1F5F9",
                  }}
                >
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={isDark ? "#6B7280" : "#94A3B8"}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      height: "100%",
                      marginLeft: 12,
                      fontWeight: "600",
                      fontSize: 14,
                      color: isDark ? "#F1F5F9" : "#1E293B",
                    }}
                    placeholder="Tìm kiếm tour du lịch..."
                    placeholderTextColor={isDark ? "#6B7280" : "#94A3B8"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
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
            }
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 16, alignItems: "center" }}>
                  <ActivityIndicator
                    size="small"
                    color={isDark ? "#94A3B8" : "#E51F27"}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: "#94A3B8",
                      marginTop: 6,
                      fontWeight: "600",
                    }}
                  >
                    Đang tải thêm...
                  </Text>
                </View>
              ) : hasNext ? null : (
                tours.length > 0 ? (
                  <View style={{ alignItems: "center", paddingVertical: 12 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#94A3B8",
                        fontWeight: "600",
                      }}
                    >
                      ✓ Đã hiển thị tất cả tour
                    </Text>
                  </View>
                ) : null
              )
            }
            ListEmptyComponent={
              <View
                style={{
                  borderRadius: 24,
                  padding: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderStyle: "dashed",
                  marginTop: 8,
                  backgroundColor: isDark ? "rgba(30,34,43,0.4)" : "#FFFFFF",
                  borderColor: isDark ? "#334155" : "#E2E8F0",
                }}
              >
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: isDark ? "#1E222B" : "#F8FAFC",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  <Ionicons name="search-outline" size={28} color="#94A3B8" />
                </View>
                <Text
                  style={{
                    fontWeight: "800",
                    fontSize: 14,
                    textAlign: "center",
                    color: isDark ? "#CBD5E1" : "#64748B",
                  }}
                >
                  {searchQuery
                    ? "Không tìm thấy tour phù hợp"
                    : "Chưa có tour nào"}
                </Text>
                <Text
                  style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    textAlign: "center",
                    marginTop: 6,
                    lineHeight: 18,
                  }}
                >
                  {searchQuery
                    ? "Vui lòng thử từ khóa khác."
                    : "Danh sách tour sẽ hiển thị tại đây."}
                </Text>
              </View>
            }
            renderItem={renderTourItem}
          />
        )}
      </LinearGradient>
    </View>
  );
}
