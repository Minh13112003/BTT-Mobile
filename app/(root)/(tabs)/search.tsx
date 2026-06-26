import { Footer } from "@/components/Footer";
import Header from "@/components/Header";
import { FONT_SIZE } from "@/constants/typography";
import { SearchBar } from "@/components/SearchBar";
import { SectionHeader } from "@/components/tour/SectionHeader";
import { TourCard } from "@/components/tour/TourCard";
import { getPalette } from "@/constants/theme";
import {
  MODE_CHIP_LABELS,
  SECTION_ORDER,
  SearchMode,
  regionsForMode,
} from "@/constants/tourFilters";
import { useScrollVisibility } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import { useTourSearch } from "@/hooks/useTourSearch";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
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
  style,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
  style?: any;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        active
          ? "bg-[#D0021B] border-[#D0021B]"
          : isDark
            ? "bg-[#1E222B] border-slate-700/60"
            : "bg-white border-slate-200"
      }`}
      style={[{ marginRight: 6, marginBottom: 8 }, style]}
    >
      <Text
        className={`font-bold ${
          active ? "text-white" : isDark ? "text-slate-300" : "text-slate-600"
        }`}
        style={{ fontSize: FONT_SIZE.xs }}
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
  const params = useLocalSearchParams<{
    mode?: string;
    q?: string;
    dateMode?: string;
    specificDate?: string;
    startDate?: string;
    endDate?: string;
    referrer?: string;
  }>();
  const initialMode = (SECTION_ORDER as string[]).includes(params.mode ?? "")
    ? (params.mode as SearchMode)
    : "newest";

  const flatListRef = useRef<any>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

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
    resetSearch,
  } = useTourSearch({
    mode: initialMode,
    query: params.q ?? "",
    dateMode: params.dateMode,
    specificDate: params.specificDate,
    startDate: params.startDate,
    endDate: params.endDate,
  });

  // ── Collapsing header, driven on the native (UI) thread ──────────────────
  // The chrome (brand bar + search controls) is absolutely positioned and slides
  // up via `translateY` tied directly to scroll with `Animated.diffClamp`. Because
  // it animates `transform` (not `height`), it can use the native driver — so the
  // collapse stays smooth even while the list is flinging. The list is padded by
  // the measured chrome height so nothing is hidden and no gap is left behind.
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOffset = useRef(new Animated.Value(0)).current;
  const [chromeH, setChromeH] = useState(0);
  const clamp = chromeH > 0 ? chromeH : 1;

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
        setShowBackToTop(y > 300);
        if (y <= 8) {
          setHidden(false);
          Animated.timing(headerOffset, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else if (dy > 8) {
          setHidden(true);
          Animated.timing(headerOffset, {
            toValue: -clamp,
            duration: 150,
            useNativeDriver: true,
          }).start();
        } else if (dy < -8) {
          setHidden(false);
          Animated.timing(headerOffset, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        }
      },
    },
  );

  const headerTranslateY = headerOffset;

  // Reset to a clean, fully-visible state whenever the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      scrollY.setValue(0);
      headerOffset.setValue(0);
      lastY.current = 0;
      setHidden(false);
      return () => setHidden(false);
    }, [scrollY, headerOffset, setHidden]),
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
    let matchingDeparture = null;
    if (params.dateMode === "specific" && params.specificDate) {
      const target = new Date(params.specificDate);
      matchingDeparture = tour.departures?.find((dep) => {
        const depDate = new Date(dep.departureDate);
        return (
          depDate.getFullYear() === target.getFullYear() &&
          depDate.getMonth() === target.getMonth() &&
          depDate.getDate() === target.getDate()
        );
      });
    } else if (
      params.dateMode === "range" &&
      (params.startDate || params.endDate)
    ) {
      const start = params.startDate ? new Date(params.startDate) : new Date(0);
      const end = params.endDate
        ? new Date(params.endDate)
        : new Date(8640000000000000);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      matchingDeparture = tour.departures?.find((dep) => {
        const depDate = new Date(dep.departureDate);
        return depDate >= start && depDate <= end;
      });
    }

    const nearest =
      matchingDeparture || getNearestDeparture(tour.departures ?? []);
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
        searchDateMode: params.dateMode ?? "",
        searchSpecificDate: params.specificDate ?? "",
        searchStartDate: params.startDate ?? "",
        searchEndDate: params.endDate ?? "",
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar
        style="light"
        backgroundColor={isDark ? "#1E222B" : "#D0021B"}
      />

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
              style={{ fontSize: FONT_SIZE.xs }}
            >
              Đang tải danh sách tour...
            </Text>
          </View>
        ) : (
          <Animated.FlatList
            ref={flatListRef}
            data={results}
            keyExtractor={(item: TourItem) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: chromeH + 12,
              paddingBottom: 24,
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
              <TourCard
                tour={item}
                onPress={() => openDetail(item)}
                dateMode={params.dateMode}
                specificDate={params.specificDate}
                startDate={params.startDate}
                endDate={params.endDate}
              />
            )}
            ListFooterComponent={
              <>
                {loadingMore ? (
                  <View className="py-4 items-center">
                    <ActivityIndicator size="small" color={palette.spinner} />
                  </View>
                ) : !hasNext && results.length > 0 ? (
                  <View className="py-3 items-center">
                    <Text
                      className="font-semibold text-slate-400"
                      style={{ fontSize: FONT_SIZE.xs }}
                    >
                      ✓ Đã hiển thị tất cả tour
                    </Text>
                  </View>
                ) : null}
                <Footer />
              </>
            }
            ListEmptyComponent={
              <View
                className={`rounded-3xl p-9 items-center border border-dashed mt-2 ${
                  isDark
                    ? "bg-[#1E222B]/40 border-slate-700"
                    : "bg-white border-slate-200"
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
                <Text
                  className="text-slate-400 text-center mt-1.5 mb-5"
                  style={{ fontSize: FONT_SIZE.xs }}
                >
                  Thử thay đổi từ khoá hoặc bộ lọc.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    resetSearch();
                    router.setParams({
                      q: "",
                      mode: "newest",
                      dateMode: "",
                      specificDate: "",
                      startDate: "",
                      endDate: "",
                      referrer: "",
                    });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#D0021B]"
                >
                  <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>
                    Quay lại ban đầu
                  </Text>
                </TouchableOpacity>
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
        <Header
          title="BENTHANH TOURIST"
          showActions={true}
          safeArea={false}
          showBackButton={!!params.referrer}
          onBackPress={() => {
            resetSearch();
            router.setParams({
              q: "",
              mode: "newest",
              dateMode: "",
              specificDate: "",
              startDate: "",
              endDate: "",
              referrer: "",
            });
            router.back();
          }}
        />

        <View className="px-5 pt-4 pb-1">
          <View className="flex-row items-center justify-between mb-3">
            <SectionHeader title="Tìm kiếm tour" />
            <Text
              className="font-semibold text-slate-400"
              style={{ fontSize: FONT_SIZE.xs }}
            >
              {meta?.total ?? results.length} kết quả
            </Text>
          </View>

          <SearchBar value={query} onChangeText={setQuery} />

          {/* Mode chips - 2 hàng cuộn ngang, mỗi hàng 5 tabs */}
          <View style={{ marginTop: 12 }}>
            {/* Hàng 1: 5 tab đầu */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {SECTION_ORDER.slice(0, 5).map((m) => (
                <Chip
                  key={m}
                  label={MODE_CHIP_LABELS[m]}
                  active={mode === m && !query.trim()}
                  onPress={() => setMode(m)}
                  isDark={isDark}
                  style={{ marginBottom: 0 }}
                />
              ))}
            </ScrollView>

            {/* Hàng 2: 5 tab tiếp theo */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 8 }}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {SECTION_ORDER.slice(5, 10).map((m) => (
                <Chip
                  key={m}
                  label={MODE_CHIP_LABELS[m]}
                  active={mode === m && !query.trim()}
                  onPress={() => setMode(m)}
                  isDark={isDark}
                  style={{ marginBottom: 0 }}
                />
              ))}
            </ScrollView>
          </View>

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
