import {
  getNextMilestone,
  getTier,
  Tier,
  TIERS,
} from "@/components/MembershipBanner";
import { useAuth } from "@/context/Auth_Context";
import { useTheme } from "@/context/Theme_Context";
import ZaloFloatingButton from "@/components/ZaloFloatingButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Defs,
  Line,
  Path,
  RadialGradient,
  Rect,
  Stop,
  LinearGradient as SvgLinearGradient,
} from "react-native-svg";

const SW = Dimensions.get("window").width;
const CARD_SCALE = (SW - 48) / 600;
const CARD_H = Math.round(440 * CARD_SCALE);
const MEMBERSHIP_CARD_H = 310;

const DISPLAY_NAMES = [
  "Đồng",
  "Bạc",
  "Vàng",
  "Bạch Kim",
  "Kim Cương",
  "Ruby",
] as const;
type TierName = (typeof DISPLAY_NAMES)[number];

// viewabilityConfig must be stable (outside component) to avoid FlatList warnings
const VIEWABILITY_CONFIG = { viewAreaCoveragePercentThreshold: 50 };

const BENEFITS: Record<TierName, string[]> = {
  Đồng: [
    "Tích lũy điểm thưởng từ mỗi chuyến đi",
    "Nhận thông báo ưu đãi sớm nhất",
    "Hỗ trợ đặt tour 24/7 qua app",
    "Xem lịch sử chuyến đi đầy đủ",
    "Nhận quà tặng sinh nhật (voucher 100k)",
  ],
  Bạc: [
    "Tất cả quyền lợi hạng Đồng",
    "Ưu tiên xử lý đặt tour trong 2 giờ",
    "Giảm 3% trên tổng giá tour",
    "Miễn phí đổi ngày khởi hành 1 lần/tour",
    "Quà tặng sinh nhật nâng cao (voucher 300k)",
    "Hỗ trợ HDV riêng khi đoàn ≥ 5 người",
  ],
  Vàng: [
    "Tất cả quyền lợi hạng Bạc",
    "Giảm 5% trên tổng giá tour",
    "Ưu tiên check-in sớm tại khách sạn",
    "Miễn phụ thu phòng đơn 1 lần/năm",
    "Tặng hành lý xách tay thêm 5kg (tour quốc tế)",
    "Chuyên viên tư vấn riêng qua Zalo/Hotline",
    "Quà tặng sinh nhật Premium (voucher 500k)",
  ],
  "Bạch Kim": [
    "Tất cả quyền lợi hạng Vàng",
    "Giảm 8% trên tổng giá tour",
    "Ưu tiên đặt phòng khách sạn hạng cao hơn (upgrade)",
    "Miễn phí hủy tour trước 7 ngày (1 lần/năm)",
    "Tặng bảo hiểm du lịch cao cấp tự động",
    "Tặng gói Welcome Amenity tại khách sạn",
    "Mời tham dự sự kiện du lịch VIP hàng năm",
    "Quà tặng sinh nhật VIP (voucher 1 triệu)",
  ],
  "Kim Cương": [
    "Tất cả quyền lợi hạng Bạch Kim",
    "Giảm 12% trên tổng giá tour",
    "Đặt tour ưu tiên số 1 — không bao giờ hết chỗ",
    "Trợ lý du lịch cá nhân riêng 24/7",
    "Tặng tour nội địa 2N1Đ miễn phí (1 lần/năm)",
    "Phòng khách sạn tự động upgrade lên Suite",
    "Được mời trải nghiệm tour mới trước khi ra mắt",
    "Quà tặng sinh nhật đặc biệt (voucher 2 triệu)",
  ],
  Ruby: [
    "Tất cả quyền lợi hạng Kim Cương",
    "Giảm 15% trên tổng giá tour — mức tối đa",
    "Concierge du lịch cá nhân — phục vụ 24/7",
    "Tặng 1 tour quốc tế ngắn ngày miễn phí (1 lần/năm)",
    "Ghế hạng Thương gia (Business Class) ưu tiên",
    "Check-in/out khách sạn theo giờ tùy chọn",
    "Tham gia Hội đồng cố vấn khách hàng BenThanh Tourist",
    "Quà tặng sinh nhật Ruby (voucher 5 triệu + quà cao cấp)",
    "Thư cảm ơn và đặc quyền Ruby suốt đời",
  ],
};

export default function MembershipScreen() {
  const router = useRouter();
  const { user, rewardPoints } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const { earnedPoints } = useLocalSearchParams<{ earnedPoints: string }>();
  const points = parseInt(earnedPoints ?? "0") || 0;
  const currentTier = getTier(points);
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const tiersInOrder: Tier[] = DISPLAY_NAMES.map(
    (name) => TIERS.find((t) => t.name === name)!,
  );

  const userTierIdx = DISPLAY_NAMES.indexOf(currentTier.name as TierName);
  const [viewedIdx, setViewedIdx] = useState(Math.max(0, userTierIdx));
  const flatRef = useRef<FlatList<Tier>>(null);

  const goTo = (i: number) => {
    if (i < 0 || i >= DISPLAY_NAMES.length) return;
    setViewedIdx(i);
    flatRef.current?.scrollToIndex({ index: i, animated: true });
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]?.index != null) {
        setViewedIdx(viewableItems[0].index);
      }
    },
    [],
  );

  const viewedTier = tiersInOrder[viewedIdx];
  const isMyTier = viewedIdx === userTierIdx;

  return (
    <View style={[s.root, { backgroundColor: isDark ? "#111318" : "#F1F5F9" }]}>
      {/* Màu vùng status bar nằm trong LinearGradient header bên dưới (paddingTop: insets.top) — RN edge-to-edge không còn hỗ trợ StatusBar backgroundColor */}
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={["#E51F27", "#A0141A"]} style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Hạng thành viên</Text>
        <TouchableOpacity
          onPress={toggleTheme}
          style={s.themeBtn}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={22}
            color="#fff"
          />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScroll={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;
          setShowBackToTop(offsetY > 300);
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Horizontal swipeable cards with inline navigation ── */}
        <View
          style={{
            position: "relative",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <FlatList
            ref={flatRef}
            data={tiersInOrder}
            keyExtractor={(t) => t.name}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={VIEWABILITY_CONFIG}
            initialScrollIndex={Math.max(0, userTierIdx)}
            getItemLayout={(_, index) => ({
              length: SW,
              offset: SW * index,
              index,
            })}
            style={{ height: MEMBERSHIP_CARD_H + 20 }}
            contentContainerStyle={{}}
            renderItem={({ item: tier }) => {
              return (
                <View
                  style={{
                    width: SW,
                    paddingHorizontal: 24,
                    height: MEMBERSHIP_CARD_H + 20,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <RedesignedMembershipBanner
                    earnedPoints={points}
                    rewardPoints={rewardPoints}
                    name={
                      user?.firstName && user?.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : undefined
                    }
                    tierOverride={tier}
                  />
                </View>
              );
            }}
          />
        </View>

        {/* Hướng dẫn lướt sang trái, phải */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748B" }}>
            ← Vuốt sang trái / phải để xem hạng thẻ khác →
          </Text>
        </View>

        {/* ── Navigation: dots ── */}
        <View style={s.dotsContainer}>
          <View style={s.dots}>
            {DISPLAY_NAMES.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => goTo(i)}
                hitSlop={{ top: 10, bottom: 10, left: 4, right: 4 }}
              >
                <View
                  style={[
                    s.dot,
                    i === viewedIdx && s.dotActive,
                    i === userTierIdx && i !== viewedIdx && s.dotUser,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tier label ── */}
        <Text style={[s.tierLabel, { color: isDark ? "#E2E8F0" : "#475569" }]}>
          {viewedTier.icon} Hạng {viewedTier.name}
          {isMyTier ? "  ✦ Hạng của bạn" : ""}
        </Text>

        {/* ── Go-to-my-tier button (only when not on user's tier) ── */}
        {!isMyTier && (
          <TouchableOpacity
            onPress={() => goTo(userTierIdx)}
            style={[s.myTierBtn, isDark && { backgroundColor: "rgba(229,31,39,0.15)" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={17} color="#E51F27" />
            <Text style={s.myTierBtnTxt}>
              Quay về hạng của bạn ({currentTier.name})
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Benefits for currently viewed tier ── */}
        <View style={[s.benefitsCard, { backgroundColor: isDark ? "#1E222B" : "#fff", borderColor: isDark ? "#334155" : "transparent", borderWidth: isDark ? 1 : 0 }, !isMyTier && { marginTop: 12 }]}>
          <Text style={[s.benefitsTitle, { color: isDark ? "#F8FAFC" : "#1e293b" }]}>Đặc quyền hạng {viewedTier.name}</Text>
          {BENEFITS[viewedTier.name as TierName].map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#22C55E"
                style={{ marginTop: 4 }}
              />
              <Text style={[s.benefitTxt, { color: isDark ? "#CBD5E1" : "#374151" }]}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Back to Top Button */}
      {showBackToTop && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }}
          style={{
            position: "absolute",
            bottom: 30,
            right: 20,
            width: 50,
            height: 50,
            borderRadius: 25,
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

      <ZaloFloatingButton liftBy={showBackToTop ? 60 : 0} />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F5F9" },
  themeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  card: {
    height: CARD_H,
    borderRadius: 24,
    padding: 22,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
  },
  cardMine: { borderWidth: 2.5, borderColor: "rgba(255,255,255,0.55)" },
  myBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  myBadgeText: { fontSize: 12, fontWeight: "700" },
  cardIcon: { fontSize: 44, marginBottom: 6 },
  cardTier: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1.5,
    textAlign: "center",
  },
  cardMin: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    opacity: 0.85,
    textAlign: "center",
  },
  cardPts: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 4,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  navOff: {},

  dots: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#CBD5E1" },
  dotActive: { width: 22, backgroundColor: "#E51F27" },
  dotUser: {
    borderWidth: 1.5,
    borderColor: "#E51F27",
    backgroundColor: "#FEE2E2",
  },

  tierLabel: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginTop: 12,
    marginBottom: 4,
  },

  myTierBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#E51F27",
    backgroundColor: "#FFF5F5",
    gap: 6,
  },
  myTierBtnTxt: { color: "#E51F27", fontSize: 14, fontWeight: "700" },

  benefitsCard: {
    margin: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  benefitTxt: { flex: 1, fontSize: 18, color: "#374151", lineHeight: 26 },
});

const PROGRESS_COLORS: Record<string, [string, string]> = {
  Đồng: ["#FFD080", "#F0A030"],
  Bạc: ["#D0E8F8", "#80B0CC"],
  Vàng: ["#FFF0A0", "#F0C020"],
  "Bạch Kim": ["#A8DCFF", "#58AADC"],
  "Kim Cương": ["#FFFFFF", "#80C8F8"],
  Ruby: ["#FFAAAA", "#FF3050"],
};

const compact = (n: number) => {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} triệu`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
};

// Tier-specific card backgrounds (same palette as MembershipBanner TIERS)
const CARD_BG: Record<string, readonly [string, string]> = {
  Đồng: ["#C8650E", "#7A3208"],
  Bạc: ["#6E8496", "#2C3E4E"],
  Vàng: ["#B87C08", "#604008"],
  "Bạch Kim": ["#234E6E", "#0A2436"],
  "Kim Cương": ["#0E3868", "#041440"],
  Ruby: ["#7A0818", "#38000C"],
};

// Tier accent colors for badge dot, progress bar, etc.
const TIER_ACCENT: Record<string, string> = {
  Đồng: "#FFD080",
  Bạc: "#D0E8F8",
  Vàng: "#FFF0A0",
  "Bạch Kim": "#A8DCFF",
  "Kim Cương": "#FFFFFF",
  Ruby: "#FFAAAA",
};

// Per-tier text colors: main (tên, số điểm), muted (nhãn, tiến độ), sub (phụ, divider)
const TIER_TEXT: Record<string, { main: string; muted: string; sub: string }> = {
  Đồng:       { main: "#FFF0D0", muted: "rgba(255,224,160,0.75)", sub: "rgba(255,210,130,0.40)" },
  Bạc:        { main: "#EEF4FF", muted: "rgba(196,222,248,0.75)", sub: "rgba(176,208,240,0.40)" },
  Vàng:       { main: "#FFFBE8", muted: "rgba(255,236,148,0.75)", sub: "rgba(255,216,100,0.40)" },
  "Bạch Kim": { main: "#E8F4FF", muted: "rgba(164,218,255,0.75)", sub: "rgba(136,198,248,0.40)" },
  "Kim Cương":{ main: "#EBF2FF", muted: "rgba(152,196,255,0.75)", sub: "rgba(120,172,255,0.40)" },
  Ruby:       { main: "#FFE8EC", muted: "rgba(255,184,196,0.75)", sub: "rgba(255,152,168,0.40)" },
};

/** Logo hoa BTT (không chữ) + chữ "BTT" cạnh nhau — góc trên trái, như logo ngân hàng in trên thẻ thật. */
function CardBrandMark({ tint }: { tint: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <Image
        source={require("@/assets/images/Logo_BTT-2024.png")}
        style={{ width: 22, height: 22 }}
        resizeMode="contain"
      />
      <Text
        style={{
          fontSize: 16,
          color: tint,
          fontWeight: "800",
          letterSpacing: 2,
        }}
      >
        BTT
      </Text>
    </View>
  );
}

/** Chip kim loại giả lập (như thẻ Visa/Mastercard) — chi tiết nhận diện "đây là thẻ". */
function CardChip({ tint }: { tint: string }) {
  return (
    <Svg width={40} height={30} viewBox="0 0 40 30">
      <Defs>
        <SvgLinearGradient id="chip-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={tint} stopOpacity={0.95} />
          <Stop offset="45%" stopColor={tint} stopOpacity={0.55} />
          <Stop offset="100%" stopColor={tint} stopOpacity={0.85} />
        </SvgLinearGradient>
      </Defs>
      <Rect x={0.5} y={0.5} width={39} height={29} rx={6} fill="url(#chip-metal)" />
      <Rect x={0.5} y={0.5} width={39} height={29} rx={6} fill="none" stroke={tint} strokeOpacity={0.5} strokeWidth={1} />
      {/* Đường chia ô kiểu chip thật */}
      <Line x1={14} y1={0.5} x2={14} y2={29.5} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <Line x1={26} y1={0.5} x2={26} y2={29.5} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <Line x1={0.5} y1={11} x2={39.5} y2={11} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <Line x1={0.5} y1={19} x2={39.5} y2={19} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <Rect x={9} y={5} width={22} height={20} rx={3} fill="none" stroke={tint} strokeOpacity={0.45} strokeWidth={1} />
    </Svg>
  );
}

/** Vân sáng chéo mượt trên bề mặt thẻ + quầng sáng góc — thay cho họa tiết cánh/tia sáng cũ. */
function CardSheen({ width, height }: { width: number; height: number }) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={StyleSheet.absoluteFill}
    >
      <Defs>
        <SvgLinearGradient id="sheen" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
          <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.03} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </SvgLinearGradient>
        <RadialGradient id="glow-corner" cx="100%" cy="0%" r="80%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="glow-bottom" cx="8%" cy="100%" r="60%">
          <Stop offset="0%" stopColor="#000000" stopOpacity={0.1} />
          <Stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={width} height={height} fill="url(#glow-corner)" />
      <Rect width={width} height={height} fill="url(#glow-bottom)" />
      <Path
        d={`M0,0 L${width * 0.7},0 L${width * 0.28},${height} L0,${height} Z`}
        fill="url(#sheen)"
      />
    </Svg>
  );
}

export function RedesignedMembershipBanner({
  earnedPoints,
  rewardPoints = 0,
  name = "Nguyễn Nhật Minh",
  tierOverride,
}: {
  earnedPoints: number;
  rewardPoints?: number;
  name?: string;
  tierOverride?: Tier;
}) {
  const tier = tierOverride ?? getTier(earnedPoints);
  const next = getNextMilestone(tier.min);

  const progress =
    next != null
      ? Math.min(1, Math.max(0, (earnedPoints - tier.min) / (next - tier.min)))
      : 1;

  const nextTierName = next != null ? getTier(next).name : null;
  const greetName = name.trim() || "Quý khách";
  const pointsStr = earnedPoints.toLocaleString("vi-VN");

  const progressLeft =
    next != null
      ? `${compact(earnedPoints)} / ${compact(next)} đ`
      : "Hạng cao nhất ✦";

  const cardBg = CARD_BG[tier.name] ?? CARD_BG["Bạc"];
  const accent = TIER_ACCENT[tier.name] ?? "#D0E8F8";
  const progressColors = PROGRESS_COLORS[tier.name] ?? ["#D0E8F8", "#80B0CC"];
  const tc = TIER_TEXT[tier.name] ?? TIER_TEXT["Bạc"];
  const cardWidth = SW - 48;
  // Chip + điểm tích lũy tách 2 đầu (chip trái, label/số xếp dọc bên phải) —
  // cụm bên phải cao hơn chip (label 12 + số 34) nên cần nhỉnh hơn 0.58 một
  // chút để không lặp lại lỗi tràn/đè chữ đã gặp ở các bố cục trước.
  const cardHeight = Math.round(cardWidth * 0.62);

  return (
    <View
      style={{
        width: cardWidth,
        borderRadius: 24,
        overflow: "hidden",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 18,
      }}
    >
      <LinearGradient
        colors={cardBg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 20, minHeight: cardHeight }}
      >
        {/* Vân sáng bề mặt — họa tiết duy nhất, thay cho cánh/tia sáng cũ */}
        <CardSheen width={cardWidth} height={cardHeight} />

        {/* ── Header: logo + tên thương hiệu · hạng thẻ ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <CardBrandMark tint={tc.main} />

          {/* Tier badge */}
          <View
            style={{
              backgroundColor: tc.sub,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: tc.muted,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: accent,
              }}
            />
            <Text style={{ fontSize: 16, color: tc.main, fontWeight: "700" }}>
              {tier.name}
            </Text>
          </View>
        </View>

        {/* ── Chip + Points — chip cố định bên trái, nhãn+số điểm (xếp dọc, label
            trên/số dưới) dán sát bên phải, khoảng giữa để trống. Dùng
            justifyContent: space-between vì 2 bên là nội dung kích thước cố
            định (không có phần tử flex:1 nào) — an toàn hơn cách share chỗ
            trống bằng flex, không tái diễn lỗi bị ép/đè ở các bố cục trước. ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <CardChip tint={tc.main} />
          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 12,
                color: tc.muted,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              ĐIỂM TÍCH LŨY
            </Text>
            <Text
              style={{
                fontSize: 34,
                color: tc.main,
                fontWeight: "800",
                marginTop: 2,
                letterSpacing: 1,
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {pointsStr}
            </Text>
          </View>
        </View>

        {/* ── Footer: tên chủ thẻ · hạng kế tiếp — giống "CARD HOLDER" trên thẻ thật ── */}
        <View style={{ marginTop: 16 }}>
          <View
            style={{
              height: 1,
              backgroundColor: tc.sub,
              marginBottom: 8,
            }}
          />
          {/* Tên chủ thẻ chiếm toàn bộ chiều rộng — chừa chỗ cho họ tên dài
              (4-5 từ): tự thu nhỏ tối đa 2px (minimumFontScale ~0.91 của size
              22 ≈ 20) thay vì tràn dòng hoặc bị cắt "...". */}
          <Text
            style={{
              fontSize: 12,
              color: tc.muted,
              fontWeight: "700",
              letterSpacing: 1,
            }}
          >
            CHỦ THẺ
          </Text>
          <Text
            style={{
              fontSize: 22,
              color: tc.main,
              fontWeight: "800",
              marginTop: 2,
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={20 / 22}
          >
            {greetName}
          </Text>

          {/* Progress bar */}
          <View
            style={{
              height: 6,
              backgroundColor: tc.sub,
              borderRadius: 3,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <LinearGradient
              colors={progressColors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${progress * 100}%` }}
            />
          </View>

          {/* Tiến độ (trái) · hạng kế tiếp (phải) — gọn trên cùng 1 dòng, thay
              cho khối "HẠNG KẾ TIẾP" riêng biệt trước đó. */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 5,
            }}
          >
            <Text style={{ fontSize: 14, color: tc.muted, fontWeight: "500" }}>
              {progressLeft}
            </Text>
            <Text style={{ fontSize: 14, color: accent, fontWeight: "700" }}>
              {nextTierName ? `↑ ${nextTierName}` : "✦ Cao nhất"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
