import MembershipBanner, { getTier, TIERS, Tier } from "@/components/MembershipBanner";
import { useAuth } from "@/context/Auth_Context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
const CARD_H = 200;

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
  const { user } = useAuth();
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
            style={{ height: CARD_H + 24 }}
            renderItem={({ item: tier }) => {
              return (
                <View style={{ width: SW, paddingHorizontal: 20, height: CARD_H + 24, justifyContent: "center" }}>
                  <MembershipBanner
                    earnedPoints={points}
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
