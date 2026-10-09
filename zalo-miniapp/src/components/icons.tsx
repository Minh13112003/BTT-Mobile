import React from "react";

export interface TabIconProps {
  active?: boolean;
  color?: string;
  size?: number;
}

/**
 * Icon tab dưới cùng — vẽ SVG tay thay vì phụ thuộc bộ icon `zi-*` của zmp-ui
 * (không chắc tên icon nào có sẵn khớp home/compass/time/bell/person). Outline
 * khi không active, filled khi active — cùng tinh thần cặp icon Ionicons
 * home/home-outline... bên app React Native.
 */
export function HomeIcon({ active, color = "currentColor", size = 23 }: TabIconProps) {
  return active ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M11.47 2.25a.75.75 0 0 1 1.06 0l8.5 8.25a.75.75 0 0 1-1.04 1.08l-.74-.72V19.5a1.5 1.5 0 0 1-1.5 1.5h-3.5a.75.75 0 0 1-.75-.75V16a1.5 1.5 0 0 0-3 0v4.25a.75.75 0 0 1-.75.75H6a1.5 1.5 0 0 1-1.5-1.5v-8.59l-.74.72a.75.75 0 1 1-1.04-1.08l8.75-8.5Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M4.5 10.5 12 3.5l7.5 7V19a1 1 0 0 1-1 1h-3.75a.25.25 0 0 1-.25-.25V15a2.5 2.5 0 0 0-5 0v4.75a.25.25 0 0 1-.25.25H5.5a1 1 0 0 1-1-1v-8.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function CompassIcon({ active, color = "currentColor", size = 23 }: TabIconProps) {
  return active ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.9 5.6-2.1 5.6a1.5 1.5 0 0 1-.9.9l-5.6 2.1a.5.5 0 0 1-.65-.65l2.1-5.6a1.5 1.5 0 0 1 .9-.9l5.6-2.1a.5.5 0 0 1 .65.65Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-1.6 4.2a1 1 0 0 1-.6.6l-4.2 1.6a.4.4 0 0 1-.5-.5l1.6-4.2a1 1 0 0 1 .6-.6l4.2-1.6a.4.4 0 0 1 .5.5Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ active, color = "currentColor", size = 23 }: TabIconProps) {
  return active ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.75 5a.75.75 0 0 0-1.5 0v5.19l3.47 2.12a.75.75 0 0 0 .78-1.28l-2.75-1.68V7Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BellIcon({ active, color = "currentColor", size = 23 }: TabIconProps) {
  return active ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2.5a6.5 6.5 0 0 0-6.5 6.5v2.9c0 .5-.18 1-.5 1.38L3.6 14.9a1 1 0 0 0 .76 1.65h15.28a1 1 0 0 0 .76-1.65l-1.4-1.62a2.1 2.1 0 0 1-.5-1.38V9A6.5 6.5 0 0 0 12 2.5ZM9.5 18a2.5 2.5 0 0 0 5 0h-5Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M12 3a6 6 0 0 0-6 6v2.7c0 .4-.14.8-.4 1.1L4.3 14.4a1 1 0 0 0 .76 1.6h13.88a1 1 0 0 0 .76-1.6l-1.3-1.6a1.8 1.8 0 0 1-.4-1.1V9a6 6 0 0 0-6-6Z" strokeLinejoin="round" />
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ active, color = "currentColor", size = 23 }: TabIconProps) {
  return active ? (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4 20.25c0-3.73 3.58-6.25 8-6.25s8 2.52 8 6.25a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1-.75-.75Z" />
    </svg>
  ) : (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="12" cy="7.5" r="4" />
      <path d="M4.5 20.25c0-3.73 3.58-6.25 7.5-6.25s7.5 2.52 7.5 6.25" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronLeftIcon({ color = "currentColor", size = 24 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ color = "#F59E0B", size = 14 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="m12 2.75 2.9 6.14 6.6.75-4.9 4.6 1.3 6.76L12 17.75l-5.9 3.25 1.3-6.76-4.9-4.6 6.6-.75L12 2.75Z" />
    </svg>
  );
}

export function CloseIcon({ color = "currentColor", size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}

export function PhoneIcon({ color = "currentColor", size = 16 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.7c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutIcon({ color = "#FFFFFF", size = 20 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M15 17V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9m12 0-3.5-3.5M21 12l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SunIcon({ color = "#FFFFFF", size = 18 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}

export function MoonIcon({ color = "#FFFFFF", size = 18 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowBackIcon({ color = "#FFFFFF", size = 22 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <path d="M19 12H5m0 0 6-6m-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Trái tim yêu thích — outline khi chưa tim, filled khi đã tim (Ionicons heart/heart-outline bên RN). */
export function HeartIcon({ active, color = "#FFFFFF", size = 20 }: TabIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={active ? color : "none"}
      stroke={color}
      strokeWidth={2}
    >
      <path
        d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ color = "currentColor", size = 18 }: TabIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon({ active, color = "currentColor", size = 18 }: TabIconProps) {
  // active = đang hiện mật khẩu (eye-outline); không active = eye-off-outline — giống bản RN.
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
      {!active && <path d="M4 4l16 16" strokeLinecap="round" />}
    </svg>
  );
}
