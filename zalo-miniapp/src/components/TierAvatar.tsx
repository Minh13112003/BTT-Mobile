import React from "react";

/** Tên hạng (khớp `TIERS` trong constants/membership.ts) → thông số vẽ. Port từ components/profile/TierAvatar.tsx (RN). */
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
 * Avatar có viền màu theo hạng thành viên; hạng càng cao cánh càng nhiều và to (Bạch Kim+ có
 * lấp lánh, Kim Cương/Ruby thêm viên ngọc, Ruby thêm vương miện). Cùng bản thiết kế "AvatarTier"
 * như app RN, vẽ bằng SVG thuần.
 */
export default function TierAvatar({ tier, avatarUrl, initials }: Props) {
  const key = TIER_STYLE[tier] ? tier : "Đồng";
  const t = TIER_STYLE[key];
  const id = "tav-" + key.replace(/\s/g, "");
  const high = key === "Kim Cương" || key === "Ruby";
  const sparkle = key === "Bạch Kim" || high;

  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", top: 0, left: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}-fe`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={t.deep} />
            <stop offset="1" stopColor={t.light} />
          </linearGradient>
          <linearGradient id={`${id}-rg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={t.light} />
            <stop offset="0.5" stopColor={t.mid} />
            <stop offset="1" stopColor={t.deep} />
          </linearGradient>
          <radialGradient id={`${id}-gl`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor={t.light} stopOpacity="0.55" />
            <stop offset="1" stopColor={t.light} stopOpacity="0" />
          </radialGradient>
        </defs>

        {key !== "Đồng" && <circle cx="110" cy="80" r="70" fill={`url(#${id}-gl)`} />}

        {t.feathers > 0 && (
          <>
            <g transform={`translate(80 92) scale(${t.scale})`}>
              {ANGLES.slice(0, t.feathers).map((a) => (
                <path key={a} d={FEATHER} transform={`rotate(${a})`} fill={`url(#${id}-fe)`} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              ))}
            </g>
            <g transform={`translate(140 92) scale(${-t.scale} ${t.scale})`}>
              {ANGLES.slice(0, t.feathers).map((a) => (
                <path key={a} d={FEATHER} transform={`rotate(${a})`} fill={`url(#${id}-fe)`} stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              ))}
            </g>
          </>
        )}

        {high && (
          <>
            <g transform="translate(82 96) scale(0.62)">
              {[-40, -68, -96].map((a) => (
                <path key={a} d={FEATHER} transform={`rotate(${a})`} fill={t.light} fillOpacity={0.9} />
              ))}
            </g>
            <g transform="translate(138 96) scale(-0.62 0.62)">
              {[-40, -68, -96].map((a) => (
                <path key={a} d={FEATHER} transform={`rotate(${a})`} fill={t.light} fillOpacity={0.9} />
              ))}
            </g>
          </>
        )}

        <circle cx="110" cy="80" r="42" fill="#FFFFFF" />
        <circle cx="110" cy="80" r="42" fill="none" stroke={`url(#${id}-rg)`} strokeWidth={t.ring} />

        {sparkle && (
          <g fill="#FFFFFF">
            <path d="M44 34 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" />
            <path d="M176 30 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6z" />
            <path d="M186 104 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z" />
            <path d="M32 110 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4z" />
          </g>
        )}

        {key === "Ruby" && (
          <g transform="translate(110 30)">
            <path d="M-18 6 L-14 -12 L-6 -2 L0 -16 L6 -2 L14 -12 L18 6 Z" fill={`url(#${id}-rg)`} stroke="#FFFFFF" strokeWidth={1.5} strokeLinejoin="round" />
            <circle cx="0" cy="-16" r="2.6" fill="#FFFFFF" />
            <circle cx="-14" cy="-12" r="2" fill="#FFFFFF" />
            <circle cx="14" cy="-12" r="2" fill="#FFFFFF" />
          </g>
        )}

        {high && (
          <g transform="translate(110 124)">
            <path d="M-8 -4 L-4 -9 L4 -9 L8 -4 L0 7 Z" fill={`url(#${id}-rg)`} stroke="#FFFFFF" strokeWidth={1.4} strokeLinejoin="round" />
          </g>
        )}
      </svg>

      <div
        style={{
          position: "absolute",
          left: 74,
          top: 44,
          width: 72,
          height: 72,
          borderRadius: 36,
          overflow: "hidden",
          background: "#FDECEE",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" style={{ width: 72, height: 72, objectFit: "cover" }} />
        ) : (
          <span style={{ fontSize: 24, fontWeight: 800, color: "#B30014" }}>{initials}</span>
        )}
      </div>
    </div>
  );
}
