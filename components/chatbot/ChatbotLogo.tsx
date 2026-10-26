import React, { useRef } from "react";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

let logoSeq = 0;

/**
 * Icon bttAI (robot thân thiện, nền đỏ BenThanh) — dựng lại từ
 * `D:\ChatBot\mobile\assets\bttai-icon.svg`. Id gradient riêng cho mỗi bản
 * để nhiều icon cùng hiện trên một màn hình không đè gradient của nhau.
 */
export default function ChatbotLogo({ size = 50 }: { size?: number }) {
  const idRef = useRef(0);
  if (idRef.current === 0) {
    logoSeq += 1;
    idRef.current = logoSeq;
  }
  const uid = idRef.current;
  const bg = `bttai-bg-${uid}`;
  const head = `bttai-head-${uid}`;
  const shine = `bttai-shine-${uid}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={bg} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FF6B6B" />
          <Stop offset="0.55" stopColor="#E5162C" />
          <Stop offset="1" stopColor="#8F0A1C" />
        </LinearGradient>
        <LinearGradient id={head} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#E4E8F2" />
        </LinearGradient>
        <LinearGradient id={shine} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.32" />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect x="4" y="4" width="112" height="112" rx="34" fill={`url(#${bg})`} />
      <Rect x="4" y="4" width="112" height="112" rx="34" fill={`url(#${shine})`} />
      <Path d="M60 36 V24" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <Circle cx="60" cy="21" r="6.5" fill="#FFE27A" />
      <Rect x="14" y="58" width="10" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.85" />
      <Rect x="96" y="58" width="10" height="20" rx="5" fill="#FFFFFF" fillOpacity="0.85" />
      <Rect x="24" y="36" width="72" height="58" rx="22" fill={`url(#${head})`} />
      <Rect x="32" y="46" width="56" height="38" rx="16" fill="#1A1A2E" />
      <Circle cx="48" cy="62" r="7" fill="#7DF9FF" />
      <Circle cx="72" cy="62" r="7" fill="#7DF9FF" />
      <Circle cx="50" cy="60" r="2.2" fill="#FFFFFF" />
      <Circle cx="74" cy="60" r="2.2" fill="#FFFFFF" />
      <Path d="M52 74 Q60 80 68 74" fill="none" stroke="#7DF9FF" strokeWidth="3.5" strokeLinecap="round" />
    </Svg>
  );
}
