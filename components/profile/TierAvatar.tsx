import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Stop } from "react-native-svg";

/** Tên hạng (khớp `TIERS` trong MembershipBanner) → thông số vẽ. */
const TIER_STYLE: Record<
  string,
  { light: string; mid: string; deep: string; feathers: number; scale: number; ring: number }
> = {
  "Đồng": { light: "#FFD9A0", mid: "#E08A2E", deep: "#7A3208", feathers: 0, scale: 0.8, ring: 5 },
  "Bạc": { light: "#F4F8FF", mid: "#A8BCCC", deep: "#4A5E70", feathers: 2, scale: 0.82, ring: 5 },
  "Vàng": { light: "#FFF4B0", mid: "#F0C020", deep: "#8A5A06", feathers: 3, scale: 0.9, ring: 6 },
  "Bạch Kim": { light: "#EAF6FF", mid: "#7CC4F0", deep: "#1E5A86", feathers: 4, scale: 0.98, ring: 6 },
  "Kim Cương": { light: "#FFFFFF", mid: "#8CCBFF", deep: "#1B4FA8", feathers: 5, scale: 1.05, ring: 6 },
  "Ruby": { light: "#FFC2CB", mid: "#FF3050", deep: "#7A0818", feathers: 5, scale: 1.12, ring: 6 },
};

const FEATHER = "M0,0 C 7,-10 9,-36 0,-56 C -9,-36 -7,-10 0,0 Z";
const ANGLES = [-28, -50, -72, -94, -116];
const W = 220;
const H = 150;

interface Props {
  tier: string;
  avatarUrl?: string | null;
  initials: string;
}

/**
 * Avatar có viền màu theo hạng thành viên; hạng càng cao cánh càng nhiều và to
 * (Bạch Kim+ có lấp lánh, Kim Cương/Ruby thêm viên ngọc, Ruby thêm vương miện).
 * Vẽ bằng react-native-svg theo bản thiết kế "AvatarTier".
 */
export default function TierAvatar({ tier, avatarUrl, initials }: Props) {
  const key = TIER_STYLE[tier] ? tier : "Đồng";
  const t = TIER_STYLE[key];
  const id = key.replace(/\s/g, "");
  const high = key === "Kim Cương" || key === "Ruby";
  const sparkle = key === "Bạch Kim" || high;

  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <Defs>
          <LinearGradient id={`fe-${id}`} x1="0" y1="1" x2="0" y2="0">
            <Stop offset="0" stopColor={t.deep} />
            <Stop offset="1" stopColor={t.light} />
          </LinearGradient>
          <LinearGradient id={`rg-${id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={t.light} />
            <Stop offset="0.5" stopColor={t.mid} />
            <Stop offset="1" stopColor={t.deep} />
          </LinearGradient>
          <RadialGradient id={`gl-${id}`} cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor={t.light} stopOpacity="0.55" />
            <Stop offset="1" stopColor={t.light} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {key !== "Đồng" && <Circle cx="110" cy="80" r="70" fill={`url(#gl-${id})`} />}

        {t.feathers > 0 && (
          <>
            <G transform={`translate(80 92) scale(${t.scale})`}>
              {ANGLES.slice(0, t.feathers).map((a) => (
                <Path
                  key={a}
                  d={FEATHER}
                  transform={`rotate(${a})`}
                  fill={`url(#fe-${id})`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={1}
                />
              ))}
            </G>
            <G transform={`translate(140 92) scale(${-t.scale} ${t.scale})`}>
              {ANGLES.slice(0, t.feathers).map((a) => (
                <Path
                  key={a}
                  d={FEATHER}
                  transform={`rotate(${a})`}
                  fill={`url(#fe-${id})`}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={1}
                />
              ))}
            </G>
          </>
        )}

        {high && (
          <>
            <G transform="translate(82 96) scale(0.62)">
              {[-40, -68, -96].map((a) => (
                <Path key={a} d={FEATHER} transform={`rotate(${a})`} fill={t.light} fillOpacity={0.9} />
              ))}
            </G>
            <G transform="translate(138 96) scale(-0.62 0.62)">
              {[-40, -68, -96].map((a) => (
                <Path key={a} d={FEATHER} transform={`rotate(${a})`} fill={t.light} fillOpacity={0.9} />
              ))}
            </G>
          </>
        )}

        <Circle cx="110" cy="80" r="42" fill="#FFFFFF" />
        <Circle cx="110" cy="80" r="42" fill="none" stroke={`url(#rg-${id})`} strokeWidth={t.ring} />

        {sparkle && (
          <G fill="#FFFFFF">
            <Path d="M44 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
            <Path d="M176 30 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6z" />
            <Path d="M186 104 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z" />
            <Path d="M32 110 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z" />
          </G>
        )}

        {key === "Ruby" && (
          <G transform="translate(110 30)">
            <Path
              d="M-18 6 L-14 -12 L-6 -2 L0 -16 L6 -2 L14 -12 L18 6 Z"
              fill={`url(#rg-${id})`}
              stroke="#FFFFFF"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <Circle cx="0" cy="-16" r="2.6" fill="#FFFFFF" />
            <Circle cx="-14" cy="-12" r="2" fill="#FFFFFF" />
            <Circle cx="14" cy="-12" r="2" fill="#FFFFFF" />
          </G>
        )}

        {high && (
          <G transform="translate(110 124)">
            <Path
              d="M-8 -4 L-4 -9 L4 -9 L8 -4 L0 7 Z"
              fill={`url(#rg-${id})`}
              stroke="#FFFFFF"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </G>
        )}
      </Svg>

      <View
        style={{
          position: "absolute",
          left: 74,
          top: 44,
          width: 72,
          height: 72,
          borderRadius: 36,
          overflow: "hidden",
          backgroundColor: "#FDECEE",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 72, height: 72 }} resizeMode="cover" />
        ) : (
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#B30014" }}>{initials}</Text>
        )}
      </View>
    </View>
  );
}
