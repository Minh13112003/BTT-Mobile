import React, { useState } from "react";

import AlertDialog from "@/components/AlertDialog";
import { useFloatingPositions } from "@/components/floating";
import { useGuideTarget } from "@/context/GuideContext";
import { openLink } from "@/utils/links";
import zaloLogo from "@/static/logo-zalo-vector-35.jpg";

const ZALO_GROUP_URL = "https://zalo.me/237833859403376914";

/**
 * Port từ components/ZaloFloatingButton.tsx — nút nổi liên hệ nhóm Zalo hỗ trợ, luôn hiển thị mờ đi,
 * rung lắc định kỳ (CSS keyframes thay cho Animated.loop). Nhấn vào hỏi xác nhận rồi mở link bằng
 * openOutApp (API zmp-sdk); rơi về window.open khi chạy ngoài Zalo (preview trình duyệt thường).
 *
 * Mount 1 lần duy nhất ở App.tsx (sibling của AnimationRoutes, giống BottomNav) thay vì gắn lại ở
 * từng page như bản RN — tự ẩn ở /login. Vị trí do `useFloatingPositions` quyết định: khi đã đăng
 * nhập, nút bttAI nằm NGAY DƯỚI nút Zalo (cách 12px) nên Zalo được nâng lên 62px; theo từng trang
 * (tab = trên thanh tab, tour/checkout = trên thanh CTA dính đáy).
 */
export default function ZaloFloatingButton() {
  const { pathname, zalo } = useFloatingPositions();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const guideRef = useGuideTarget("home.zalo");

  if (pathname === "/login") return null;

  return (
    <>
      <button
        ref={guideRef}
        onClick={() => setConfirmVisible(true)}
        aria-label="Liên hệ nhóm Zalo hỗ trợ"
        className="zalo-floating-btn"
        style={{
          position: "fixed",
          bottom: zalo,
          right: 20,
          zIndex: 98,
          width: 50,
          height: 50,
          minHeight: 50,
          borderRadius: 25,
          overflow: "hidden",
          opacity: 0.6,
          background: "#FFFFFF",
          boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
        }}
      >
        <img src={zaloLogo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </button>

      <AlertDialog
        visible={confirmVisible}
        type="confirm"
        title="Mở Zalo"
        message="Bạn có muốn mở Zalo để tham gia nhóm hỗ trợ của BenThanh Tourist không?"
        confirmText="Mở Zalo"
        cancelText="Để sau"
        onClose={() => setConfirmVisible(false)}
        onConfirm={() => openLink(ZALO_GROUP_URL)}
      />
    </>
  );
}
