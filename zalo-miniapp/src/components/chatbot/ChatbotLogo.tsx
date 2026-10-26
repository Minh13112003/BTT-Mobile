import React, { useId } from "react";

/**
 * Icon bttAI (robot thân thiện, nền đỏ BenThanh) — cùng bản vẽ với app RN
 * (`D:\ChatBot\mobile\assets\bttai-icon.svg`). Id gradient riêng cho mỗi bản để nhiều icon cùng hiện
 * trên một màn hình không đè gradient của nhau.
 */
export default function ChatbotLogo({ size = 50 }: { size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const bg = `bttai-bg-${uid}`;
  const head = `bttai-head-${uid}`;
  const shine = `bttai-shine-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FF6B6B" />
          <stop offset="0.55" stopColor="#E5162C" />
          <stop offset="1" stopColor="#8F0A1C" />
        </linearGradient>
        <linearGradient id={head} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4E8F2" />
        </linearGradient>
        <linearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="112" height="112" rx="34" fill={`url(#${bg})`} />
      <rect x="4" y="4" width="112" height="112" rx="34" fill={`url(#${shine})`} />
      <path d="M60 36 V24" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="21" r="6.5" fill="#FFE27A" />
      <rect x="14" y="58" width="10" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="96" y="58" width="10" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.85" />
      <rect x="24" y="36" width="72" height="58" rx="22" fill={`url(#${head})`} />
      <rect x="32" y="46" width="56" height="38" rx="16" fill="#1A1A2E" />
      <circle cx="48" cy="62" r="7" fill="#7DF9FF" />
      <circle cx="72" cy="62" r="7" fill="#7DF9FF" />
      <circle cx="50" cy="60" r="2.2" fill="#FFFFFF" />
      <circle cx="74" cy="60" r="2.2" fill="#FFFFFF" />
      <path d="M52 74 Q60 80 68 74" fill="none" stroke="#7DF9FF" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
