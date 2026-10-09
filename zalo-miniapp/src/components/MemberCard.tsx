import React, { useRef } from "react";
import logoUrl from "@/static/Logo_BTT-2024.png";
import { Tier, getTier, getNextMilestone, compact, CARD_BG, TIER_ACCENT, PROGRESS_COLORS, TIER_TEXT } from "@/constants/membership";

/**
 * Port từ RedesignedMembershipBanner trong app/(root)/membership.tsx — thẻ
 * hạng thành viên (chip + điểm tích lũy + tên chủ thẻ + thanh tiến độ), dùng
 * chung ở Trang chủ (banner điểm tích lũy) và trang Thẻ thành viên (carousel
 * vuốt ngang). Tách thành component riêng để tránh lặp ~200 dòng code.
 */
function CardBrandMark({ tint }: { tint: string }) {
  return (
    <div className="flex items-center" style={{ gap: 7 }}>
      <img src={logoUrl} alt="" style={{ width: 36, height: 36, objectFit: "contain" }} />
      <span style={{ fontSize: 12.5, color: tint, fontWeight: 800, letterSpacing: 0.2 }}>
        BenThanh Tourist
      </span>
    </div>
  );
}

function CardChip({ tint }: { tint: string }) {
  const gid = useRef(`chip-${Math.random().toString(36).slice(2)}`).current;
  return (
    <svg width={40} height={30} viewBox="0 0 40 30">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tint} stopOpacity={0.95} />
          <stop offset="45%" stopColor={tint} stopOpacity={0.55} />
          <stop offset="100%" stopColor={tint} stopOpacity={0.85} />
        </linearGradient>
      </defs>
      <rect x={0.5} y={0.5} width={39} height={29} rx={6} fill={`url(#${gid})`} />
      <rect x={0.5} y={0.5} width={39} height={29} rx={6} fill="none" stroke={tint} strokeOpacity={0.5} strokeWidth={1} />
      <line x1={14} y1={0.5} x2={14} y2={29.5} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <line x1={26} y1={0.5} x2={26} y2={29.5} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <line x1={0.5} y1={11} x2={39.5} y2={11} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <line x1={0.5} y1={19} x2={39.5} y2={19} stroke={tint} strokeOpacity={0.35} strokeWidth={1} />
      <rect x={9} y={5} width={22} height={20} rx={3} fill="none" stroke={tint} strokeOpacity={0.45} strokeWidth={1} />
    </svg>
  );
}

function CardSheen({ width, height }: { width: number; height: number }) {
  const ids = useRef({
    sheen: `sheen-${Math.random().toString(36).slice(2)}`,
    corner: `corner-${Math.random().toString(36).slice(2)}`,
    bottom: `bottom-${Math.random().toString(36).slice(2)}`,
  }).current;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <defs>
        <linearGradient id={ids.sheen} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.14} />
          <stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.03} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </linearGradient>
        <radialGradient id={ids.corner} cx="100%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.16} />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={ids.bottom} cx="8%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#000000" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#${ids.corner})`} />
      <rect width={width} height={height} fill={`url(#${ids.bottom})`} />
      <path d={`M0,0 L${width * 0.7},0 L${width * 0.28},${height} L0,${height} Z`} fill={`url(#${ids.sheen})`} />
    </svg>
  );
}

export default function MemberCard({
  earnedPoints,
  name,
  tier,
  cardWidth,
}: {
  earnedPoints: number;
  name?: string;
  tier?: Tier;
  cardWidth: number;
}) {
  const resolvedTier = tier ?? getTier(earnedPoints);
  const next = getNextMilestone(resolvedTier.min);
  const progress = next != null ? Math.min(1, Math.max(0, (earnedPoints - resolvedTier.min) / (next - resolvedTier.min))) : 1;
  const nextTierName = next != null ? getTier(next).name : null;
  const greetName = (name ?? "").trim() || "Quý khách";
  const pointsStr = earnedPoints.toLocaleString("vi-VN");
  // Web không có adjustsFontSizeToFit như RN — tự thu nhỏ theo độ dài chuỗi điểm
  // để số lớn (vd "12.345.678") không tràn khỏi card trên màn hình hẹp.
  const pointsFontSize = pointsStr.length > 10 ? 22 : pointsStr.length > 7 ? 28 : 34;
  const progressLeft = next != null ? `${compact(earnedPoints)} / ${compact(next)} đ` : "Hạng cao nhất ✦";

  const cardBg = CARD_BG[resolvedTier.name] ?? CARD_BG["Bạc"];
  const accent = TIER_ACCENT[resolvedTier.name] ?? "#D0E8F8";
  const progressColors = PROGRESS_COLORS[resolvedTier.name] ?? ["#D0E8F8", "#80B0CC"];
  const tc = TIER_TEXT[resolvedTier.name] ?? TIER_TEXT["Bạc"];
  const cardHeight = Math.round(cardWidth * 0.62);

  return (
    <div style={{ width: cardWidth, borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 18px rgba(0,0,0,0.3)" }}>
      <div
        className="relative"
        style={{
          padding: 20,
          minHeight: cardHeight,
          background: `linear-gradient(135deg, ${cardBg[0]}, ${cardBg[1]})`,
        }}
      >
        <CardSheen width={cardWidth} height={cardHeight} />

        <div className="relative flex items-center justify-between">
          <CardBrandMark tint={tc.main} />
          <div
            className="flex items-center"
            style={{
              background: tc.sub,
              borderRadius: 20,
              padding: "6px 12px",
              border: `1px solid ${tc.muted}`,
              gap: 6,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 4, background: accent, display: "inline-block" }} />
            <span style={{ fontSize: 16, color: tc.main, fontWeight: 700 }}>{resolvedTier.name}</span>
          </div>
        </div>

        <div className="relative flex items-center justify-between" style={{ marginTop: 16 }}>
          <CardChip tint={tc.main} />
          <div className="flex flex-col items-end" style={{ flexShrink: 1, minWidth: 0, marginLeft: 12 }}>
            <span style={{ fontSize: 12, color: tc.muted, fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" }}>
              ĐIỂM TÍCH LŨY
            </span>
            <span
              style={{
                fontSize: pointsFontSize,
                color: tc.main,
                fontWeight: 800,
                marginTop: 2,
                letterSpacing: 1,
                fontVariantNumeric: "tabular-nums",
                textAlign: "right",
                alignSelf: "stretch",
                whiteSpace: "nowrap",
              }}
            >
              {pointsStr}
            </span>
          </div>
        </div>

        <div className="relative" style={{ marginTop: 16 }}>
          <div style={{ height: 1, background: tc.sub, marginBottom: 8 }} />
          <div style={{ fontSize: 12, color: tc.muted, fontWeight: 700, letterSpacing: 1 }}>CHỦ THẺ</div>
          <div
            style={{
              fontSize: 22,
              color: tc.main,
              fontWeight: 800,
              marginTop: 2,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {greetName}
          </div>

          <div style={{ height: 6, background: tc.sub, borderRadius: 3, overflow: "hidden", marginTop: 8 }}>
            <div
              style={{
                height: "100%",
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${progressColors[0]}, ${progressColors[1]})`,
              }}
            />
          </div>

          <div className="flex items-center justify-between" style={{ marginTop: 5 }}>
            <span style={{ fontSize: 14, color: tc.muted, fontWeight: 500 }}>{progressLeft}</span>
            <span style={{ fontSize: 14, color: accent, fontWeight: 700 }}>
              {nextTierName ? `↑ ${nextTierName}` : "✦ Cao nhất"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
