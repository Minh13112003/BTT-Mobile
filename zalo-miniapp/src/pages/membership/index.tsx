import React, { useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Page } from "zmp-ui";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { ArrowBackIcon, SunIcon, MoonIcon } from "@/components/icons";
import MemberCard from "@/components/MemberCard";
import { TIERS, getTier, DISPLAY_NAMES, TierName, BENEFITS } from "@/constants/membership";

/**
 * Port từ app/(root)/membership.tsx — ĐÂY LÀ TRANG ĐƯỢC TINH CHỈNH KỸ NHẤT
 * trong phiên làm việc gốc (nhiều vòng phản hồi về bố cục thẻ). Giữ nguyên
 * 1:1 mọi giá trị cuối cùng: logo 36px + "BenThanh Tourist" đầy đủ, chip
 * trái/điểm tích lũy dọc phải, cardHeight = cardWidth*0.62. Carousel vuốt
 * ngang dùng scroll-snap thay FlatList pagingEnabled của RN. Dữ liệu
 * hạng/thẻ (TIERS, BENEFITS, MemberCard...) dùng chung với Trang chủ, xem
 * constants/membership.ts + components/MemberCard.tsx.
 */

export default function MembershipPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, earnedPoints } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Ưu tiên query param (nếu nơi gọi có truyền sẵn), fallback về AuthContext —
  // tránh lặp lại bug "vào Membership bị reset về 0 điểm" khi có entry point
  // mới sau này quên gắn query earnedPoints.
  const pointsParam = searchParams.get("earnedPoints");
  const points = pointsParam != null ? parseInt(pointsParam, 10) || 0 : earnedPoints;
  const currentTier = getTier(points);

  const tiersInOrder = useMemo(() => DISPLAY_NAMES.map((name) => TIERS.find((t) => t.name === name)!), []);
  const userTierIdx = DISPLAY_NAMES.indexOf(currentTier.name as TierName);
  const [viewedIdx, setViewedIdx] = useState(Math.max(0, userTierIdx));
  const scrollerRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    if (i < 0 || i >= DISPLAY_NAMES.length) return;
    setViewedIdx(i);
    const el = scrollerRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    // scrollIntoView kéo cả trang cuộn dọc theo — dùng scrollTo trực tiếp trên
    // scroller để chỉ cuộn ngang trong phạm vi carousel, không ảnh hưởng trang.
    if (el && card) {
      el.scrollTo({
        left: card.offsetLeft - el.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = (el.children[0] as HTMLElement)?.offsetWidth ?? 1;
    setViewedIdx(Math.round(el.scrollLeft / cardWidth));
  };

  const viewedTier = tiersInOrder[viewedIdx];
  const isMyTier = viewedIdx === userTierIdx;
  const name = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined;

  return (
    <Page style={{ background: isDark ? "#111318" : "#F1F5F9", minHeight: "100vh" }}>
      <div
        className="relative flex items-center justify-between"
        style={{
          padding: "calc(env(safe-area-inset-top) + 12px) 16px 16px",
          background: "linear-gradient(135deg, #E51F27, #A0141A)",
        }}
      >
        <button onClick={() => navigate(-1)} className="flex items-center justify-center">
          <ArrowBackIcon />
        </button>
        <span className="font-black" style={{ color: "#FFFFFF", fontSize: 20 }}>Hạng thành viên</span>
        <button onClick={toggleTheme} className="flex items-center justify-center">
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>

      <div style={{ paddingBottom: 48 }}>
        {/* Carousel thẻ */}
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto"
          style={{ marginTop: 20, scrollSnapType: "x mandatory" }}
        >
          {tiersInOrder.map((tier) => (
            <div
              key={tier.name}
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: "100vw", scrollSnapAlign: "center", padding: "0 24px" }}
            >
              <MemberCard earnedPoints={points} name={name} tier={tier} cardWidth={Math.min(360, window.innerWidth - 48)} />
            </div>
          ))}
        </div>

        <div className="text-center" style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "#64748B" }}>
          ← Vuốt sang trái / phải để xem hạng thẻ khác →
        </div>

        <div className="flex items-center justify-center" style={{ marginTop: 14, gap: 8 }}>
          {DISPLAY_NAMES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === viewedIdx ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === viewedIdx ? "#E51F27" : i === userTierIdx ? "#F59E0B" : "#CBD5E1",
                transition: "width 0.2s",
              }}
            />
          ))}
        </div>

        <div className="text-center font-bold" style={{ marginTop: 14, color: isDark ? "#E2E8F0" : "#475569", fontSize: 16 }}>
          {viewedTier.icon} Hạng {viewedTier.name}
          {isMyTier ? "  ✦ Hạng của bạn" : ""}
        </div>

        {!isMyTier && (
          <div className="flex justify-center" style={{ marginTop: 10 }}>
            <button
              onClick={() => goTo(userTierIdx)}
              className="flex items-center font-bold"
              style={{
                gap: 6,
                padding: "8px 14px",
                borderRadius: 999,
                background: isDark ? "rgba(229,31,39,0.15)" : "rgba(229,31,39,0.08)",
                color: "#E51F27",
                fontSize: 14,
              }}
            >
              👤 Quay về hạng của bạn ({currentTier.name})
            </button>
          </div>
        )}

        <div
          style={{
            margin: isMyTier ? "20px 20px 0" : "12px 20px 0",
            padding: 18,
            borderRadius: 20,
            background: isDark ? "#1E222B" : "#FFFFFF",
            border: isDark ? "1px solid #334155" : "none",
            boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
          }}
        >
          <div className="font-black" style={{ fontSize: 20, color: isDark ? "#F8FAFC" : "#1E293B", marginBottom: 16 }}>
            Đặc quyền hạng {viewedTier.name}
          </div>
          {BENEFITS[viewedTier.name as TierName].map((b, i) => (
            <div key={i} className="flex items-start" style={{ marginBottom: 12, gap: 8 }}>
              <span style={{ color: "#22C55E", marginTop: 2, flexShrink: 0 }}>✓</span>
              <span style={{ flex: 1, fontSize: 18, color: isDark ? "#CBD5E1" : "#374151", lineHeight: "26px" }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
