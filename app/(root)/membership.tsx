import {
  getTier,
  getNextMilestone,
  Tier,
  TIERS,
} from "@/components/MembershipBanner";
import { FONT_SIZE } from "@/constants/typography";
import { useAuth } from "@/context/Auth_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient as SvgLinearGradient,
  Path,
  Polygon,
  RadialGradient,
  Rect,
  Stop,
} from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const SW = Dimensions.get("window").width;
const CARD_SCALE = (SW - 48) / 600;
const CARD_H = Math.round(240 * CARD_SCALE);

const DISPLAY_NAMES = ["Đồng", "Bạc", "Vàng", "Bạch Kim", "Kim Cương", "Ruby"] as const;
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
  const { earnedPoints } = useLocalSearchParams<{ earnedPoints: string }>();
  const points = parseInt(earnedPoints ?? "0") || 0;
  const currentTier = getTier(points);

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
  const isDarkTierText = viewedTier.text === "#333" || viewedTier.text === "#1a1a2e";

  return (
    <View style={s.root}>
      <StatusBar style="light" backgroundColor="#E51F27" />

      {/* Header */}
      <LinearGradient colors={["#E51F27", "#A0141A"]} style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Hạng thành viên</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        {/* ── Horizontal swipeable cards with inline navigation ── */}
        <View style={{ position: "relative", justifyContent: "center", marginTop: 20 }}>
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
            style={{ height: CARD_H + 110, overflow: "visible" }}
            contentContainerStyle={{ overflow: "visible" }}
            renderItem={({ item: tier }) => {
              return (
                <View
                  style={{
                    width: SW,
                    paddingHorizontal: 24,
                    height: CARD_H + 110,
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "visible",
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

          {/* Left Arrow Button */}
          <TouchableOpacity
            onPress={() => goTo(viewedIdx - 1)}
            disabled={viewedIdx === 0}
            style={[
              s.navBtn,
              viewedIdx === 0 && s.navOff,
              { position: "absolute", left: 10, zIndex: 10, top: "50%", marginTop: -20 },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={viewedIdx === 0 ? "#ccc" : "#E51F27"}
            />
          </TouchableOpacity>

          {/* Right Arrow Button */}
          <TouchableOpacity
            onPress={() => goTo(viewedIdx + 1)}
            disabled={viewedIdx === DISPLAY_NAMES.length - 1}
            style={[
              s.navBtn,
              viewedIdx === DISPLAY_NAMES.length - 1 && s.navOff,
              { position: "absolute", right: 10, zIndex: 10, top: "50%", marginTop: -20 },
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={
                viewedIdx === DISPLAY_NAMES.length - 1 ? "#ccc" : "#E51F27"
              }
            />
          </TouchableOpacity>
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
        <Text style={s.tierLabel}>
          {viewedTier.icon} Hạng {viewedTier.name}
          {isMyTier ? "  ✦ Hạng của bạn" : ""}
        </Text>

        {/* ── Go-to-my-tier button (only when not on user's tier) ── */}
        {!isMyTier && (
          <TouchableOpacity
            onPress={() => goTo(userTierIdx)}
            style={s.myTierBtn}
            activeOpacity={0.8}
          >
            <Ionicons name="person-circle-outline" size={17} color="#E51F27" />
            <Text style={s.myTierBtnTxt}>
              Quay về hạng của bạn ({currentTier.name})
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Benefits for currently viewed tier ── */}
        <View style={[s.benefitsCard, !isMyTier && { marginTop: 12 }]}>
          <Text style={s.benefitsTitle}>
            Đặc quyền hạng {viewedTier.name}
          </Text>
          {BENEFITS[viewedTier.name as TierName].map((b, i) => (
            <View key={i} style={s.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="#22C55E"
                style={{ marginTop: 3 }}
              />
              <Text style={s.benefitTxt}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F1F5F9" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
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
    fontSize: 16,
    fontWeight: "900",
    color: "#1e293b",
    marginBottom: 14,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  benefitTxt: { flex: 1, fontSize: 14, color: "#374151", lineHeight: 21 },
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

  const progressText =
    next != null
      ? `${compact(earnedPoints)} / ${compact(next)} đ → Nâng hạng ${nextTierName}`
      : "Hạng cao nhất — Đặc quyền tối thượng ✦";

  const pointsStr = earnedPoints.toLocaleString("vi-VN");

  const cardWidth = SW - 48;
  const scale = cardWidth / 600;
  const CARD_H_Local = 240 * scale;

  let minX = 0;
  let minY = 0;
  let viewBoxW = 600;
  let viewBoxH = 240;
  let svgBody = null;

  switch (tier.name) {
    case "Đồng":
      minX = 0;
      minY = 0;
      viewBoxW = 600;
      viewBoxH = 240;
      svgBody = renderBronzeSvgLocal();
      break;
    case "Bạc":
      minX = -60;
      minY = -18;
      viewBoxW = 720;
      viewBoxH = 276;
      svgBody = renderSilverSvgLocal();
      break;
    case "Vàng":
      minX = -90;
      minY = -30;
      viewBoxW = 780;
      viewBoxH = 300;
      svgBody = renderGoldSvgLocal();
      break;
    case "Bạch Kim":
      minX = -120;
      minY = -50;
      viewBoxW = 840;
      viewBoxH = 340;
      svgBody = renderPlatinumSvgLocal();
      break;
    case "Kim Cương":
      minX = -150;
      minY = -70;
      viewBoxW = 900;
      viewBoxH = 380;
      svgBody = renderDiamondSvgLocal();
      break;
    case "Ruby":
      minX = -190;
      minY = -95;
      viewBoxW = 980;
      viewBoxH = 430;
      svgBody = renderRubySvgLocal();
      break;
    default:
      minX = 0;
      minY = 0;
      viewBoxW = 600;
      viewBoxH = 240;
      svgBody = renderBronzeSvgLocal();
      break;
  }

  return (
    <View style={{ width: cardWidth, height: CARD_H_Local, position: "relative", overflow: "visible" }}>
      {/* SVG Background Layer */}
      <View
        style={{
          width: viewBoxW * scale,
          height: viewBoxH * scale,
          position: "absolute",
          left: minX * scale,
          top: minY * scale,
          overflow: "visible",
        }}
      >
        <Svg
          width={viewBoxW * scale}
          height={viewBoxH * scale}
          viewBox={`${minX} ${minY} ${viewBoxW} ${viewBoxH}`}
          style={{ overflow: "visible" }}
        >
          {svgBody}
        </Svg>
      </View>

      {/* React Native Overlay Layer (Prestige Voyager Style) */}
      <View
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: cardWidth,
          height: CARD_H_Local,
          paddingLeft: 135 * scale,
          paddingRight: Math.max(12, 16 * scale),
          paddingTop: Math.max(14, 18 * scale),
          paddingBottom: Math.max(10, 14 * scale),
          justifyContent: "flex-end",
          gap: 6,
        }}
      >
        {/* Top greeting and name + Badge on top right */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View style={{ gap: 1, flex: 1, paddingRight: 6 }}>
            <Text style={{ fontSize: Math.max(12, 13 * scale), color: "rgba(255,255,255,0.75)", fontWeight: "500" }}>
              Xin chào,
            </Text>
            <Text style={{ fontSize: Math.max(16, 18 * scale), color: "#fff", fontWeight: "800" }} numberOfLines={1}>
              {greetName}
            </Text>
          </View>
          
          <View style={{
            backgroundColor: "rgba(255,255,255,0.16)",
            borderRadius: 15,
            paddingHorizontal: Math.max(8, 9 * scale),
            paddingVertical: Math.max(3, 4 * scale),
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.22)",
            marginBottom: 2,
          }}>
            <Text style={{ fontSize: Math.max(10, 10 * scale), color: "#fff", fontWeight: "700" }}>
              {tier.icon} {tier.name}
            </Text>
          </View>
        </View>

        {/* Bottom points, reward points, progress bar and label */}
        <View style={{ gap: 4 }}>
          {/* Divider */}
          <View style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.15)",
            width: "100%",
            marginBottom: 2 * scale,
          }} />

          {/* Points values */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontSize: Math.max(8, 8 * scale), color: "rgba(255,255,255,0.55)", fontWeight: "600", letterSpacing: 0.5 }}>
                ĐIỂM TÍCH LŨY
              </Text>
              <Text style={{ fontSize: Math.max(18, 20 * scale), color: "#fff", fontWeight: "800", marginTop: 1 }}>
                {pointsStr} <Text style={{ fontSize: Math.max(10, 11 * scale), fontWeight: "500", color: "rgba(255,255,255,0.65)" }}>pts</Text>
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: Math.max(8, 8 * scale), color: "rgba(255,255,255,0.55)", fontWeight: "600", letterSpacing: 0.5 }}>
                ĐIỂM THƯỞNG
              </Text>
              <Text style={{ fontSize: Math.max(13, 15 * scale), color: "#fff", fontWeight: "800", marginTop: 1 }}>
                {rewardPoints.toLocaleString("vi-VN")} <Text style={{ fontSize: Math.max(9, 10 * scale), fontWeight: "500", color: "rgba(255,255,255,0.65)" }}>pts</Text>
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={{
            height: Math.max(4, 5 * scale),
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 2.5,
            overflow: "hidden",
            marginTop: 2 * scale,
          }}>
            <LinearGradient
              colors={PROGRESS_COLORS[tier.name] || ["#FFD080", "#F0A030"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${progress * 100}%` }}
            />
          </View>

          <Text style={{ fontSize: Math.max(9.5, 9.5 * scale), color: "rgba(255,255,255,0.7)", fontWeight: "500", marginTop: 1 * scale }}>
            {progressText}
          </Text>
        </View>
      </View>
    </View>
  );
}

function renderBronzeSvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="card-bg-br" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C8650E" />
          <Stop offset="50%" stopColor="#A0480A" />
          <Stop offset="100%" stopColor="#7A3208" />
        </SvgLinearGradient>
        <SvgLinearGradient id="card-shine-br" x1="0%" y1="0%" x2="100%" y2="60%">
          <Stop offset="0%" stopColor="#E8900A" stopOpacity={0.35} />
          <Stop offset="100%" stopColor="#5A2008" stopOpacity={0.0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="icon-bg-br" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4874A" />
          <Stop offset="50%" stopColor="#A0522D" />
          <Stop offset="100%" stopColor="#7B3A1A" />
        </SvgLinearGradient>
        <SvgLinearGradient id="icon-shine-br" x1="20%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#E8A070" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#5C2A0D" stopOpacity={0.3} />
        </SvgLinearGradient>
        <SvgLinearGradient id="icon-gem-br" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#CD7F32" />
          <Stop offset="100%" stopColor="#8B4513" />
        </SvgLinearGradient>
        <RadialGradient id="deco-circle-br" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8900A" stopOpacity={0.18} />
          <Stop offset="100%" stopColor="#E8900A" stopOpacity={0.0} />
        </RadialGradient>
      </Defs>

      <Rect width={600} height={240} rx={24} fill="url(#card-bg-br)" />
      <Rect width={600} height={240} rx={24} fill="url(#card-shine-br)" />

      <Circle cx={520} cy={30} r={130} fill="url(#deco-circle-br)" />
      <Circle cx={560} cy={210} r={90} fill="url(#deco-circle-br)" />

      <Circle cx={30} cy={150} r={2} fill="white" fillOpacity={0.07} />
      <Circle cx={60} cy={165} r={2} fill="white" fillOpacity={0.07} />
      <Circle cx={90} cy={150} r={2} fill="white" fillOpacity={0.07} />
      <Circle cx={45} cy={175} r={1.5} fill="white" fillOpacity={0.07} />

      <G transform="translate(72,120)">
        <Circle r={52} fill="url(#icon-bg-br)" />
        <Circle r={52} fill="url(#icon-shine-br)" />
        <Circle r={52} fill="none" stroke="#C06020" strokeWidth={2} />
        <Circle
          r={45}
          fill="none"
          stroke="#E8A050"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
        <Circle r={40} fill="url(#icon-bg-br)" />
        <Circle r={40} fill="url(#icon-shine-br)" />
        <Path
          d="M0,-26 L20,-12 L20,7 Q20,22 0,30 Q-20,22 -20,7 L-20,-12 Z"
          fill="url(#icon-gem-br)"
        />
        <Path
          d="M0,-26 L20,-12 L20,7 Q20,22 0,30 Q-20,22 -20,7 L-20,-12 Z"
          fill="url(#icon-shine-br)"
        />
        <Path
          d="M0,-26 L20,-12 L20,7 Q20,22 0,30 Q-20,22 -20,7 L-20,-12 Z"
          fill="none"
          stroke="#F0C080"
          strokeWidth={1.5}
        />
        <Ellipse
          cx={-12}
          cy={-10}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.9}
          transform="rotate(-40,-12,-10)"
        />
        <Ellipse
          cx={-14}
          cy={-2}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.9}
          transform="rotate(-20,-14,-2)"
        />
        <Ellipse
          cx={-13}
          cy={6}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.85}
          transform="rotate(5,-13,6)"
        />
        <Ellipse
          cx={12}
          cy={-10}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.9}
          transform="rotate(40,12,-10)"
        />
        <Ellipse
          cx={14}
          cy={-2}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.9}
          transform="rotate(20,14,-2)"
        />
        <Ellipse
          cx={13}
          cy={6}
          rx={5.5}
          ry={3}
          fill="#8B4513"
          opacity={0.85}
          transform="rotate(-5,13,6)"
        />
        <Path
          d="M0,-12 L2.5,-5 L9,-5 L4,0 L6,7 L0,3 L-6,7 L-4,0 L-9,-5 L-2.5,-5 Z"
          fill="#5A2810"
        />
        <Polygon points="0,-32 3.5,-25 -3.5,-25" fill="#E8A050" />
        <Polygon points="-11,-29 -8,-23 -14,-23" fill="#E8A050" />
        <Polygon points="11,-29 14,-23 8,-23" fill="#E8A050" />
      </G>
    </>
  );
}

function renderSilverSvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="s2-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#6E8496" />
          <Stop offset="55%" stopColor="#4A6070" />
          <Stop offset="100%" stopColor="#2C3E4E" />
        </SvgLinearGradient>
        <SvgLinearGradient id="s2-sh" x1="0%" y1="0%" x2="60%" y2="100%">
          <Stop offset="0%" stopColor="#C0D8EC" stopOpacity={0.4} />
          <Stop offset="100%" stopColor="#0A1C2A" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="s2-ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#D4DFE8" />
          <Stop offset="50%" stopColor="#8AAABB" />
          <Stop offset="100%" stopColor="#527080" />
        </SvgLinearGradient>
        <SvgLinearGradient id="s2-wL" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#C8E0F0" stopOpacity={0.95} />
          <Stop offset="50%" stopColor="#88B0CC" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#3A6888" stopOpacity={0.1} />
        </SvgLinearGradient>
        <SvgLinearGradient id="s2-wR" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C8E0F0" stopOpacity={0.95} />
          <Stop offset="50%" stopColor="#88B0CC" stopOpacity={0.6} />
          <Stop offset="100%" stopColor="#3A6888" stopOpacity={0.1} />
        </SvgLinearGradient>
      </Defs>

      {/* LEFT WING */}
      <G opacity={0.88}>
        <Path
          d="M24,90 Q-10,72 -34,50 Q-18,44 -4,56 Q-8,36 0,22 Q14,38 12,58 Q6,38 16,28 Q28,44 22,64 Q30,48 40,38 Q48,56 36,72 Q44,62 52,56 Q56,76 40,88 Q32,94 24,90 Z"
          fill="url(#s2-wL)"
        />
        <Path
          d="M24,150 Q-10,168 -34,190 Q-18,196 -4,184 Q-8,204 0,218 Q14,202 12,182 Q6,202 16,212 Q28,196 22,176 Q30,192 40,202 Q48,184 36,168 Q44,178 52,184 Q56,164 40,152 Q32,146 24,150 Z"
          fill="url(#s2-wL)"
          opacity={0.7}
        />
        <Path
          d="M-4,56 Q8,68 8,90"
          fill="none"
          stroke="rgba(200,230,248,0.5)"
          strokeWidth={1}
        />
        <Path
          d="M12,58 Q20,70 18,90"
          fill="none"
          stroke="rgba(200,230,248,0.45)"
          strokeWidth={1}
        />
        <Path
          d="M22,64 Q26,76 24,90"
          fill="none"
          stroke="rgba(200,230,248,0.4)"
          strokeWidth={1}
        />
        <Path
          d="M-4,184 Q8,172 8,150"
          fill="none"
          stroke="rgba(200,230,248,0.45)"
          strokeWidth={1}
        />
        <Path
          d="M12,182 Q20,170 18,150"
          fill="none"
          stroke="rgba(200,230,248,0.4)"
          strokeWidth={1}
        />
        <Path
          d="M22,176 Q26,164 24,150"
          fill="none"
          stroke="rgba(200,230,248,0.35)"
          strokeWidth={1}
        />
      </G>

      {/* RIGHT WING */}
      <G opacity={0.88}>
        <Path
          d="M576,90 Q610,72 634,50 Q618,44 604,56 Q608,36 600,22 Q586,38 588,58 Q594,38 584,28 Q572,44 578,64 Q570,48 560,38 Q552,56 564,72 Q556,62 548,56 Q544,76 560,88 Q568,94 576,90 Z"
          fill="url(#s2-wR)"
        />
        <Path
          d="M576,150 Q610,168 634,190 Q618,196 604,184 Q608,204 600,218 Q586,202 588,182 Q594,202 584,212 Q572,196 578,176 Q570,192 560,202 Q552,184 564,168 Q556,178 548,184 Q544,164 560,152 Q568,146 576,150 Z"
          fill="url(#s2-wR)"
          opacity={0.7}
        />
        <Path
          d="M604,56 Q592,68 592,90"
          fill="none"
          stroke="rgba(200,230,248,0.5)"
          strokeWidth={1}
        />
        <Path
          d="M588,58 Q580,70 582,90"
          fill="none"
          stroke="rgba(200,230,248,0.45)"
          strokeWidth={1}
        />
        <Path
          d="M578,64 Q574,76 576,90"
          fill="none"
          stroke="rgba(200,230,248,0.4)"
          strokeWidth={1}
        />
        <Path
          d="M604,184 Q592,172 592,150"
          fill="none"
          stroke="rgba(200,230,248,0.45)"
          strokeWidth={1}
        />
        <Path
          d="M588,182 Q580,170 582,150"
          fill="none"
          stroke="rgba(200,230,248,0.4)"
          strokeWidth={1}
        />
        <Path
          d="M578,176 Q574,164 576,150"
          fill="none"
          stroke="rgba(200,230,248,0.35)"
          strokeWidth={1}
        />
      </G>

      {/* CARD */}
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#s2-bg)" />
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#s2-sh)" />

      <G transform="translate(72,120)">
        <Circle r={46} fill="url(#s2-ic)" />
        <Circle r={46} fill="none" stroke="#A0C0D4" strokeWidth={1.5} />
        <Circle
          r={38}
          fill="none"
          stroke="rgba(200,230,248,0.4)"
          strokeWidth={1}
          strokeDasharray="4,3"
        />
        <Path
          d="M0,-28 L24,-14 L24,14 L0,28 L-24,14 L-24,-14 Z"
          fill="rgba(255,255,255,0.15)"
        />
        <Path
          d="M0,-28 L24,-14 L24,14 L0,28 L-24,14 L-24,-14 Z"
          fill="none"
          stroke="rgba(220,240,255,0.7)"
          strokeWidth={1.5}
        />
        <Path
          d="M-3,0 Q-10,-11 -21,-9 Q-15,-3 -3,0 Z"
          fill="rgba(200,230,248,0.8)"
        />
        <Path
          d="M-3,0 Q-11,-4 -21,2 Q-14,5 -3,0 Z"
          fill="rgba(200,230,248,0.6)"
        />
        <Path
          d="M-3,0 Q-9,6 -17,10 Q-11,12 -3,0 Z"
          fill="rgba(200,230,248,0.45)"
        />
        <Path
          d="M3,0 Q10,-11 21,-9 Q15,-3 3,0 Z"
          fill="rgba(200,230,248,0.8)"
        />
        <Path d="M3,0 Q11,-4 21,2 Q14,5 3,0 Z" fill="rgba(200,230,248,0.6)" />
        <Path d="M3,0 Q9,6 17,10 Q11,12 3,0 Z" fill="rgba(200,230,248,0.45)" />
        <Circle cx={0} cy={0} r={7} fill="rgba(210,235,250,0.9)" />
        <Circle cx={0} cy={0} r={4} fill="rgba(100,150,180,0.8)" />
        <Polygon points="0,-38 4,-29 -4,-29" fill="rgba(200,230,248,0.9)" />
        <Polygon
          points="-14,-34 -11,-27 -17,-27"
          fill="rgba(180,215,235,0.8)"
        />
        <Polygon points="14,-34 17,-27 11,-27" fill="rgba(180,215,235,0.8)" />
      </G>
    </>
  );
}

function renderGoldSvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="g3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#B87C08" />
          <Stop offset="50%" stopColor="#8C5E04" />
          <Stop offset="100%" stopColor="#604008" />
        </SvgLinearGradient>
        <SvgLinearGradient id="g3-sh" x1="0%" y1="0%" x2="70%" y2="100%">
          <Stop offset="0%" stopColor="#FFE878" stopOpacity={0.45} />
          <Stop offset="100%" stopColor="#3A2000" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="g3-ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F5C040" />
          <Stop offset="50%" stopColor="#D49010" />
          <Stop offset="100%" stopColor="#A06008" />
        </SvgLinearGradient>
        <SvgLinearGradient id="g3-w1L" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFE870" stopOpacity={0.95} />
          <Stop offset="55%" stopColor="#D4A020" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#7A4800" stopOpacity={0.05} />
        </SvgLinearGradient>
        <SvgLinearGradient id="g3-w1R" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFE870" stopOpacity={0.95} />
          <Stop offset="55%" stopColor="#D4A020" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#7A4800" stopOpacity={0.05} />
        </SvgLinearGradient>
        <SvgLinearGradient id="g3-w2L" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFD040" stopOpacity={0.7} />
          <Stop offset="100%" stopColor="#A06000" stopOpacity={0.05} />
        </SvgLinearGradient>
      </Defs>

      {/* Hào quang tia sáng (behind card) */}
      <G transform="translate(300,120)" opacity={0.18}>
        <Line x1={-310} y1={0} x2={310} y2={0} stroke="#FFE060" strokeWidth={1.5} />
        <Line x1={-270} y1={-150} x2={270} y2={150} stroke="#FFE060" strokeWidth={1.5} />
        <Line x1={-270} y1={150} x2={270} y2={-150} stroke="#FFE060" strokeWidth={1.5} />
        <Line x1={0} y1={-200} x2={0} y2={200} stroke="#FFE060" strokeWidth={1.5} />
        <Line x1={-200} y1={-115} x2={200} y2={115} stroke="#FFD040" strokeWidth={1} />
        <Line x1={-200} y1={115} x2={200} y2={-115} stroke="#FFD040" strokeWidth={1} />
        <Line x1={-310} y1={-60} x2={310} y2={60} stroke="#FFD040" strokeWidth={1} />
        <Line x1={-310} y1={60} x2={310} y2={-60} stroke="#FFD040" strokeWidth={1} />
      </G>

      {/* OUTER WINGS (lớp 2 — nhỏ hơn, phía trên) */}
      <G opacity={0.6}>
        <Path d="M18,60 Q-20,40 -50,14 Q-32,8 -14,24 Q-22,2 -12,-16 Q6,4 2,30 Q10,6 22,-8 Q36,14 26,40 Q36,24 50,12 Q58,36 42,54 Q30,64 18,60 Z" fill="url(#g3-w2L)"/>
        <Path d="M582,60 Q620,40 650,14 Q632,8 614,24 Q622,2 612,-16 Q594,4 598,30 Q590,6 578,-8 Q564,14 574,40 Q564,24 550,12 Q542,36 558,54 Q570,64 582,60 Z" fill="url(#g3-w2L)"/>
        <Path d="M18,180 Q-20,200 -50,226 Q-32,232 -14,216 Q-22,238 -12,256 Q6,236 2,210 Q10,234 22,248 Q36,226 26,200 Q36,216 50,228 Q58,204 42,186 Q30,176 18,180 Z" fill="url(#g3-w2L)" opacity={0.8}/>
        <Path d="M582,180 Q620,200 650,226 Q632,232 614,216 Q622,238 612,256 Q594,236 598,210 Q590,234 578,248 Q564,226 574,200 Q564,216 550,228 Q542,204 558,186 Q570,176 582,180 Z" fill="url(#g3-w2L)" opacity={0.8}/>
      </G>

      {/* MAIN WINGS (lớp 1 — to, chính) */}
      <G opacity={0.9}>
        <Path d="M20,96 Q-18,74 -48,44 Q-28,36 -10,52 Q-16,28 -4,10 Q14,32 10,58 Q16,30 28,14 Q44,40 34,68 Q46,48 60,34 Q68,62 50,84 Q64,70 80,60 Q82,90 60,104 Q44,114 20,96 Z" fill="url(#g3-w1L)"/>
        <Path d="M20,144 Q-18,166 -48,196 Q-28,204 -10,188 Q-16,212 -4,230 Q14,208 10,182 Q16,210 28,226 Q44,200 34,172 Q46,192 60,206 Q68,178 50,156 Q64,170 80,180 Q82,150 60,136 Q44,126 20,144 Z" fill="url(#g3-w1L)" opacity={0.82}/>
        <Path d="M-10,52 Q4,66 2,96" fill="none" stroke="rgba(255,240,130,0.5)" strokeWidth={1.2}/>
        <Path d="M10,58 Q18,72 16,96" fill="none" stroke="rgba(255,240,130,0.45)" strokeWidth={1.2}/>
        <Path d="M34,68 Q38,80 36,96" fill="none" stroke="rgba(255,240,130,0.4)" strokeWidth={1.2}/>
        <Path d="M50,84 Q50,92 50,96" fill="none" stroke="rgba(255,240,130,0.35)" strokeWidth={1}/>
        <Path d="M-10,188 Q4,174 2,144" fill="none" stroke="rgba(255,240,130,0.45)" strokeWidth={1.2}/>
        <Path d="M10,182 Q18,168 16,144" fill="none" stroke="rgba(255,240,130,0.4)" strokeWidth={1.2}/>
        <Path d="M34,172 Q38,160 36,144" fill="none" stroke="rgba(255,240,130,0.35)" strokeWidth={1.2}/>
        <Path d="M580,96 Q618,74 648,44 Q628,36 610,52 Q616,28 604,10 Q586,32 590,58 Q584,30 572,14 Q556,40 566,68 Q554,48 540,34 Q532,62 550,84 Q536,70 520,60 Q518,90 540,104 Q556,114 580,96 Z" fill="url(#g3-w1R)"/>
        <Path d="M580,144 Q618,166 648,196 Q628,204 610,188 Q616,212 604,230 Q586,208 590,182 Q584,210 572,226 Q556,200 566,172 Q554,192 540,206 Q532,178 550,156 Q536,170 520,180 Q518,150 540,136 Q556,126 580,144 Z" fill="url(#g3-w1R)" opacity={0.82}/>
        <Path d="M610,52 Q596,66 598,96" fill="none" stroke="rgba(255,240,130,0.5)" strokeWidth={1.2}/>
        <Path d="M590,58 Q582,72 584,96" fill="none" stroke="rgba(255,240,130,0.45)" strokeWidth={1.2}/>
        <Path d="M566,68 Q562,80 564,96" fill="none" stroke="rgba(255,240,130,0.4)" strokeWidth={1.2}/>
        <Path d="M550,84 Q550,92 550,96" fill="none" stroke="rgba(255,240,130,0.35)" strokeWidth={1}/>
        <Path d="M610,188 Q596,174 598,144" fill="none" stroke="rgba(255,240,130,0.45)" strokeWidth={1.2}/>
        <Path d="M590,182 Q582,168 584,144" fill="none" stroke="rgba(255,240,130,0.4)" strokeWidth={1.2}/>
        <Path d="M566,172 Q562,160 564,144" fill="none" stroke="rgba(255,240,130,0.35)" strokeWidth={1.2}/>
      </G>

      {/* CARD */}
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#g3-bg)"/>
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#g3-sh)"/>

      <G transform="translate(72,120)">
        <Circle r={48} fill="url(#g3-ic)" />
        <Circle r={48} fill="none" stroke="#FFD040" strokeWidth={2} />
        <Circle r={40} fill="none" stroke="rgba(255,230,80,0.3)" strokeWidth={1} strokeDasharray="4,3"/>
        <Path d="M0,-30 L8.5,-10.5 L29,-10.5 L13,1.5 L19,22 L0,10 L-19,22 L-13,1.5 L-29,-10.5 L-8.5,-10.5 Z" fill="rgba(255,220,50,0.25)"/>
        <Path d="M0,-30 L8.5,-10.5 L29,-10.5 L13,1.5 L19,22 L0,10 L-19,22 L-13,1.5 L-29,-10.5 L-8.5,-10.5 Z" fill="none" stroke="rgba(255,245,160,0.8)" strokeWidth={1.5}/>
        <Path d="M0,-18 Q4,-10 3,-5 Q5,-1.5 0,3 Q-5,-1.5 -3,-5 Q-4,-10 0,-18 Z" fill="rgba(100,55,0,0.85)"/>
        <Polygon points="0,-38 4,-29 -4,-29" fill="#FFE868"/>
        <Polygon points="-14,-34 -11,-27 -17,-27" fill="#FFD840"/>
        <Polygon points="14,-34 17,-27 11,-27" fill="#FFD840"/>
        <Polygon points="-25,-28 -23,-22 -27,-22" fill="#F0C030"/>
        <Polygon points="25,-28 27,-22 23,-22" fill="#F0C030"/>
        <Circle cx={0} cy={-38} r={3} fill="#FFE050"/>
      </G>
    </>
  );
}

function renderPlatinumSvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="p3-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#234E6E" />
          <Stop offset="50%" stopColor="#163A54" />
          <Stop offset="100%" stopColor="#0A2436" />
        </SvgLinearGradient>
        <SvgLinearGradient id="p3-sh" x1="0%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#80C8F0" stopOpacity={0.4} />
          <Stop offset="100%" stopColor="#041420" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="p3-ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#C8E4F8" />
          <Stop offset="50%" stopColor="#78ACCF" />
          <Stop offset="100%" stopColor="#3A7098" />
        </SvgLinearGradient>
        <SvgLinearGradient id="p3-wA" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D0EEFF" stopOpacity={0.92} />
          <Stop offset="50%" stopColor="#78B8E0" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#204878" stopOpacity={0.05} />
        </SvgLinearGradient>
        <SvgLinearGradient id="p3-wB" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A0D4F8" stopOpacity={0.75} />
          <Stop offset="100%" stopColor="#184878" stopOpacity={0.05} />
        </SvgLinearGradient>
        <SvgLinearGradient id="p3-wC" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#80C0F0" stopOpacity={0.5} />
          <Stop offset="100%" stopColor="#103860" stopOpacity={0.02} />
        </SvgLinearGradient>
      </Defs>

      {/* Ice sparkles (outside) */}
      <Path d="M-60,80 L-58,88 L-50,92 L-58,96 L-60,104 L-62,96 L-70,92 L-62,88 Z" fill="rgba(160,220,255,0.7)"/>
      <Path d="M-50,140 L-48,147 L-42,150 L-48,153 L-50,160 L-52,153 L-58,150 L-52,147 Z" fill="rgba(160,220,255,0.55)"/>
      <Path d="M660,80 L662,88 L668,92 L662,96 L660,104 L658,96 L652,92 L658,88 Z" fill="rgba(160,220,255,0.7)"/>
      <Path d="M650,140 L652,147 L656,150 L652,153 L650,160 L648,153 L644,150 L648,147 Z" fill="rgba(160,220,255,0.55)"/>

      {/* WING LAYER C (outermost, lightest) */}
      <G opacity={0.45}>
        <Path d="M10,70 Q-40,44 -80,8 Q-56,-2 -36,18 Q-48,-12 -36,-38 Q-10,-14 -16,20 Q-6,-14 10,-34 Q28,-4 14,34 Q28,10 48,-8 Q60,28 40,58 Q54,40 72,26 Q78,60 54,80 Q34,92 10,70 Z" fill="url(#p3-wC)"/>
        <Path d="M10,170 Q-40,196 -80,232 Q-56,242 -36,222 Q-48,252 -36,278 Q-10,254 -16,220 Q-6,254 10,274 Q28,244 14,206 Q28,230 48,248 Q60,212 40,182 Q54,200 72,214 Q78,180 54,160 Q34,148 10,170 Z" fill="url(#p3-wC)"/>
        <Path d="M590,70 Q640,44 680,8 Q656,-2 636,18 Q648,-12 636,-38 Q610,-14 616,20 Q606,-14 590,-34 Q572,-4 586,34 Q572,10 552,-8 Q540,28 560,58 Q546,40 528,26 Q522,60 546,80 Q566,92 590,70 Z" fill="url(#p3-wC)"/>
        <Path d="M590,170 Q640,196 680,232 Q656,242 636,222 Q648,252 636,278 Q610,254 616,220 Q606,254 590,274 Q572,244 586,206 Q572,230 552,248 Q540,212 560,182 Q546,200 528,214 Q522,180 546,160 Q566,148 590,170 Z" fill="url(#p3-wC)"/>
      </G>

      {/* WING LAYER B */}
      <G opacity={0.65}>
        <Path d="M16,84 Q-24,60 -60,28 Q-42,20 -22,38 Q-30,10 -18,-8 Q4,16 0,46 Q8,18 22,2 Q40,28 28,56 Q40,34 56,20 Q66,50 48,72 Q62,56 80,44 Q84,76 62,92 Q44,104 16,84 Z" fill="url(#p3-wB)"/>
        <Path d="M16,156 Q-24,180 -60,212 Q-42,220 -22,202 Q-30,230 -18,248 Q4,224 0,194 Q8,222 22,238 Q40,212 28,184 Q40,204 56,220 Q66,190 48,168 Q62,184 80,196 Q84,164 62,148 Q44,136 16,156 Z" fill="url(#p3-wB)" opacity={0.9}/>
        <Path d="M584,84 Q624,60 660,28 Q642,20 622,38 Q630,10 618,-8 Q596,16 600,46 Q592,18 578,2 Q560,28 572,56 Q560,34 544,20 Q534,50 552,72 Q538,56 520,44 Q516,76 538,92 Q556,104 584,84 Z" fill="url(#p3-wB)"/>
        <Path d="M584,156 Q624,180 660,212 Q642,220 622,202 Q630,230 618,248 Q596,224 600,194 Q592,222 578,238 Q560,212 572,184 Q560,204 544,220 Q534,190 552,168 Q538,184 520,196 Q516,164 538,148 Q556,136 584,156 Z" fill="url(#p3-wB)" opacity={0.9}/>
        <Path d="M-22,38 Q-4,58 -2,84" fill="none" stroke="rgba(160,220,255,0.5)" strokeWidth={1.1}/>
        <Path d="M0,46 Q10,64 8,84" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.1}/>
        <Path d="M28,56 Q32,68 30,84" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1}/>
        <Path d="M-22,202 Q-4,182 -2,156" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.1}/>
        <Path d="M0,194 Q10,176 8,156" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1}/>
      </G>

      {/* WING LAYER A (closest, brightest) */}
      <G opacity={0.88}>
        <Path d="M22,100 Q-10,76 -40,46 Q-24,36 -6,54 Q-12,28 0,8 Q18,32 14,62 Q22,36 36,20 Q52,46 40,76 Q52,54 68,40 Q76,68 58,90 Q72,74 90,62 Q92,96 68,112 Q50,122 22,100 Z" fill="url(#p3-wA)"/>
        <Path d="M22,140 Q-10,164 -40,194 Q-24,204 -6,186 Q-12,212 0,232 Q18,208 14,178 Q22,204 36,220 Q52,194 40,164 Q52,186 68,200 Q76,172 58,150 Q72,166 90,178 Q92,144 68,128 Q50,118 22,140 Z" fill="url(#p3-wA)" opacity={0.85}/>
        <Path d="M-6,54 Q8,70 6,100" fill="none" stroke="rgba(190,235,255,0.55)" strokeWidth={1.3}/>
        <Path d="M14,62 Q22,78 20,100" fill="none" stroke="rgba(190,235,255,0.5)" strokeWidth={1.3}/>
        <Path d="M40,76 Q44,86 42,100" fill="none" stroke="rgba(190,235,255,0.45)" strokeWidth={1.2}/>
        <Path d="M58,90 Q58,96 58,100" fill="none" stroke="rgba(190,235,255,0.4)" strokeWidth={1}/>
        <Path d="M-6,186 Q8,170 6,140" fill="none" stroke="rgba(190,235,255,0.5)" strokeWidth={1.3}/>
        <Path d="M14,178 Q22,162 20,140" fill="none" stroke="rgba(190,235,255,0.45)" strokeWidth={1.2}/>
        <Path d="M40,164 Q44,154 42,140" fill="none" stroke="rgba(190,235,255,0.4)" strokeWidth={1}/>

        <Path d="M578,100 Q610,76 640,46 Q624,36 606,54 Q612,28 600,8 Q582,32 586,62 Q578,36 564,20 Q548,46 560,76 Q548,54 532,40 Q524,68 542,90 Q528,74 510,62 Q508,96 532,112 Q550,122 578,100 Z" fill="url(#p3-wA)"/>
        <Path d="M578,140 Q610,164 640,194 Q624,204 606,186 Q612,212 600,232 Q582,208 586,178 Q578,204 564,220 Q548,194 560,164 Q548,186 532,200 Q524,172 542,150 Q528,166 510,178 Q508,144 532,128 Q550,118 578,140 Z" fill="url(#p3-wA)" opacity={0.85}/>
        <Path d="M606,54 Q592,70 594,100" fill="none" stroke="rgba(190,235,255,0.55)" strokeWidth={1.3}/>
        <Path d="M586,62 Q578,78 580,100" fill="none" stroke="rgba(190,235,255,0.5)" strokeWidth={1.3}/>
        <Path d="M560,76 Q556,86 558,100" fill="none" stroke="rgba(190,235,255,0.45)" strokeWidth={1.2}/>
        <Path d="M542,90 Q542,96 542,100" fill="none" stroke="rgba(190,235,255,0.4)" strokeWidth={1}/>
        <Path d="M606,186 Q592,170 594,140" fill="none" stroke="rgba(190,235,255,0.5)" strokeWidth={1.3}/>
        <Path d="M586,178 Q578,162 580,140" fill="none" stroke="rgba(190,235,255,0.45)" strokeWidth={1.2}/>
        <Path d="M560,164 Q556,154 558,140" fill="none" stroke="rgba(190,235,255,0.4)" strokeWidth={1}/>
      </G>

      {/* CARD */}
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#p3-bg)"/>
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#p3-sh)"/>

      <G transform="translate(72,120)">
        <Circle r={48} fill="url(#p3-ic)" />
        <Circle r={48} fill="none" stroke="#80C4EC" strokeWidth={2} />
        <Circle r={40} fill="none" stroke="rgba(160,220,255,0.35)" strokeWidth={1} strokeDasharray="3,4"/>
        <Line x1={0} y1={-26} x2={0} y2={26} stroke="#3A7898" strokeWidth={5} strokeLinecap="round"/>
        <Line x1={-22} y1={-13} x2={22} y2={13} stroke="#3A7898" strokeWidth={5} strokeLinecap="round"/>
        <Line x1={22} y1={-13} x2={-22} y2={13} stroke="#3A7898" strokeWidth={5} strokeLinecap="round"/>
        <Circle cx={0} cy={-26} r={5} fill="#B0D8F0"/>
        <Circle cx={0} cy={26} r={5} fill="#B0D8F0"/>
        <Circle cx={-22} cy={-13} r={5} fill="#B0D8F0"/>
        <Circle cx={22} cy={13} r={5} fill="#B0D8F0"/>
        <Circle cx={22} cy={-13} r={5} fill="#B0D8F0"/>
        <Circle cx={-22} cy={13} r={5} fill="#B0D8F0"/>
        <Circle cx={0} cy={0} r={8} fill="#D8EEFF"/>
        <Circle cx={0} cy={0} r={8} fill="none" stroke="#80B8D8" strokeWidth={1.5}/>
        <Line x1={0} y1={-15} x2={9} y2={-12} stroke="#7AB4D4" strokeWidth={2.5} strokeLinecap="round"/>
        <Line x1={0} y1={-15} x2={-9} y2={-12} stroke="#7AB4D4" strokeWidth={2.5} strokeLinecap="round"/>
        <Line x1={13} y1={7} x2={13} y2={-1} stroke="#7AB4D4" strokeWidth={2.5} strokeLinecap="round"/>
        <Line x1={-13} y1={7} x2={-13} y2={-1} stroke="#7AB4D4" strokeWidth={2.5} strokeLinecap="round"/>
        <Polygon points="0,-38 4,-30 -4,-30" fill="#B8E0F8"/>
        <Polygon points="-14,-34 -11,-27 -17,-27" fill="#A0CCE8"/>
        <Polygon points="14,-34 17,-27 11,-27" fill="#A0CCE8"/>
      </G>
    </>
  );
}

function renderDiamondSvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="d4-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#0E3868" />
          <Stop offset="50%" stopColor="#082858" />
          <Stop offset="100%" stopColor="#041440" />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-sh" x1="0%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#60B0FF" stopOpacity={0.45} />
          <Stop offset="100%" stopColor="#020A20" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#A8DCFF" />
          <Stop offset="40%" stopColor="#58A8F0" />
          <Stop offset="100%" stopColor="#1060C8" />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-gm" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" />
          <Stop offset="30%" stopColor="#C0EEFF" />
          <Stop offset="70%" stopColor="#60C0F8" />
          <Stop offset="100%" stopColor="#1060B8" />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-fc" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.9} />
          <Stop offset="100%" stopColor="#80C8FF" stopOpacity={0.5} />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-wA" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#C0E8FF" stopOpacity={0.95} />
          <Stop offset="50%" stopColor="#6090D8" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#1030A0" stopOpacity={0.04} />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-wB" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#90C8FF" stopOpacity={0.78} />
          <Stop offset="100%" stopColor="#0828A0" stopOpacity={0.04} />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-wC" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#68A8F0" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#041880" stopOpacity={0.02} />
        </SvgLinearGradient>
        <SvgLinearGradient id="d4-wD" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#4080D8" stopOpacity={0.35} />
          <Stop offset="100%" stopColor="#020A60" stopOpacity={0.01} />
        </SvgLinearGradient>
      </Defs>

      {/* Gem sparkles far out */}
      <Path d="M-100,90 L-98,98 L-90,102 L-98,106 L-100,114 L-102,106 L-110,102 L-102,98 Z" fill="rgba(160,220,255,0.65)"/>
      <Path d="M-90,150 L-88,157 L-82,160 L-88,163 L-90,170 L-92,163 L-98,160 L-92,157 Z" fill="rgba(160,220,255,0.5)"/>
      <Path d="M700,90 L702,98 L708,102 L702,106 L700,114 L698,106 L692,102 L698,98 Z" fill="rgba(160,220,255,0.65)"/>
      <Path d="M690,150 L692,157 L696,160 L692,163 L690,170 L688,163 L684,160 L688,157 Z" fill="rgba(160,220,255,0.5)"/>
      <Path d="M-80,40 L-79,44 L-75,46 L-79,48 L-80,52 L-81,48 L-85,46 L-81,44 Z" fill="rgba(140,210,255,0.5)"/>
      <Path d="M680,40 L681,44 L685,46 L681,48 L680,52 L679,48 L675,46 L679,44 Z" fill="rgba(140,210,255,0.5)"/>
      <Path d="M200,-40 L201,-36 L205,-34 L201,-32 L200,-28 L199,-32 L195,-34 L199,-36 Z" fill="rgba(160,220,255,0.55)"/>
      <Path d="M300,-60 L302,-54 L308,-51 L302,-48 L300,-42 L298,-48 L292,-51 L298,-54 Z" fill="rgba(180,235,255,0.6)"/>
      <Path d="M400,-40 L401,-36 L405,-34 L401,-32 L400,-28 L399,-32 L395,-34 L399,-36 Z" fill="rgba(160,220,255,0.55)"/>

      {/* LAYER D (outermost) */}
      <G opacity={0.3}>
        <Path d="M8,60 Q-60,24 -110,-20 Q-84,-34 -58,-10 Q-76,-46 -60,-78 Q-28,-50 -36,-12 Q-24,-50 -4,-74 Q20,-40 4,8 Q20,-28 44,-52 Q64,-16 44,28 Q62,-2 86,-24 Q96,18 70,50 Q88,28 112,8 Q116,50 86,74 Q60,92 8,60 Z" fill="url(#d4-wD)"/>
        <Path d="M8,180 Q-60,216 -110,260 Q-84,274 -58,250 Q-76,286 -60,318 Q-28,290 -36,252 Q-24,290 -4,314 Q20,280 4,232 Q20,268 44,292 Q64,256 44,212 Q62,242 86,264 Q96,222 70,190 Q88,212 112,232 Q116,190 86,166 Q60,148 8,180 Z" fill="url(#d4-wD)" opacity={0.8}/>
        <Path d="M592,60 Q660,24 710,-20 Q684,-34 658,-10 Q676,-46 660,-78 Q628,-50 636,-12 Q624,-50 604,-74 Q580,-40 596,8 Q580,-28 556,-52 Q536,-16 556,28 Q538,-2 514,-24 Q504,18 530,50 Q512,28 488,8 Q484,50 514,74 Q540,92 592,60 Z" fill="url(#d4-wD)"/>
        <Path d="M592,180 Q660,216 710,260 Q684,274 658,250 Q676,286 660,318 Q628,290 636,252 Q624,290 604,314 Q580,280 596,232 Q580,268 556,292 Q536,256 556,212 Q538,242 514,264 Q504,222 530,190 Q512,212 488,232 Q484,190 514,166 Q540,148 592,180 Z" fill="url(#d4-wD)" opacity={0.8}/>
      </G>

      {/* LAYER C */}
      <G opacity={0.42}>
        <Path d="M14,72 Q-46,38 -90,-4 Q-68,-16 -46,4 Q-62,-30 -46,-60 Q-18,-34 -24,4 Q-14,-34 4,-56 Q24,-24 10,20 Q26,-12 48,-36 Q66,-2 46,38 Q62,12 84,-8 Q94,28 68,58 Q84,38 106,20 Q108,60 80,80 Q58,96 14,72 Z" fill="url(#d4-wC)"/>
        <Path d="M14,168 Q-46,202 -90,244 Q-68,256 -46,236 Q-62,270 -46,300 Q-18,274 -24,236 Q-14,274 4,296 Q24,264 10,220 Q26,252 48,276 Q66,240 46,200 Q62,228 84,248 Q94,208 68,178 Q84,200 106,220 Q108,180 80,160 Q58,144 14,168 Z" fill="url(#d4-wC)" opacity={0.85}/>
        <Path d="M586,72 Q646,38 690,-4 Q668,-16 646,4 Q662,-30 646,-60 Q618,-34 624,4 Q614,-34 596,-56 Q576,-24 590,20 Q574,-12 552,-36 Q536,-2 554,38 Q538,12 516,-8 Q506,28 532,58 Q516,38 494,20 Q492,60 520,80 Q542,96 586,72 Z" fill="url(#d4-wC)"/>
        <Path d="M586,168 Q646,202 690,244 Q668,256 646,236 Q662,270 646,300 Q618,274 624,236 Q614,274 596,296 Q576,264 590,220 Q574,252 552,276 Q534,240 554,200 Q538,228 516,248 Q506,208 532,178 Q516,200 494,220 Q492,180 520,160 Q542,144 586,168 Z" fill="url(#d4-wC)" opacity={0.85}/>
      </G>

      {/* LAYER B */}
      <G opacity={0.65}>
        <Path d="M18,86 Q-32,56 -72,20 Q-52,10 -30,30 Q-40,2 -26,-22 Q0,4 -4,38 Q6,6 24,-14 Q42,18 26,52 Q42,24 64,6 Q74,40 52,66 Q68,46 90,32 Q94,68 68,88 Q48,104 18,86 Z" fill="url(#d4-wB)"/>
        <Path d="M18,154 Q-32,184 -72,220 Q-52,230 -30,210 Q-40,238 -26,262 Q0,236 -4,202 Q6,234 24,254 Q42,222 26,188 Q42,216 64,234 Q74,200 52,174 Q68,194 90,208 Q94,172 68,152 Q48,136 18,154 Z" fill="url(#d4-wB)" opacity={0.9}/>
        <Path d="M-30,30 Q-8,52 -8,86" fill="none" stroke="rgba(160,220,255,0.5)" strokeWidth={1.2}/>
        <Path d="M-4,38 Q8,60 6,86" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.2}/>
        <Path d="M26,52 Q30,66 28,86" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1.1}/>
        <Path d="M52,66 Q52,76 52,86" fill="none" stroke="rgba(160,220,255,0.35)" strokeWidth={1}/>
        <Path d="M-30,210 Q-8,188 -8,154" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.2}/>
        <Path d="M-4,202 Q8,180 6,154" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1.1}/>
        <Path d="M26,188 Q30,174 28,154" fill="none" stroke="rgba(160,220,255,0.35)" strokeWidth={1}/>

        <Path d="M582,86 Q632,56 672,20 Q652,10 630,30 Q640,2 626,-22 Q600,4 604,38 Q594,6 576,-14 Q558,18 574,52 Q558,24 536,6 Q526,40 548,66 Q532,46 510,32 Q506,68 532,88 Q552,104 582,86 Z" fill="url(#d4-wB)"/>
        <Path d="M582,154 Q632,184 672,220 Q652,230 630,210 Q640,238 626,262 Q600,236 604,202 Q594,234 576,254 Q558,222 574,188 Q558,216 536,234 Q526,200 548,174 Q532,194 510,208 Q506,172 532,152 Q552,136 582,154 Z" fill="url(#d4-wB)" opacity={0.9}/>
        <Path d="M630,30 Q608,52 608,86" fill="none" stroke="rgba(160,220,255,0.5)" strokeWidth={1.2}/>
        <Path d="M604,38 Q592,60 594,86" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.2}/>
        <Path d="M574,52 Q570,66 572,86" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1.1}/>
        <Path d="M548,66 Q548,76 548,86" fill="none" stroke="rgba(160,220,255,0.35)" strokeWidth={1}/>
        <Path d="M630,210 Q608,188 608,154" fill="none" stroke="rgba(160,220,255,0.45)" strokeWidth={1.2}/>
        <Path d="M604,202 Q592,180 594,154" fill="none" stroke="rgba(160,220,255,0.4)" strokeWidth={1.1}/>
        <Path d="M574,188 Q570,174 572,154" fill="none" stroke="rgba(160,220,255,0.35)" strokeWidth={1}/>
      </G>

      {/* LAYER A (closest, brightest) */}
      <G opacity={0.9}>
        <Path d="M24,102 Q-14,74 -46,40 Q-28,30 -10,50 Q-18,20 -4,0 Q18,26 12,58 Q22,28 38,10 Q56,40 42,72 Q56,48 76,32 Q86,64 64,88 Q80,70 102,56 Q104,94 78,112 Q56,126 24,102 Z" fill="url(#d4-wA)"/>
        <Path d="M24,138 Q-14,166 -46,200 Q-28,210 -10,190 Q-18,220 -4,240 Q18,214 12,182 Q22,212 38,230 Q56,200 42,168 Q56,194 76,208 Q86,176 64,152 Q80,170 102,184 Q104,146 78,128 Q56,114 24,138 Z" fill="url(#d4-wA)" opacity={0.88}/>
        <Path d="M-10,50 Q6,70 4,102" fill="none" stroke="rgba(200,238,255,0.6)" strokeWidth={1.4}/>
        <Path d="M12,58 Q22,78 20,102" fill="none" stroke="rgba(200,238,255,0.55)" strokeWidth={1.4}/>
        <Path d="M42,72 Q46,84 44,102" fill="none" stroke="rgba(200,238,255,0.5)" strokeWidth={1.3}/>
        <Path d="M64,88 Q64,96 64,102" fill="none" stroke="rgba(200,238,255,0.45)" strokeWidth={1.1}/>
        <Path d="M-10,190 Q6,170 4,138" fill="none" stroke="rgba(200,238,255,0.55)" strokeWidth={1.4}/>
        <Path d="M12,182 Q22,162 20,138" fill="none" stroke="rgba(200,238,255,0.5)" strokeWidth={1.3}/>
        <Path d="M42,168 Q46,156 44,138" fill="none" stroke="rgba(200,238,255,0.45)" strokeWidth={1.2}/>

        <Path d="M576,102 Q614,74 646,40 Q628,30 610,50 Q618,20 604,0 Q582,26 588,58 Q578,28 562,10 Q544,40 558,72 Q544,48 524,32 Q514,64 536,88 Q520,70 498,56 Q496,94 522,112 Q544,126 576,102 Z" fill="url(#d4-wA)"/>
        <Path d="M576,138 Q614,166 646,200 Q628,210 610,190 Q618,220 604,240 Q582,214 588,182 Q578,212 562,230 Q544,200 558,168 Q544,194 524,208 Q514,176 536,152 Q520,170 498,184 Q496,146 522,128 Q544,114 576,138 Z" fill="url(#d4-wA)" opacity={0.88}/>
        <Path d="M610,50 Q594,70 596,102" fill="none" stroke="rgba(200,238,255,0.6)" strokeWidth={1.4}/>
        <Path d="M588,58 Q578,78 580,102" fill="none" stroke="rgba(200,238,255,0.55)" strokeWidth={1.4}/>
        <Path d="M558,72 Q554,84 556,102" fill="none" stroke="rgba(200,238,255,0.5)" strokeWidth={1.3}/>
        <Path d="M536,88 Q536,96 536,102" fill="none" stroke="rgba(200,238,255,0.45)" strokeWidth={1.1}/>
        <Path d="M610,190 Q594,170 596,138" fill="none" stroke="rgba(200,238,255,0.6)" strokeWidth={1.4}/>
        <Path d="M588,182 Q578,162 580,138" fill="none" stroke="rgba(200,238,255,0.5)" strokeWidth={1.3}/>
        <Path d="M558,168 Q554,156 556,138" fill="none" stroke="rgba(200,238,255,0.45)" strokeWidth={1.2}/>
      </G>

      {/* CARD */}
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#d4-bg)"/>
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#d4-sh)"/>

      <G transform="translate(72,120)">
        <Circle r={50} fill="url(#d4-ic)" />
        <Circle r={50} fill="none" stroke="#60B0F0" strokeWidth={2} />
        <Circle r={42} fill="none" stroke="rgba(140,210,255,0.4)" strokeWidth={1} strokeDasharray="3,4"/>
        <Polygon points="0,-32 28,0 0,34 -28,0" fill="url(#d4-gm)" />
        <Polygon points="0,-32 28,0 0,-6" fill="url(#d4-fc)" />
        <Polygon points="28,0 0,34 0,-6" fill="#80C8F8" fillOpacity={0.4} />
        <Polygon points="0,34 -28,0 0,-6" fill="#C0EEFF" fillOpacity={0.5} />
        <Polygon points="-28,0 0,-32 0,-6" fill="url(#d4-fc)" />
        <Polygon points="0,-18 16,0 0,19 -16,0" fill="url(#d4-gm)" />
        <Polygon points="0,-32 28,0 0,34 -28,0" fill="none" stroke="#C0EEFF" strokeWidth={1.5}/>
        <Line x1={0} y1={-32} x2={0} y2={-18} stroke="#FFFFFF" strokeWidth={1.5} strokeOpacity={0.7}/>
        <Line x1={28} y1={0} x2={16} y2={0} stroke="#FFFFFF" strokeWidth={1.5} strokeOpacity={0.7}/>
        <Line x1="-28" y1={0} x2="-16" y2={0} stroke="#FFFFFF" strokeWidth={1.5} strokeOpacity={0.7}/>
        <Polygon points="0,-42 4,-33 -4,-33" fill="#A0D8FF"/>
        <Polygon points="-15,-38 -12,-30 -18,-30" fill="#88C8F8"/>
        <Polygon points="15,-38 18,-30 12,-30" fill="#88C8F8"/>
        <Path d="M32,-28 L33,-25 L36,-24 L33,-23 L32,-20 L31,-23 L28,-24 L31,-25 Z" fill="white"/>
      </G>
    </>
  );
}

function renderRubySvgLocal() {
  return (
    <>
      <Defs>
        <SvgLinearGradient id="r5-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#7A0818" />
          <Stop offset="50%" stopColor="#5A0412" />
          <Stop offset="100%" stopColor="#38000C" />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-sh" x1="0%" y1="0%" x2="80%" y2="100%">
          <Stop offset="0%" stopColor="#FF5070" stopOpacity={0.5} />
          <Stop offset="100%" stopColor="#180008" stopOpacity={0} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-ic" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF5070" />
          <Stop offset="50%" stopColor="#C01030" />
          <Stop offset="100%" stopColor="#780018" />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-gm" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#FF8090" />
          <Stop offset="50%" stopColor="#E02040" />
          <Stop offset="100%" stopColor="#880018" />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-in" x1="20%" y1="10%" x2="80%" y2="90%">
          <Stop offset="0%" stopColor="#FF9090" stopOpacity={0.7} />
          <Stop offset="100%" stopColor="#800010" stopOpacity={0.3} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-wA" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFA0A8" stopOpacity={0.95} />
          <Stop offset="50%" stopColor="#D04060" stopOpacity={0.55} />
          <Stop offset="100%" stopColor="#700014" stopOpacity={0.04} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-wB" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FF8090" stopOpacity={0.8} />
          <Stop offset="100%" stopColor="#600010" stopOpacity={0.03} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-wC" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#F06070" stopOpacity={0.58} />
          <Stop offset="100%" stopColor="#500010" stopOpacity={0.02} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-wD" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#D04050" stopOpacity={0.38} />
          <Stop offset="100%" stopColor="#380008" stopOpacity={0.01} />
        </SvgLinearGradient>
        <SvgLinearGradient id="r5-wE" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A02030" stopOpacity={0.22} />
          <Stop offset="100%" stopColor="#200004" stopOpacity={0.005} />
        </SvgLinearGradient>
      </Defs>

      {/* Blood moon glow behind card */}
      <Circle cx={300} cy={120} r={240} fill="rgba(200,10,30,0.06)"/>
      <Circle cx={300} cy={120} r={180} fill="rgba(220,20,40,0.05)"/>

      {/* Jewel sparkles scattered far */}
      <Path d="M-140,60 L-138,68 L-130,72 L-138,76 L-140,84 L-142,76 L-150,72 L-142,68 Z" fill="rgba(255,150,160,0.65)"/>
      <Path d="M-130,130 L-128,137 L-122,140 L-128,143 L-130,150 L-132,143 L-138,140 L-132,137 Z" fill="rgba(255,140,155,0.55)"/>
      <Path d="M-120,190 L-118,196 L-113,199 L-118,202 L-120,208 L-122,202 L-127,199 L-122,196 Z" fill="rgba(255,130,150,0.45)"/>
      <Path d="M740,60 L742,68 L748,72 L742,76 L740,84 L738,76 L732,72 L738,68 Z" fill="rgba(255,150,160,0.65)"/>
      <Path d="M730,130 L732,137 L736,140 L732,143 L730,150 L728,143 L724,140 L728,137 Z" fill="rgba(255,140,155,0.55)"/>
      <Path d="M720,190 L722,196 L727,199 L722,202 L720,208 L718,202 L713,199 L718,196 Z" fill="rgba(255,130,150,0.45)"/>

      <Path d="M150,-60 L152,-54 L158,-51 L152,-48 L150,-42 L148,-48 L142,-51 L148,-54 Z" fill="rgba(255,160,170,0.6)"/>
      <Path d="M300,-80 L302,-72 L310,-68 L302,-64 L300,-56 L298,-64 L290,-68 L298,-72 Z" fill="rgba(255,170,180,0.65)"/>
      <Path d="M450,-60 L452,-54 L458,-51 L452,-48 L450,-42 L448,-48 L442,-51 L448,-54 Z" fill="rgba(255,160,170,0.6)"/>
      <Path d="M150,300 L152,306 L158,309 L152,312 L150,318 L148,312 L142,309 L148,306 Z" fill="rgba(255,130,145,0.5)"/>
      <Path d="M300,315 L302,321 L308,324 L302,327 L300,333 L298,327 L292,324 L298,321 Z" fill="rgba(255,140,155,0.55)"/>
      <Path d="M450,300 L452,306 L458,309 L452,312 L450,318 L448,312 L442,309 L448,306 Z" fill="rgba(255,130,145,0.5)"/>

      {/* LAYER E (outermost, faintest) */}
      <G opacity={0.25}>
        <Path d="M4,50 Q-80,4 -140,-54 Q-108,-72 -76,-44 Q-100,-88 -78,-124 Q-40,-88 -50,-40 Q-36,-84 -12,-114 Q18,-72 0,-12 Q18,-60 50,-92 Q78,-46 52,14 Q76,-28 108,-60 Q124,-6 90,40 Q114,10 148,-16 Q152,38 112,72 Q80,98 4,50 Z" fill="url(#r5-wE)"/>
        <Path d="M4,190 Q-80,236 -140,294 Q-108,312 -76,284 Q-100,328 -78,364 Q-40,328 -50,280 Q-36,324 -12,354 Q18,312 0,252 Q18,300 50,332 Q78,286 52,226 Q76,268 108,300 Q124,246 90,200 Q114,230 148,256 Q152,202 112,168 Q80,142 4,190 Z" fill="url(#r5-wE)" opacity={0.85}/>
        <Path d="M596,50 Q680,4 740,-54 Q708,-72 676,-44 Q700,-88 678,-124 Q640,-88 650,-40 Q636,-84 612,-114 Q582,-72 600,-12 Q582,-60 550,-92 Q522,-46 548,14 Q524,-28 492,-60 Q476,-6 510,40 Q486,10 452,-16 Q448,38 488,72 Q520,98 596,50 Z" fill="url(#r5-wE)"/>
        <Path d="M596,190 Q680,236 740,294 Q708,312 676,284 Q700,328 678,364 Q640,328 650,280 Q636,324 612,354 Q582,312 600,252 Q582,300 550,332 Q522,286 548,226 Q524,268 492,300 Q476,246 510,200 Q486,230 452,256 Q448,202 488,168 Q520,142 596,190 Z" fill="url(#r5-wE)" opacity={0.85}/>
      </G>

      {/* LAYER D */}
      <G opacity={0.35}>
        <Path d="M8,62 Q-60,20 -110,-32 Q-84,-48 -56,-20 Q-76,-60 -54,-92 Q-22,-60 -30,-18 Q-18,-58 4,-84 Q28,-44 12,6 Q30,-36 58,-66 Q80,-26 58,22 Q80,-12 110,-38 Q122,8 90,46 Q112,18 140,-4 Q144,42 110,72 Q84,94 8,62 Z" fill="url(#r5-wD)"/>
        <Path d="M8,178 Q-60,220 -110,272 Q-84,288 -56,260 Q-76,300 -54,332 Q-22,300 -30,258 Q-18,298 4,324 Q28,284 12,234 Q30,274 58,304 Q80,264 58,218 Q80,252 110,278 Q122,232 90,194 Q112,222 140,244 Q144,198 110,168 Q84,146 8,178 Z" fill="url(#r5-wD)" opacity={0.88}/>
        <Path d="M592,62 Q660,20 710,-32 Q684,-48 656,-20 Q676,-60 654,-92 Q622,-60 630,-18 Q618,-58 596,-84 Q572,-44 588,6 Q570,-36 542,-66 Q520,-26 542,22 Q520,-12 490,-38 Q478,8 510,46 Q488,18 460,-4 Q456,42 490,72 Q516,94 592,62 Z" fill="url(#r5-wD)"/>
        <Path d="M592,178 Q660,220 710,272 Q684,288 656,260 Q676,300 654,332 Q622,300 630,258 Q618,298 596,324 Q572,284 588,234 Q570,274 542,304 Q520,264 542,218 Q520,252 490,278 Q478,232 510,194 Q488,222 460,244 Q456,198 490,168 Q516,146 592,178 Z" fill="url(#r5-wD)" opacity={0.88}/>
      </G>

      {/* LAYER C */}
      <G opacity={0.48}>
        <Path d="M12,74 Q-44,36 -88,-8 Q-66,-22 -42,0 Q-56,-36 -38,-64 Q-10,-34 -16,8 Q-6,-34 14,-58 Q36,-20 20,26 Q36,-10 62,-34 Q76,6 54,42 Q70,18 96,4 Q100,46 72,70 Q52,88 12,74 Z" fill="url(#r5-wC)"/>
        <Path d="M12,166 Q-44,204 -88,248 Q-66,262 -42,240 Q-56,276 -38,304 Q-10,274 -16,232 Q-6,274 14,298 Q36,258 20,214 Q36,250 62,274 Q76,234 54,200 Q70,218 96,236 Q100,194 72,166 Q52,152 12,166 Z" fill="url(#r5-wC)" opacity={0.9}/>
        <Path d="M588,74 Q644,36 688,-8 Q666,-22 642,0 Q656,-36 638,-64 Q610,-34 616,8 Q606,-34 586,-58 Q564,-20 580,26 Q564,-10 538,-34 Q524,6 546,42 Q530,18 504,4 Q500,46 528,70 Q548,88 588,74 Z" fill="url(#r5-wC)"/>
        <Path d="M588,166 Q644,204 688,248 Q666,262 642,240 Q656,276 638,304 Q610,274 616,232 Q606,274 586,298 Q564,258 580,214 Q564,250 538,274 Q524,234 546,200 Q530,218 504,236 Q500,194 528,166 Q548,152 588,166 Z" fill="url(#r5-wC)" opacity={0.9}/>
      </G>

      {/* LAYER B */}
      <G opacity={0.68}>
        <Path d="M18,88 Q-26,58 -64,22 Q-44,12 -24,32 Q-32,4 -18,-18 Q6,8 0,42 Q10,8 28,-12 Q46,20 30,56 Q46,28 68,12 Q78,48 56,74 Q72,50 96,36 Q100,76 72,96 Q52,110 18,88 Z" fill="url(#r5-wB)"/>
        <Path d="M18,152 Q-26,182 -64,218 Q-44,228 -24,208 Q-32,236 -18,258 Q6,232 0,198 Q10,232 28,252 Q46,220 30,184 Q46,210 68,228 Q78,192 56,166 Q72,186 96,200 Q100,160 72,142 Q52,128 18,152 Z" fill="url(#r5-wB)" opacity={0.92}/>
        <Path d="M-24,32 Q-4,54 -4,88" fill="none" stroke="rgba(255,150,165,0.5)" strokeWidth={1.2}/>
        <Path d="M0,42 Q10,62 8,88" fill="none" stroke="rgba(255,150,165,0.45)" strokeWidth={1.2}/>
        <Path d="M30,56 Q34,70 32,88" fill="none" stroke="rgba(255,150,165,0.4)" strokeWidth={1.1}/>
        <Path d="M56,74 Q56,82 56,88" fill="none" stroke="rgba(255,150,165,0.35)" strokeWidth={1}/>
        <Path d="M-24,208 Q-4,186 -4,152" fill="none" stroke="rgba(255,150,165,0.45)" strokeWidth={1.2}/>
        <Path d="M0,198 Q10,178 8,152" fill="none" stroke="rgba(255,150,165,0.4)" strokeWidth={1.1}/>
        <Path d="M30,184 Q34,170 32,152" fill="none" stroke="rgba(255,150,165,0.35)" strokeWidth={1}/>

        <Path d="M582,88 Q626,58 664,22 Q644,12 624,32 Q632,4 618,-18 Q594,8 600,42 Q590,8 572,-12 Q554,20 570,56 Q554,28 532,12 Q522,48 544,74 Q528,50 504,36 Q500,76 528,96 Q548,110 582,88 Z" fill="url(#r5-wB)"/>
        <Path d="M582,152 Q626,182 664,218 Q644,228 624,208 Q632,236 618,258 Q594,232 600,198 Q590,232 572,252 Q554,220 570,184 Q554,210 532,228 Q522,192 544,166 Q528,186 504,200 Q500,160 528,142 Q548,128 582,152 Z" fill="url(#r5-wB)" opacity={0.92}/>
        <Path d="M624,32 Q604,54 604,88" fill="none" stroke="rgba(255,150,165,0.5)" strokeWidth={1.2}/>
        <Path d="M600,42 Q590,62 592,88" fill="none" stroke="rgba(255,150,165,0.45)" strokeWidth={1.2}/>
        <Path d="M570,56 Q566,70 568,88" fill="none" stroke="rgba(255,150,165,0.4)" strokeWidth={1.1}/>
        <Path d="M544,74 Q544,82 544,88" fill="none" stroke="rgba(255,150,165,0.35)" strokeWidth={1}/>
        <Path d="M624,208 Q604,186 604,152" fill="none" stroke="rgba(255,150,165,0.45)" strokeWidth={1.2}/>
        <Path d="M600,198 Q590,178 592,152" fill="none" stroke="rgba(255,150,165,0.4)" strokeWidth={1.1}/>
        <Path d="M570,184 Q566,170 568,152" fill="none" stroke="rgba(255,150,165,0.35)" strokeWidth={1}/>
      </G>

      {/* LAYER A (closest, brightest) */}
      <G opacity={0.92}>
        <Path d="M24,104 Q-12,76 -44,42 Q-26,30 -8,50 Q-16,20 -2,0 Q20,26 14,60 Q24,28 40,10 Q58,40 44,72 Q58,48 78,32 Q88,64 66,88 Q82,70 106,56 Q108,96 80,114 Q58,128 24,104 Z" fill="url(#r5-wA)"/>
        <Path d="M24,136 Q-12,164 -44,198 Q-26,210 -8,190 Q-16,220 -2,240 Q20,214 14,180 Q24,212 40,230 Q58,200 44,168 Q58,194 78,208 Q88,176 66,152 Q82,170 106,184 Q108,144 80,126 Q58,112 24,136 Z" fill="url(#r5-wA)" opacity={0.9}/>
        <Path d="M-8,50 Q8,72 6,104" fill="none" stroke="rgba(255,180,190,0.62)" strokeWidth={1.5}/>
        <Path d="M14,60 Q24,80 22,104" fill="none" stroke="rgba(255,180,190,0.56)" strokeWidth={1.5}/>
        <Path d="M44,72 Q48,86 46,104" fill="none" stroke="rgba(255,180,190,0.5)" strokeWidth={1.4}/>
        <Path d="M66,88 Q66,96 66,104" fill="none" stroke="rgba(255,180,190,0.44)" strokeWidth={1.2}/>
        <Path d="M-8,190 Q8,168 6,136" fill="none" stroke="rgba(255,180,190,0.56)" strokeWidth={1.5}/>
        <Path d="M14,180 Q24,160 22,136" fill="none" stroke="rgba(255,180,190,0.5)" strokeWidth={1.4}/>
        <Path d="M44,168 Q48,154 46,136" fill="none" stroke="rgba(255,180,190,0.44)" strokeWidth={1.3}/>

        <Path d="M576,104 Q612,76 644,42 Q626,30 608,50 Q616,20 602,0 Q580,26 586,60 Q576,28 560,10 Q542,40 556,72 Q542,48 522,32 Q512,64 534,88 Q518,70 494,56 Q492,96 520,114 Q542,128 576,104 Z" fill="url(#r5-wA)"/>
        <Path d="M576,136 Q612,164 644,198 Q626,210 608,190 Q616,220 602,240 Q580,214 586,180 Q576,212 560,230 Q542,200 556,168 Q542,194 522,208 Q512,176 534,152 Q518,170 494,184 Q492,144 520,126 Q542,112 576,136 Z" fill="url(#r5-wA)" opacity={0.9}/>
        <Path d="M608,50 Q592,72 594,104" fill="none" stroke="rgba(255,180,190,0.62)" strokeWidth={1.5}/>
        <Path d="M586,60 Q576,80 578,104" fill="none" stroke="rgba(255,180,190,0.56)" strokeWidth={1.5}/>
        <Path d="M556,72 Q552,86 554,104" fill="none" stroke="rgba(255,180,190,0.5)" strokeWidth={1.4}/>
        <Path d="M534,88 Q534,96 534,104" fill="none" stroke="rgba(255,180,190,0.44)" strokeWidth={1.2}/>
        <Path d="M608,190 Q592,168 594,136" fill="none" stroke="rgba(255,180,190,0.56)" strokeWidth={1.5}/>
        <Path d="M586,180 Q576,160 578,136" fill="none" stroke="rgba(255,180,190,0.5)" strokeWidth={1.4}/>
        <Path d="M556,168 Q552,154 554,136" fill="none" stroke="rgba(255,180,190,0.44)" strokeWidth={1.3}/>
      </G>

      {/* CARD */}
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#r5-bg)"/>
      <Rect x={0} y={0} width={600} height={240} rx={24} fill="url(#r5-sh)"/>

      <G transform="translate(72,120)">
        <Circle r={50} fill="url(#r5-ic)" />
        <Circle r={50} fill="none" stroke="#C01830" strokeWidth={2.5} />
        <Circle r={42} fill="none" stroke="rgba(255,120,140,0.4)" strokeWidth={1} strokeDasharray="4,3"/>
        <Ellipse cx={0} cy={0} rx={28} ry={23} fill="url(#r5-gm)" />
        <Ellipse cx={0} cy={0} rx={28} ry={23} fill="url(#r5-in)" />
        <Ellipse cx={0} cy={0} rx={28} ry={23} fill="none" stroke="#FF9090" strokeWidth={2}/>
        <Ellipse cx={-4} cy={-4} rx={14} ry={9} fill="#FF7080" fillOpacity={0.5}/>
        <Ellipse cx={-6} cy={-6} rx={7} ry={5} fill="#FF9090" fillOpacity={0.7}/>
        <Line x1={0} y1={-17} x2={0} y2={17} stroke="#FFBBBB" strokeWidth={2} strokeOpacity={0.65}/>
        <Line x1={-15} y1={-8.5} x2={15} y2={8.5} stroke="#FFBBBB" strokeWidth={2} strokeOpacity={0.65}/>
        <Line x1={15} y1={-8.5} x2={-15} y2={8.5} stroke="#FFBBBB" strokeWidth={2} strokeOpacity={0.65}/>
        <Circle cx={0} cy={-25} r={4} fill="#A80020"/>
        <Circle cx={0} cy={25} r={4} fill="#A80020"/>
        <Circle cx={-29} cy={0} r={4} fill="#A80020"/>
        <Circle cx={29} cy={0} r={4} fill="#A80020"/>
        <Circle cx={-21} cy={-18} r={3.5} fill="#980018"/>
        <Circle cx={21} cy={-18} r={3.5} fill="#980018"/>
        <Circle cx={-21} cy={18} r={3.5} fill="#980018"/>
        <Circle cx={21} cy={18} r={3.5} fill="#980018"/>
        <Polygon points="0,-42 4.5,-33 -4.5,-33" fill="#FF8090"/>
        <Polygon points="-15,-38 -12,-30 -18,-30" fill="#FF6878"/>
        <Polygon points="15,-38 18,-30 12,-30" fill="#FF6878"/>
        <Polygon points="-27,-32 -25,-26 -29,-26" fill="#F05060"/>
        <Polygon points="27,-32 29,-26 25,-26" fill="#F05060"/>
        <Circle cx={0} cy={-42} r={3.5} fill="#FFAAAA"/>
        <Path d="M32,-30 L33,-27 L36,-26 L33,-25 L32,-22 L31,-25 L28,-26 L31,-27 Z" fill="white"/>
      </G>
    </>
  );
}

