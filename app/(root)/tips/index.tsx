import { Footer } from "@/components/Footer";
import { getPalette } from "@/constants/theme";
import { useTheme } from "@/context/Theme_Context";
import { getTipDestinations, getTips, TIPS_DESTINATIONS, TravelTip } from "@/services/tips";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
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

function DestChip({
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

function TipCard({
  item,
  isDark,
  onPress,
  onSearchTours,
}: {
  item: TravelTip;
  isDark: boolean;
  onPress: () => void;
  onSearchTours: () => void;
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
        style={{ width: "100%", height: 160 }}
        resizeMode="cover"
      />
      {/* Destination badge over image */}
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 99,
          backgroundColor: "rgba(208,2,27,0.9)",
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#FFFFFF" }}>
          📍 {item.destination}
        </Text>
      </View>

      <View style={{ padding: 14 }}>
        <Text
          textBreakStrategy="simple"

          allowFontScaling={false}
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: isDark ? "#F1F5F9" : "#1E293B",
            lineHeight: 23,
            marginBottom: 6,
          }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          textBreakStrategy="simple"

          allowFontScaling={false}
          style={{
            fontSize: 14,
            color: isDark ? "#94A3B8" : "#64748B",
            lineHeight: 21,
            marginBottom: 12,
          }}
          numberOfLines={2}
        >
          {item.excerpt}
        </Text>

        {/* Tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 6 }}
        >
          {item.tags.map((tag) => (
            <View
              key={tag}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 6,
                backgroundColor: isDark ? "#1F2937" : "#F1F5F9",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isDark ? "#94A3B8" : "#64748B",
                }}
              >
                #{tag}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* See tours button */}
          {!!item.relatedSearchQuery && (
            <TouchableOpacity
              onPress={onSearchTours}
              activeOpacity={0.8}
              style={{
                flex: 1,
                paddingVertical: 9,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: "#D0021B",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#D0021B" }}>
                🗺️ Tour {item.destination}
              </Text>
            </TouchableOpacity>
          )}

          {/* Read tip button */}
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: 10,
              backgroundColor: "#D0021B",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
              Đọc tiếp →
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function TipsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [tips, setTips] = useState<TravelTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [destination, setDestination] = useState("Tất cả");
  const [destinations, setDestinations] = useState<string[]>(TIPS_DESTINATIONS);

  useEffect(() => {
    getTipDestinations().then(setDestinations).catch(() => {});
  }, []);

  const load = async (dest: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getTips(dest === "Tất cả" ? undefined : dest);
      setTips(Array.isArray(res.data) ? res.data : []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    load(destination);
  }, [destination]);

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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 18,
                fontWeight: "800",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Mẹo du lịch
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 1 }}>
              Kinh nghiệm đi tour từ chuyên gia
            </Text>
          </View>
        </View>
      </View>

      {/* Destination filter */}
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
          {destinations.map((d) => (
            <DestChip
              key={d}
              label={d}
              active={destination === d}
              onPress={() => setDestination(d)}
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
              Đang tải mẹo du lịch...
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={tips}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
            scrollEventThrottle={16}
            onScroll={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              setShowBackToTop(offsetY > 300);
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load(destination, true);
                }}
                tintColor={palette.spinner}
              />
            }
            renderItem={({ item }) => (
              <TipCard
                item={item}
                isDark={isDark}
                onPress={() =>
                  router.push({
                    pathname: "/(root)/tips/[id]" as any,
                    params: { id: item.id },
                  })
                }
                onSearchTours={() =>
                  router.push({
                    pathname: "/(root)/(tabs)/search" as any,
                    params: { q: item.relatedSearchQuery ?? item.destination, referrer: "tip" },
                  })
                }
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 60 }}>
                <Text style={{ fontSize: 40 }}>💡</Text>
                <Text
                  style={{
                    marginTop: 12,
                    fontSize: 16,
                    fontWeight: "700",
                    color: isDark ? "#94A3B8" : "#64748B",
                  }}
                >
                  Chưa có mẹo cho điểm đến này
                </Text>
              </View>
            }
            ListFooterComponent={tips.length > 0 ? <Footer /> : null}
          />
        )}
      </LinearGradient>

      {/* Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
