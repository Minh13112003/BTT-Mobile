import React, { useEffect } from "react";

import Icon from "@/components/Icon";
import { FONT_SIZE } from "@/constants/typography";

interface Props {
  visible: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  initials: string;
  name: string;
  tierName: string;
}

/** Xem ảnh đại diện phóng to — port từ components/profile/AvatarViewer.tsx (RN). Bấm bất kỳ đâu hoặc nút X để đóng. */
export default function AvatarViewer({ visible, onClose, avatarUrl, initials, name, tierName }: Props) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  if (!visible) return null;
  const size = "min(calc(100vw - 48px), 360px)";

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-label="Ảnh đại diện"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 3000,
        background: "rgba(12,6,8,0.9)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Đóng"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top) + 12px)",
          right: 18,
          width: 44,
          height: 44,
          borderRadius: 22,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(255,255,255,0.14)",
          border: "1px solid rgba(255,255,255,0.25)",
        }}
      >
        <Icon name="close" size={24} color="#FFFFFF" />
      </button>

      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "4px solid #F0C020",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#C9962B",
          boxSizing: "border-box",
        }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={`Ảnh đại diện của ${name}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span className="text-white font-black" style={{ fontSize: 96 }}>
            {initials}
          </span>
        )}
      </div>

      <div className="text-white font-bold" style={{ marginTop: 20, fontSize: FONT_SIZE.lg }}>
        {name}
      </div>
      <div style={{ marginTop: 4, fontSize: FONT_SIZE.xxs, color: "#FFF1B8" }}>Hạng {tierName}</div>
      <div
        style={{
          position: "absolute",
          bottom: "calc(env(safe-area-inset-bottom) + 28px)",
          fontSize: FONT_SIZE.xxs,
          color: "rgba(255,255,255,0.6)",
        }}
      >
        Chạm ra ngoài để đóng
      </div>
    </div>
  );
}
