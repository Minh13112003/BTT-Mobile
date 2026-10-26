import React, { useEffect, useState } from "react";

import { useFloatingPositions } from "@/components/floating";
import Icon from "@/components/Icon";
import { useTheme } from "@/context/ThemeContext";

/**
 * Nút tròn "lên đầu trang" — hiện khi đã cuộn quá 300px, nằm ngay trên nút Zalo (vị trí theo
 * `useFloatingPositions`, nên không đè Zalo/bttAI). Tương đương khối `showBackToTop` rải rác ở các
 * màn bên app RN, gom thành một component dùng chung.
 */
export default function BackToTopButton() {
  const { top } = useFloatingPositions();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      className="fixed flex items-center justify-center"
      style={{
        bottom: top,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        zIndex: 99,
        background: "#D0021B",
        boxShadow: isDark ? "none" : "0 4px 8px rgba(0,0,0,0.25)",
      }}
    >
      <Icon name="arrow-up" size={24} color="#FFFFFF" strokeWidth={2.4} />
    </button>
  );
}
