import { Footer } from "@/components/Footer";
import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { getNews, NewsItem } from "@/services/news";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORIES = [
  { key: "all", label: "Tất cả" },
  { key: "company", label: "Công ty" },
  { key: "promotion", label: "Khuyến mãi" },
  { key: "destination", label: "Điểm đến" },
] as const;

type CategoryKey = (typeof CATEGORIES)[number]["key"];

function CategoryChip({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 99,
        borderWidth: 1,
        marginRight: 8,
        backgroundColor: active ? "#D0021B" : isDark ? "#1E222B" : "#FFFFFF",
        borderColor: active ? "#D0021B" : isDark ? "#374151" : "#E2E8F0",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: active ? "#FFFFFF" : isDark ? "#CBD5E1" : "#475569",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function NewsCard({
  item,
  isDark,
  onPress,
}: {
  item: NewsItem;
  isDark: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: isDark ? "#1E222B" : "#FFFFFF",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: "100%", height: 180 }}
        resizeMode="cover"
      />
      <View style={{ padding: 14 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: isDark ? "#F1F5F9" : "#1E293B",
            lineHeight: 22,
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        {!!item.excerpt && (
          <Text
            style={{
              fontSize: 14,
              color: isDark ? "#94A3B8" : "#64748B",
              lineHeight: 20,
              marginBottom: 10,
            }}
            numberOfLines={2}
          >
            {item.excerpt}
          </Text>
        )}
        <View
          style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
        >
          <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}>
            📅 {item.date}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "800", color: "#D0021B" }}>
            Xem chi tiết →
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryKey>("all");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getNews();
      setNews(Array.isArray(res.data) ? res.data : []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    category === "all" ? news : news.filter((n) => n.category === category);

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#D0021B"} />

      {/* Header */}
      <View style={{ backgroundColor: isDark ? "#1E222B" : "#D0021B", paddingTop: insets.top }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 13,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "rgba(255,255,255,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 18,
              fontWeight: "800",
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Tin tức
          </Text>
        </View>
      </View>

      {/* Category filter — fixed bar */}
      <View
        style={{
          backgroundColor: isDark ? "#161B25" : "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: isDark ? "#2D3748" : "#E5E8F3",
          paddingVertical: 10,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {CATEGORIES.map((c) => (
            <CategoryChip
              key={c.key}
              label={c.label}
              active={category === c.key}
              onPress={() => setCategory(c.key)}
              isDark={isDark}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={palette.spinner} />
            <Text
              style={{
                marginTop: 10,
                fontSize: 15,
                fontWeight: "600",
                color: isDark ? "#94A3B8" : "#64748B",
              }}
            >
              Đang tải tin tức...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load(true);
                }}
                tintColor={palette.spinner}
              />
            }
            renderItem={({ item }) => (
              <NewsCard
                item={item}
                isDark={isDark}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/news/[id]" as any,
                    params: { id: item.id },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 60 }}>
                <Text style={{ fontSize: 40 }}>📰</Text>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: "700",
                    color: isDark ? "#94A3B8" : "#64748B",
                  }}
                >
                  Chưa có tin tức trong mục này
                </Text>
              </View>
            }
            ListFooterComponent={filtered.length > 0 ? <Footer /> : null}
          />
        )}
      </LinearGradient>
    </View>
  );
}
