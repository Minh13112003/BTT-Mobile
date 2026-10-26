import React from "react";

/**
 * Bộ icon nét (stroke) dùng chung cho các màn mới port từ app RN — tên đặt theo Ionicons bên RN để
 * dễ đối chiếu (`<Icon name="lock-closed-outline" />` ↔ `<Ionicons name="lock-closed-outline" />`).
 * Vẽ SVG thuần, không phụ thuộc bộ icon `zi-*` của zmp-ui.
 */
const PATHS: Record<string, React.ReactNode> = {
  "person-outline": (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  "lock-closed-outline": (
    <>
      <rect x="5" y="11" width="14" height="9.5" rx="2.2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  "call-outline": (
    <path d="M5 4h3.5l1.7 4.3-2.2 1.4a11 11 0 0 0 5.3 5.3l1.4-2.2L19.1 14.5V18a2 2 0 0 1-2.2 2A14.5 14.5 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />
  ),
  "chatbubble-outline": <path d="M4 5.5h16v11H9.5L5 20.5v-4H4z" />,
  "chatbox-ellipses-outline": (
    <>
      <path d="M4 5.5h16v11H9.5L5 20.5v-4H4z" />
      <path d="M8.5 11h.01M12 11h.01M15.5 11h.01" strokeWidth={2.6} />
    </>
  ),
  "help-circle-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 16.8h.01" />
    </>
  ),
  "moon-outline": <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
  "notifications-outline": (
    <>
      <path d="M12 3.5a5.5 5.5 0 0 0-5.5 5.5v2.7c0 .5-.15.9-.4 1.3l-1.2 1.7a.8.8 0 0 0 .65 1.3h13.9a.8.8 0 0 0 .65-1.3l-1.2-1.7c-.25-.4-.4-.8-.4-1.3V9A5.5 5.5 0 0 0 12 3.5Z" />
      <path d="M9.8 19a2.4 2.4 0 0 0 4.4 0" />
    </>
  ),
  "document-text-outline": (
    <>
      <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6" />
    </>
  ),
  "information-circle-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6h.01" strokeWidth={2.4} />
    </>
  ),
  "calendar-outline": (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  "heart-outline": <path d="M12 20s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.4a4.2 4.2 0 0 1 7.5 2.3C19.5 15.4 12 20 12 20Z" />,
  "pricetag-outline": (
    <>
      <path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7 7a1 1 0 0 1-1.4 0l-8.3-8.3Z" />
      <circle cx="8" cy="8" r="1.2" />
    </>
  ),
  "log-out-outline": (
    <>
      <path d="M14 4.5H6.5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1H14" />
      <path d="M10 12h10M17 8.5l3.5 3.5-3.5 3.5" />
    </>
  ),
  "chevron-forward": <path d="m9 5 7 7-7 7" />,
  "chevron-down": <path d="m5 9 7 7 7-7" />,
  "chevron-up": <path d="m5 15 7-7 7 7" />,
  "mail-outline": (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="m4 8 8 5.5L20 8" />
    </>
  ),
  "location-outline": (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  "time-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  "shield-checkmark": (
    <>
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" fill="currentColor" fillOpacity={0.15} />
      <path d="m8.8 12 2.4 2.4 4.2-4.6" />
    </>
  ),
  "shield-outline": <path d="M12 3 5 5.8v5.4c0 4.4 3 8 7 9.8 4-1.8 7-5.4 7-9.8V5.8L12 3Z" />,
  "globe-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.5 4 5.6 4 9s-1.4 6.5-4 9c-2.6-2.5-4-5.6-4-9s1.4-6.5 4-9Z" />
    </>
  ),
  "business-outline": (
    <>
      <path d="M4 20.5V8l8-4.5L20 8v12.5M4 20.5h16" />
      <path d="M9 12h.01M12 12h.01M15 12h.01M9 16h.01M12 16h.01M15 16h.01" strokeWidth={2.4} />
    </>
  ),
  "eye-outline": (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  "eye-off-outline": (
    <>
      <path d="M4 4l16 16M9.9 6A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3.2 3.9M6.3 8C3.7 9.9 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.9-.4 4.1-1" />
      <path d="M10.2 10.2a2.8 2.8 0 0 0 3.6 3.6" />
    </>
  ),
  "close-circle-outline": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  "search-outline": (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  "arrow-up": <path d="M12 19V5M6 11l6-6 6 6" />,
  "checkmark": <path d="m5 12.5 4.5 4.5L19 7.5" />,
  "close": <path d="M6 6l12 12M18 6 6 18" />,
  "send": <path d="M4 12 20 4l-6 16-3-7-7-1Z" />,
  "checkmark-circle": (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="m7.8 12.4 3 3 5.4-6" />
    </>
  ),
  "ellipse-outline": <circle cx="12" cy="12" r="8.5" />,
  "person-circle-outline": (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <circle cx="12" cy="9.5" r="3" />
      <path d="M6.2 18.2c1.2-2.3 3.4-3.4 5.8-3.4s4.6 1.1 5.8 3.4" />
    </>
  ),
  "receipt-outline": (
    <>
      <path d="M6 3.5h12v17l-2.4-1.6-1.8 1.6-1.8-1.6-1.8 1.6-1.8-1.6L6 20.5z" />
      <path d="M9 8.5h6M9 12h6" />
    </>
  ),
  "home-outline": (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 9.8V20h4.2v-5.5h3.6V20H18V9.8" />
    </>
  ),
  "camera-outline": (
    <>
      <path d="M4 8.5h3.2l1.6-2.5h6.4l1.6 2.5H20v11H4z" />
      <circle cx="12" cy="13.5" r="3.5" />
    </>
  ),
};

export type IconName = keyof typeof PATHS | string;

export default function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.9,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}) {
  const node = PATHS[name];
  if (!node) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color, flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}
