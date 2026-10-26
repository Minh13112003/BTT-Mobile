import React from "react";

import Icon from "@/components/Icon";
import { GuideTab } from "@/constants/guideSteps";
import { useAuth } from "@/context/AuthContext";
import { useGuideStart, useGuideTarget } from "@/context/GuideContext";

/**
 * Port từ components/guide/GuideHelpButton.tsx (RN): nút ? trên header từng tab — bấm để xem lại
 * hướng dẫn của tab đó. 44px ở Trang chủ (cạnh chuông), 40px trên TabHeader. Ẩn khi chưa đăng nhập.
 */
export default function GuideHelpButton({ tab, size = 40 }: { tab: GuideTab; size?: number }) {
  const { isLoggedIn } = useAuth();
  const start = useGuideStart();
  const guideRef = useGuideTarget(`${tab}.help`);
  if (!isLoggedIn) return null;

  return (
    <button
      ref={guideRef}
      onClick={() => start(tab)}
      aria-label="Xem hướng dẫn sử dụng"
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, minHeight: size, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
    >
      <Icon name="help-circle-outline" size={22} color="#FFFFFF" />
    </button>
  );
}
