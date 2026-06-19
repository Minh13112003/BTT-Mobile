import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { getNewsById, NewsItem } from "@/services/news";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const CATEGORY_LABEL: Record<string, string> = {
  company: "Công ty",
  promotion: "Khuyến mãi",
  destination: "Điểm đến",
  other: "Khác",
};

export default function NewsDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getNewsById(id)
      .then((res) => setItem(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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
              fontSize: 16,
              fontWeight: "700",
              flex: 1,
            }}
            numberOfLines={1}
          >
            {item?.title ?? "Chi tiết tin tức"}
          </Text>
        </View>
      </View>

      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={palette.spinner} />
          </View>
        ) : !item ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 40 }}>😕</Text>
            <Text
              style={{
                marginTop: 12,
                fontSize: 16,
                fontWeight: "700",
                color: isDark ? "#94A3B8" : "#64748B",
              }}
            >
              Không tìm thấy bài viết
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* Cover image */}
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: "100%", height: 220 }}
              resizeMode="cover"
            />

            <View style={{ padding: 20 }}>
              {/* Category badge + date */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 99,
                    backgroundColor: isDark ? "#2D1B1B" : "#FFF1F2",
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#D0021B" }}>
                    {CATEGORY_LABEL[item.category] ?? "Tin tức"}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: "#94A3B8", fontWeight: "600" }}>
                  📅 {item.date}
                </Text>
              </View>

              {/* Title */}
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: isDark ? "#F1F5F9" : "#1E293B",
                  lineHeight: 28,
                  marginBottom: 14,
                }}
              >
                {item.title}
              </Text>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? "#2D3748" : "#E5E8F3",
                  marginBottom: 16,
                }}
              />

              {/* Content */}
              <Text
                style={{
                  fontSize: 15,
                  color: isDark ? "#CBD5E1" : "#374151",
                  lineHeight: 24,
                }}
              >
                {item.content ?? item.excerpt}
              </Text>
            </View>
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
}
