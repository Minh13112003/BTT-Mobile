import React from "react";
import { useLocation } from "react-router-dom";
import { openOutApp } from "zmp-sdk/apis";
import zaloLogo from "@/static/logo-zalo-vector-35.jpg";

const ZALO_GROUP_URL = "https://zalo.me/237833859403376914";

// Trang có thanh CTA dính đáy (giá + nút đặt tour / xác nhận đặt tour) — cần
// đẩy nút lên cao hơn mức mặc định để không bị thanh đó che mất.
const STICKY_BAR_PREFIXES = ["/tour/", "/checkout"];

/**
 * Port từ components/ZaloFloatingButton.tsx — nút nổi liên hệ nhóm Zalo hỗ
 * trợ, luôn hiển thị mờ đi, rung lắc định kỳ (CSS keyframes thay cho
 * Animated.loop). Nhấn vào hỏi xác nhận (confirm() — cùng pattern đơn giản
 * hoá đã dùng ở checkout.tsx) rồi mở link bằng openOutApp (API zmp-sdk mở
 * URL ra ngoài webview Mini App); rơi về window.open khi chạy ngoài Zalo
 * (preview trình duyệt thường, nơi openOutApp luôn reject).
 *
 * Mount 1 lần duy nhất ở App.tsx (sibling của AnimationRoutes, giống
 * BottomNav) thay vì gắn lại ở từng page như bản RN — tự ẩn ở /login (PIN
 * screens không tồn tại ở bản Zalo nên không cần loại trừ thêm), tự nâng vị
 * trí ở các trang có thanh CTA dính đáy. Luôn đứng cao hơn vị trí nút "lên
 * đầu trang" (bottom:30) của các trang list/detail 1 mức, để 2 nút không đè
 * lên nhau mà không cần từng page truyền `liftBy` riêng như bản RN.
 */
export default function ZaloFloatingButton() {
  const location = useLocation();
  if (location.pathname === "/login") return null;

  const hasStickyBar = STICKY_BAR_PREFIXES.some((p) => location.pathname.startsWith(p));
  const bottom = hasStickyBar ? 150 : 94;

  const handlePress = () => {
    if (!confirm("Bạn có muốn mở Zalo để tham gia nhóm hỗ trợ của BenThanh Tourist không?")) return;
    openOutApp({ url: ZALO_GROUP_URL }).catch(() => {
      window.open(ZALO_GROUP_URL, "_blank");
    });
  };

  return (
    <button
      onClick={handlePress}
      className="zalo-floating-btn"
      style={{
        position: "fixed",
        bottom,
        right: 20,
        zIndex: 98,
        width: 50,
        height: 50,
        borderRadius: 25,
        overflow: "hidden",
        opacity: 0.6,
        background: "#FFFFFF",
        boxShadow: "0 4px 8px rgba(0,0,0,0.25)",
      }}
    >
      <img src={zaloLogo} alt="Liên hệ Zalo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </button>
  );
}
