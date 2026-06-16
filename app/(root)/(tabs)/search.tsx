import Header from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/tour/SectionHeader";
import { TourCard } from "@/components/tour/TourCard";
import {
  MODE_CHIP_LABELS,
  SECTION_ORDER,
  SearchMode,
  regionsForMode,
} from "@/constants/tourFilters";
import { getPalette } from "@/constants/theme";
import { useScrollVisibility } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { useTourSearch } from "@/hooks/useTourSearch";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Pill chip used for both the mode bar and the region sub-filter. */
function Chip({
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
      className={`px-4 py-2 rounded-full border mr-2 ${
        active
          ? "bg-[#D0021B] border-[#D0021B]"
          : isDark
            ? "bg-[#1E222B] border-slate-700/60"
            : "bg-white border-slate-200"
      }`}
    >
      <Text
        className={`font-bold ${
          active ? "text-white" : isDark ? "text-slate-300" : "text-slate-600"
        }`}
        style={{ fontSize: 16 }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();
  const { setHidden } = useScrollVisibility();

  // Pre-filter from the Home "Xem tất cả" buttons / search box.
  const params = useLocalSearchParams<{ mode?: string; q?: string }>();
  const initialMode = (
    SECTION_ORDER as string[]
  ).includes(params.mode ?? "")
    ? (params.mode as SearchMode)
    : "newest";

  const {
    mode,
    setMode,
    region,
    setRegion,
    query,
    setQuery,
    results,
    meta,
    hasNext,
    loading,
    loadingMore,
    refreshing,
    onRefresh,
    loadMore,
  } = useTourSearch({ mode: initialMode, query: params.q ?? "" });

  // ── Collapsing header, driven on the native (UI) thread ──────────────────
  // The chrome (brand bar + search controls) is absolutely positioned and slides
  // up via `translateY` tied directly to scroll with `Animated.diffClamp`. Because
  // it animates `transform` (not `height`), it can use the native driver — so the
  // collapse stays smooth even while the list is flinging. The list is padded by
  // the measured chrome height so nothing is hidden and no gap is left behind.
  const scrollY = useRef(new Animated.Value(0)).current;
  const [chromeH, setChromeH] = useState(0);
  const clamp = chromeH > 0 ? chromeH : 1;
  const headerTranslateY = Animated.diffClamp(scrollY, 0, clamp).interpolate({
    inputRange: [0, clamp],
    outputRange: [0, -clamp],
    extrapolate: "clamp",
  });

  // Tab-bar dim still follows scroll direction (opacity only — no layout work).
  const lastY = useRef(0);
  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        lastY.current = y;
        if (y <= 8) setHidden(false);
        else if (dy > 8) setHidden(true);
        else if (dy < -8) setHidden(false);
      },
    },
  );

  // Reset to a clean, fully-visible state whenever the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      scrollY.setValue(0);
      lastY.current = 0;
      setHidden(false);
      return () => setHidden(false);
    }, [scrollY, setHidden]),
  );

  // SubFilterBar slide-down (height 0 -> 56). Only runs on mode change (never on
  // scroll), so keeping it JS-driven here is harmless.
  const regions = regionsForMode(mode);
  const subVisible = !!regions && !query.trim();
  const subHeight = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(subHeight, {
      toValue: subVisible ? 56 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [subVisible, subHeight]);

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

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style="light" backgroundColor={isDark ? "#1E222B" : "#D0021B"} />

      {/* Persistent safe-area backdrop so the status bar always has a brand backdrop */}
      <View
        style={{
          height: insets.top,
          backgroundColor: isDark ? "#1E222B" : "#D0021B",
          zIndex: 20,
        }}
      />

      {/* List underneath — padded so its content begins below the floating chrome */}
      <LinearGradient colors={palette.gradient} style={{ flex: 1 }}>
        {loading ? (
          <View
            className="flex-1 items-center justify-center"
            style={{ paddingTop: chromeH }}
          >
            <ActivityIndicator size="large" color={palette.spinner} />
            <Text
              className={`mt-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
              style={{ fontSize: 16 }}
            >
              Đang tải danh sách tour...
            </Text>
          </View>
        ) : (
          <Animated.FlatList
            data={results}
            keyExtractor={(item: TourItem) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: chromeH + 12,
              paddingBottom: 100,
            }}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={16}
            removeClippedSubviews
            initialNumToRender={6}
            maxToRenderPerBatch={8}
            windowSize={9}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={palette.spinner}
                progressViewOffset={chromeH}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            renderItem={({ item }: { item: TourItem }) => (
              <TourCard tour={item} onPress={() => openDetail(item)} />
            )}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color={palette.spinner} />
                </View>
              ) : !hasNext && results.length > 0 ? (
                <View className="py-3 items-center">
                  <Text className="font-semibold text-slate-400" style={{ fontSize: 16 }}>
                    ✓ Đã hiển thị tất cả tour
                  </Text>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View
                className={`rounded-3xl p-9 items-center border border-dashed mt-2 ${
                  isDark ? "bg-[#1E222B]/40 border-slate-700" : "bg-white border-slate-200"
                }`}
              >
                <Text style={{ fontSize: 40 }}>🔍</Text>
                <Text
                  className={`font-bold mt-3 text-center ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                  style={{ fontSize: 18 }}
                >
                  Không tìm thấy tour
                </Text>
                <Text className="text-slate-400 text-center mt-1.5" style={{ fontSize: 16 }}>
                  Thử thay đổi từ khoá hoặc bộ lọc.
                </Text>
              </View>
            }
          />
        )}
      </LinearGradient>

      {/* Floating, collapsing chrome (brand bar + search controls) */}
      <Animated.View
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          if (h && Math.abs(h - chromeH) > 1) setChromeH(h);
        }}
        style={{
          position: "absolute",
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 10,
          transform: [{ translateY: headerTranslateY }],
          backgroundColor: palette.gradient[0],
        }}
      >
        <Header title="BENTHANH TOURIST" showActions={true} safeArea={false} />

        <View className="px-5 pt-4 pb-1">
          <View className="flex-row items-center justify-between mb-3">
            <SectionHeader title="Tìm kiếm tour" />
            <Text className="font-semibold text-slate-400" style={{ fontSize: 16 }}>
              {meta?.total ?? results.length} kết quả
            </Text>
          </View>

          <SearchBar value={query} onChangeText={setQuery} />

          {/* Mode chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingRight: 12 }}
          >
            {SECTION_ORDER.map((m) => (
              <Chip
                key={m}
                label={MODE_CHIP_LABELS[m]}
                active={mode === m && !query.trim()}
                onPress={() => setMode(m)}
                isDark={isDark}
              />
            ))}
          </ScrollView>

          {/* Region sub-filter (slides down for domestic / foreign) */}
          <Animated.View style={{ height: subHeight, overflow: "hidden" }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ paddingRight: 12 }}
            >
              <Chip
                label="Tất cả"
                active={region === null}
                onPress={() => setRegion(null)}
                isDark={isDark}
              />
              {(regions ?? []).map((r) => (
                <Chip
                  key={r}
                  label={r}
                  active={region === r}
                  onPress={() => setRegion(r)}
                  isDark={isDark}
                />
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
