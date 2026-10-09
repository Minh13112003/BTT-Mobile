import { Footer } from "@/components/Footer";
import TabHeader from "@/components/TabHeader";
import { FONT_SIZE } from "@/constants/typography";
import { SearchBar } from "@/components/SearchBar";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { TourCard } from "@/components/tour/TourCard";
import { getPalette, getShadow } from "@/constants/theme";
import {
  MODE_CHIP_LABELS,
  SECTION_ORDER,
  SearchMode,
  regionsForMode,
} from "@/constants/tourFilters";
import { useTheme } from "@/context/Theme_Context";
import { useCollapsibleHeader } from "@/hooks/useCollapsibleHeader";
import { useTourSearch } from "@/hooks/useTourSearch";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SheetKey = "category" | "scope" | "region" | "collection";

const ALL_LABEL = "Tất cả";
const CATEGORY_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  { label: "Đang hot", mode: "hot" },
  { label: "Sắp khởi hành", mode: "upcoming" },
  { label: "Bán chạy", mode: "popular" },
];
const SCOPE_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  { label: "Trong nước", mode: "domestic" },
  { label: "Quốc tế", mode: "foreign" },
];
const COLLECTION_MODES: SearchMode[] = [
  "tour_of_the_year_2026",
  "tour_cao_cap",
  "tour_mice",
  "tour_he",
  "tour_du_lich_xanh",
];
const COLLECTION_OPTS: { label: string; mode: SearchMode }[] = [
  { label: ALL_LABEL, mode: "newest" },
  ...COLLECTION_MODES.map((m) => ({ label: MODE_CHIP_LABELS[m], mode: m })),
];

/** Ô thả xuống: nhãn nhỏ + giá trị đang chọn; bấm để mở danh sách lựa chọn. */
function DropdownTile({
  label,
  value,
  active,
  disabled,
  onPress,
  isDark,
}: {
  label: string;
  value: string;
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      className={`flex-row items-center px-3.5 rounded-2xl border ${
        active
          ? isDark
            ? "bg-red-950/40 border-red-700"
            : "bg-[#FFF1F3] border-[#F3C4CA]"
          : isDark
            ? "bg-[#1E222B] border-slate-700/60"
            : "bg-white border-slate-200"
      } ${disabled ? "opacity-50" : ""}`}
      style={{ height: 56, flex: 1 }}
    >
      <View className="flex-1">
        <Text className={isDark ? "text-slate-400" : "text-slate-500"} style={{ fontSize: FONT_SIZE.xxs }}>
          {label}
        </Text>
        <Text
          numberOfLines={1}
          className={`font-bold ${active ? "text-[#B30118]" : isDark ? "text-slate-100" : "text-[#1A1A2E]"}`}
          style={{ fontSize: FONT_SIZE.xxs }}
        >
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-down" size={16} color={active ? "#B30118" : "#94A3B8"} />
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

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
  const [chromeH, setChromeH] = useState(0);
  const handleScrollY = useCallback((y: number) => setShowBackToTop(y > 300), []);
  const { translateY: headerTranslateY, scrollProps } = useCollapsibleHeader(
    chromeH,
    handleScrollY,
  );

  const regions = regionsForMode(mode);
  const [sheet, setSheet] = useState<SheetKey | null>(null);

  const tileValue = (opts: { label: string; mode: SearchMode }[]) =>
    mode !== "newest" ? opts.find((o) => o.mode === mode)?.label ?? ALL_LABEL : ALL_LABEL;

  const sheetOptions: { label: string; selected: boolean; onPick: () => void }[] =
    sheet === "region"
      ? [
          { label: ALL_LABEL, selected: region === null, onPick: () => setRegion(null) },
          ...(regions ?? []).map((r) => ({ label: r, selected: region === r, onPick: () => setRegion(r) })),
        ]
      : (sheet === "category" ? CATEGORY_OPTS : sheet === "scope" ? SCOPE_OPTS : COLLECTION_OPTS).map((o) => ({
          label: o.label,
          selected: tileValue(sheet === "category" ? CATEGORY_OPTS : sheet === "scope" ? SCOPE_OPTS : COLLECTION_OPTS) === o.label,
          onPick: () => setMode(o.mode),
        }));
  const sheetTitle =
    sheet === "category" ? "Danh mục" : sheet === "scope" ? "Phạm vi" : sheet === "region" ? "Khu vực" : "Bộ sưu tập";

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
        imageUrl: Array.isArray(tour.imageUrl) ? tour.imageUrl[0] : tour.imageUrl,
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
      {/* RN edge-to-edge không còn hỗ trợ StatusBar backgroundColor — màu do backdrop View ngay dưới đây phủ */}
      <StatusBar style="light" />

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
            {...scrollProps}
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
                  className="px-6 py-3.5 rounded-xl bg-[#D0021B]"
                  style={{ minHeight: 44, justifyContent: "center", alignItems: "center" }}
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
        <TabHeader
          safeArea={false}
          title="Du lịch"
          subtitle={`${meta?.total ?? results.length} kết quả`}
          onBack={
            params.referrer
              ? () => {
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
                }
              : undefined
          }
        />

        <View className="px-5 pt-4 pb-1">
          <SearchBar value={query} onChangeText={setQuery} />

          {/* 4 ô thả xuống — mặc định "Tất cả"; chọn ô nào thì các ô còn lại về "Tất cả" */}
          <View style={{ marginTop: 12, gap: 8 }}>
            <View className="flex-row" style={{ gap: 8 }}>
              <DropdownTile
                label="Danh mục"
                value={tileValue(CATEGORY_OPTS)}
                active={tileValue(CATEGORY_OPTS) !== ALL_LABEL}
                onPress={() => setSheet("category")}
                isDark={isDark}
              />
              <DropdownTile
                label="Phạm vi"
                value={tileValue(SCOPE_OPTS)}
                active={tileValue(SCOPE_OPTS) !== ALL_LABEL}
                onPress={() => setSheet("scope")}
                isDark={isDark}
              />
            </View>
            <View className="flex-row" style={{ gap: 8 }}>
              <DropdownTile
                label="Khu vực"
                value={regions ? region ?? ALL_LABEL : "Chọn phạm vi trước"}
                active={!!region}
                disabled={!regions}
                onPress={() => setSheet("region")}
                isDark={isDark}
              />
              <DropdownTile
                label="Bộ sưu tập"
                value={tileValue(COLLECTION_OPTS)}
                active={tileValue(COLLECTION_OPTS) !== ALL_LABEL}
                onPress={() => setSheet("collection")}
                isDark={isDark}
              />
            </View>
          </View>
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
            bottom: 94,
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

      <Modal visible={!!sheet} transparent animationType="fade" onRequestClose={() => setSheet(null)}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setSheet(null)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}
        >
          <View
            className={`rounded-t-[28px] px-5 pt-5 ${isDark ? "bg-[#1A1F2B]" : "bg-white"}`}
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <Text className={`font-black mb-3 ${isDark ? "text-slate-100" : "text-[#1A1A2E]"}`} style={{ fontSize: FONT_SIZE.xs }}>
              {sheetTitle}
            </Text>
            {sheetOptions.map((o) => (
              <TouchableOpacity
                key={o.label}
                activeOpacity={0.8}
                onPress={() => {
                  o.onPick();
                  setSheet(null);
                }}
                className={`flex-row items-center h-14 rounded-2xl px-4 mb-2 ${
                  o.selected ? (isDark ? "bg-red-950/40" : "bg-[#FFF1F3]") : isDark ? "bg-slate-800" : "bg-slate-50"
                }`}
              >
                <Text
                  className={`flex-1 font-semibold ${
                    o.selected ? "text-[#B30118]" : isDark ? "text-slate-100" : "text-[#1A1A2E]"
                  }`}
                  style={{ fontSize: FONT_SIZE.xxs }}
                >
                  {o.label}
                </Text>
                {o.selected && <Ionicons name="checkmark-circle" size={20} color="#D0021B" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <ZaloFloatingButton />
    </View>
  );
}
