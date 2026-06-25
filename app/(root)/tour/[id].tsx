import { BookingBar } from "@/components/tour/BookingBar";
import { DeparturePicker } from "@/components/tour/DeparturePicker";
import { HighlightChips } from "@/components/tour/HighlightChips";
import { TermsAccordion } from "@/components/tour/TermsAccordion";
import { TourHero } from "@/components/tour/TourHero";
import { TourScheduleAccordion } from "@/components/tour/TourScheduleAccordion";
import { TripInfoCard } from "@/components/tour/TripInfoCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { getPalette } from "@/constants/theme";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/Theme_Context";
import { useTourDetail } from "@/hooks/useTourDetail";
import { Departure } from "@/services/departure";
import { TourItem } from "@/services/tour";
import { getNearestDeparture } from "@/utils/tour";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePinchToZoom } from "@/hooks/usePinchToZoom";

export default function TourDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    imageUrl?: string;
    price?: string;
    duration?: string;
    rating?: string;
    reviewsCount?: string;
    hasVat?: string;
    searchDateMode?: string;
    searchSpecificDate?: string;
    searchStartDate?: string;
    searchEndDate?: string;
  }>();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = getPalette(isDark);
  const insets = useSafeAreaInsets();

  const id = params.id;

  // Basic fields passed from the list let the screen render even if the
  // detail endpoint is slow or unavailable.
  const fallback: TourItem | null = useMemo(() => {
    if (!params.name) return null;
    return {
      id: id ?? "",
      name: params.name,
      imageUrl: params.imageUrl ?? "",
      imagePublicId: "",
      price: params.price ? parseFloat(params.price) : 0,
      duration: params.duration ?? "",
      rating: params.rating ? parseFloat(params.rating) : 0,
      reviewsCount: params.reviewsCount ? parseInt(params.reviewsCount, 10) : 0,
      hasVat: params.hasVat === "true",
    };
  }, [
    id,
    params.name,
    params.imageUrl,
    params.price,
    params.duration,
    params.rating,
    params.reviewsCount,
    params.hasVat,
  ]);

  const { tour, loading, error, refetch } = useTourDetail(id, fallback);

  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const { scale: imageScale, setScale: setImageScale, panHandlers: imagePanHandlers } = usePinchToZoom(1, 1, 4.0);

  const handleCloseModal = () => {
    setZoomImageUrl(null);
    setImageScale(1);
  };

  const [selectedDeparture, setSelectedDeparture] = useState<Departure | null>(
    null,
  );

  useEffect(() => {
    if (tour && tour.departures && tour.departures.length > 0) {
      const searchDateMode = params.searchDateMode;
      const searchSpecificDate = params.searchSpecificDate;
      const searchStartDate = params.searchStartDate;
      const searchEndDate = params.searchEndDate;

      let matched: Departure | undefined;

      if (searchDateMode === "specific" && searchSpecificDate) {
        const target = new Date(searchSpecificDate);
        matched = tour.departures.find((dep) => {
          const depDate = new Date(dep.departureDate);
          return (
            depDate.getFullYear() === target.getFullYear() &&
            depDate.getMonth() === target.getMonth() &&
            depDate.getDate() === target.getDate()
          );
        });
      } else if (searchDateMode === "range" && (searchStartDate || searchEndDate)) {
        const start = searchStartDate ? new Date(searchStartDate) : new Date(0);
        const end = searchEndDate ? new Date(searchEndDate) : new Date(8640000000000000);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        const sortedDepartures = [...tour.departures].sort(
          (a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()
        );
        matched = sortedDepartures.find((dep) => {
          const depDate = new Date(dep.departureDate);
          return depDate >= start && depDate <= end;
        });
      }

      if (matched) {
        setSelectedDeparture(matched);
      }
    }
  }, [tour, params.searchDateMode, params.searchSpecificDate, params.searchStartDate, params.searchEndDate]);

  const goCheckout = () => {
    if (!tour) return;
    if (!selectedDeparture) {
      Alert.alert("Thông báo", "Vui lòng chọn ngày khởi hành");
      return;
    }
    router.push({
      pathname: "/(root)/checkout",
      params: {
        id: tour.id,
        name: tour.name,
        imageUrl: tour.imageUrl,
        tourCode: tour.code ?? "",
        price: String(selectedDeparture.price),
        duration: tour.duration,
        rating: String(tour.rating),
        reviewsCount: String(tour.reviewsCount),
        hasVat: tour.hasVat ? "true" : "false",
        departureId: selectedDeparture.id,
        departureDate: selectedDeparture.departureDate,
        availableSeats: String(selectedDeparture.availableSeats),
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: insets.top + 6,
            left: 14,
            zIndex: 10,
          }}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isDark ? "bg-slate-800" : "bg-white"
          }`}
        >
          <Ionicons name="chevron-back" size={20} color={palette.icon} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={palette.spinner} />
          <Text
            className={`font-semibold mt-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            style={{ fontSize: FONT_SIZE.xs }}
          >
            Đang tải chi tiết tour...
          </Text>
        </View>
      </View>
    );
  }

  if (error || !tour) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <View
          className="flex-1 items-center justify-center px-8"
          style={{ paddingTop: insets.top }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? "#EF4444" : "#DC2626"}
          />
          <Text
            className={`font-bold mt-4 text-center ${isDark ? "text-slate-200" : "text-slate-800"}`}
            style={{ fontSize: FONT_SIZE.xs }}
          >
            {error || "Không tìm thấy thông tin tour"}
          </Text>
          <View className="flex-row mt-6 gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className={`px-6 py-2.5 rounded-full border ${
                isDark ? "border-slate-700" : "border-slate-300"
              }`}
            >
              <Text
                className={`font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}
                style={{ fontSize: FONT_SIZE.xs }}
              >
                Quay lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={refetch}
              className="px-6 py-2.5 rounded-full bg-[#D0021B]"
            >
              <Text className="text-white font-bold" style={{ fontSize: FONT_SIZE.xs }}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.screenBg }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowBackToTop(offsetY > 300);
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <TourHero
          tour={tour}
          onBack={() => router.back()}
          onPressImage={() => setZoomImageUrl(tour.imageUrl)}
        />

        <View className="px-4 -mt-2">
          <Text
            className={`font-black leading-8 ${isDark ? "text-slate-50" : "text-slate-900"}`}
            style={{ fontSize: FONT_SIZE.xl }}
          >
            {tour.name}
          </Text>

          <View className="flex-row items-center mt-2">
            {tour.code ? (
              <>
                <Text className="text-slate-400" style={{ fontSize: FONT_SIZE.xs }}>
                  Mã: {tour.code}
                </Text>
                <View className="w-1 h-1 rounded-full bg-slate-400 mx-2" />
              </>
            ) : null}
            <Text className="text-slate-400" style={{ fontSize: FONT_SIZE.xs }}>
              {tour.hasVat ? "Đã gồm VAT" : "Chưa gồm VAT"}
            </Text>
          </View>

          <HighlightChips items={tour.highlights} />

          <DeparturePicker
            tourId={tour.id}
            tourName={tour.name}
            selected={selectedDeparture}
            onSelect={setSelectedDeparture}
          />

          <TripInfoCard tour={tour} />

          {tour.schedules?.length ? (
            <TourScheduleAccordion schedules={tour.schedules} />
          ) : null}

          <View className="mt-5">
            <SectionTitle title="Điều khoản & Lưu ý chung" />
            <TermsAccordion />
          </View>
        </View>
      </ScrollView>

      <BookingBar
        price={
          selectedDeparture?.price ??
          getNearestDeparture(tour.departures ?? [])?.price
        }
        onPress={goCheckout}
      />

      {/* Image Zoom Modal */}
      <Modal
        visible={zoomImageUrl !== null}
        transparent={true}
        onRequestClose={handleCloseModal}
        animationType="fade"
      >
        <View
          {...imagePanHandlers}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.95)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            onPress={handleCloseModal}
            style={{
              position: "absolute",
              top: insets.top + 10,
              right: 20,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Full Screen Image */}
          {zoomImageUrl && (
            <Image
              source={{ uri: zoomImageUrl }}
              style={{
                width: "100%",
                height: "85%",
                transform: [{ scale: imageScale }],
              }}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      {/* Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={{
            position: "absolute",
            bottom: 80,
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
