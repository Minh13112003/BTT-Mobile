import { useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

/** Chiều cao thanh tab nổi (8 + 72 + max(safe-area, 12)) — khớp BottomNav.tsx. */
export const NAV_HEIGHT = "(max(env(safe-area-inset-bottom), 12px) + 80px)";

const TAB_PATHS = ["/", "/search", "/history", "/notifications", "/profile"];
const STICKY_BAR_PREFIXES = ["/tour/", "/checkout"];

/** Nút bttAI 50px + khoảng cách 12px: Zalo (và nút "lên đầu trang") đẩy lên chừng này khi nút bttAI nằm bên dưới. */
export const BOT_LIFT = 62;
/** Khoảng cách từ nút Zalo lên nút "lên đầu trang". */
export const TOP_GAP = 64;

/**
 * Vị trí các nút nổi theo trang hiện tại (tương đương `baseBottom` của ZaloFloatingButton bên RN):
 *  - `slot`: đáy của nút bttAI = chỗ thanh bttAI thu nhỏ cũng nằm (cùng hàng, sát dưới nút Zalo).
 *    Tab: cách mép trên thanh tab 10px · trang tour/checkout: trên thanh CTA dính đáy · còn lại: 30px.
 *  - `zalo`: đáy nút Zalo = slot + 62 khi đã đăng nhập (chừa chỗ cho nút bttAI), ngược lại = slot.
 *  - `top`: đáy nút "lên đầu trang" = trên nút Zalo 64px.
 * Giá trị là chuỗi CSS (dùng được `env(safe-area-inset-bottom)`).
 */
export function useFloatingPositions() {
  const { pathname } = useLocation();
  const { isLoggedIn } = useAuth();

  const slot = TAB_PATHS.includes(pathname)
    ? `calc(${NAV_HEIGHT} + 10px)`
    : STICKY_BAR_PREFIXES.some((p) => pathname.startsWith(p))
      ? "calc(env(safe-area-inset-bottom) + 118px)"
      : "calc(env(safe-area-inset-bottom) + 30px)";
  const lift = isLoggedIn ? BOT_LIFT : 0;

  return {
    pathname,
    isLoggedIn,
    slot,
    zalo: `calc(${slot} + ${lift}px)`,
    top: `calc(${slot} + ${lift + TOP_GAP}px)`,
  };
}
