// components/MembershipBanner.tsx
import { FONT_SIZE } from "@/constants/typography";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

export interface Tier {
  name: string;
  min: number;
  bg: readonly [string, string];
  text: string;
  icon: string;
}

// Sorted from highest tier to lowest so getTier() can pick the first match.
export const TIERS: Tier[] = [
  { name: "Ruby", min: 500_000_000, bg: ["#FF0000", "#8B0000"], text: "#fff", icon: "👑" },
  { name: "Kim Cương", min: 200_000_000, bg: ["#B9F2FF", "#7EC8E3"], text: "#1a1a2e", icon: "💎" },
  { name: "Bạch Kim", min: 100_000_000, bg: ["#E5E4E2", "#C8C6C4"], text: "#333", icon: "🌟" },
  { name: "Vàng", min: 50_000_000, bg: ["#FFD700", "#FFA500"], text: "#333", icon: "🥇" },
  { name: "Bạc", min: 10_000_000, bg: ["#C0C0C0", "#A8A8A8"], text: "#333", icon: "🥈" },
  { name: "Đồng", min: 0, bg: ["#CD7F32", "#A0522D"], text: "#fff", icon: "🥉" },
];

const MILESTONES = [0, 10_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000];

export function getTier(earnedPoints: number): Tier {
  return TIERS.find((t) => earnedPoints >= t.min) ?? TIERS[TIERS.length - 1];
}

export function getNextMilestone(earnedPoints: number): number | null {
  return MILESTONES.find((m) => m > earnedPoints) ?? null;
}

const compact = (n: number) => {
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}tr`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
};

const formatPoints = (n: number) => n.toLocaleString("vi-VN");

interface MembershipBannerProps {
  earnedPoints: number;
  name?: string;
  tierOverride?: Tier;
}

export default function MembershipBanner({
  earnedPoints,
  name,
  tierOverride,
}: MembershipBannerProps) {
  const tier = tierOverride ?? getTier(earnedPoints);
  const next = getNextMilestone(tier.min);

  // Progress within the current tier band toward the next milestone.
  const progress =
    next != null
      ? Math.min(
          1,
          Math.max(
            0,
            (earnedPoints - tier.min) / (next - tier.min),
          ),
        )
      : 1;

  const nextTierName =
    next != null ? getTier(next).name : null;

  const greetName = name?.trim() || "Quý khách";

  return (
    <LinearGradient
      colors={tier.bg}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 24,
        padding: 18,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      {/* Header row: greeting with icon/tier name (removed right badge) */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 28, marginRight: 8 }}>{tier.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: tier.text,
                fontSize: FONT_SIZE.xs,
                fontWeight: "600",
                opacity: 0.85,
              }}
            >
              Xin chào, {greetName}
            </Text>
            <Text
              style={{
                color: tier.text,
                fontSize: FONT_SIZE.lg,
                fontWeight: "900",
              }}
            >
              Hạng {tier.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Points */}
      <Text
        style={{
          color: tier.text,
          fontSize: FONT_SIZE.xs,
          fontWeight: "700",
          marginTop: 12,
        }}
      >
        Điểm tích lũy: {formatPoints(earnedPoints)} pts
      </Text>

      {/* Progress bar */}
      {next != null ? (
        <>
          <View
            style={{
              height: 10,
              borderRadius: 999,
              backgroundColor: "rgba(0,0,0,0.18)",
              marginTop: 10,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.9)",
              }}
            />
          </View>
          <Text
            style={{
              color: tier.text,
              fontSize: FONT_SIZE.xs,
              fontWeight: "600",
              marginTop: 8,
              opacity: 0.9,
            }}
          >
            {compact(earnedPoints)}/{compact(next)} → {nextTierName}
          </Text>
        </>
      ) : (
        <Text
          style={{
            color: tier.text,
            fontSize: FONT_SIZE.sm,
            fontWeight: "900",
            marginTop: 10,
          }}
        >
          Hạng cao nhất 🎉
        </Text>
      )}
    </LinearGradient>
  );
}
