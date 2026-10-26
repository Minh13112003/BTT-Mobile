import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import { GuideStep } from "@/constants/guideSteps";
import { FONT_SIZE } from "@/constants/typography";
import { useTheme } from "@/context/ThemeContext";

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 6;
const GAP = 14;

interface Props {
  step: GuideStep;
  index: number;
  total: number;
  mode: "tour" | "skip";
  getNode: (key: string) => HTMLElement | undefined;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onMissing: () => void;
}

/**
 * Port từ components/guide/GuideOverlay.tsx (RN): lớp tối khoét sáng phần tử (box-shadow thay cho Svg),
 * đo lại mỗi 250ms (getBoundingClientRect), lần đầu thấy phần tử ngoài màn thì cuộn window tới.
 * Chạm chỗ tối = bước tiếp.
 */
export default function GuideOverlay({ step, index, total, mode, getNode, onNext, onPrev, onSkip, onMissing }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [rect, setRect] = useState<Rect | null>(null);
  const [tipH, setTipH] = useState(0);
  const tipRef = useRef<HTMLDivElement>(null);

  const hasTarget = !!step.keys?.length;
  const keysSig = step.keys?.join("|") ?? "";
  const tour = mode === "tour";
  const last = index >= total - 1;
  const live = useRef({ getNode, onMissing });
  live.current = { getNode, onMissing };

  useEffect(() => {
    if (!hasTarget) return;
    let misses = 0;
    let scrolled = false;
    const keys = keysSig.split("|");
    const tick = () => {
      const found = keys
        .map((k) => live.current.getNode(k)?.getBoundingClientRect())
        .filter((r): r is DOMRect => !!r && r.width > 0 && r.height > 0);
      if (!found.length) {
        if (++misses > 8) live.current.onMissing();
        return;
      }
      const x = Math.min(...found.map((r) => r.left));
      const y = Math.min(...found.map((r) => r.top));
      const r = {
        x: x - PAD,
        y: y - PAD,
        w: Math.max(...found.map((f) => f.right)) - x + PAD * 2,
        h: Math.max(...found.map((f) => f.bottom)) - y + PAD * 2,
      };
      if (!scrolled && (r.y < 8 || r.y + r.h > window.innerHeight - 140)) {
        scrolled = true;
        window.scrollBy({ top: r.y - 110, behavior: "smooth" });
        return;
      }
      setRect((prev) =>
        prev && Math.abs(prev.x - r.x) < 1 && Math.abs(prev.y - r.y) < 1 && Math.abs(prev.w - r.w) < 1 && Math.abs(prev.h - r.h) < 1
          ? prev
          : r,
      );
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [hasTarget, keysSig]);

  const ready = !hasTarget || !!rect;
  useLayoutEffect(() => {
    if (tipRef.current) setTipH(tipRef.current.offsetHeight);
  });

  const H = window.innerHeight;
  const W = window.innerWidth;
  const estH = tipH || 230;
  let tipPos: React.CSSProperties = { top: Math.max(40, (H - estH) / 2) };
  let arrow: "up" | "down" | null = null;
  if (rect) {
    if (rect.y + rect.h + GAP + estH <= H - 8) {
      tipPos = { top: rect.y + rect.h + GAP };
      arrow = "up";
    } else if (rect.y - GAP - estH >= 8) {
      tipPos = { bottom: H - rect.y + GAP };
      arrow = "down";
    } else tipPos = { bottom: 100 };
  }
  const arrowLeft = rect ? Math.max(20, Math.min(W - 32 - 34, rect.x + rect.w / 2 - 16 - 7)) : 0;
  const radius = (step.radius ?? 18) + PAD / 2;

  const cardBg = isDark ? "#1E222B" : "#FFFFFF";
  const textMain = isDark ? "#F8FAFC" : "#1A1A2E";
  const textSub = isDark ? "#CBD5E1" : "#475569";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000 }}>
      <style>{"@keyframes guidePulse{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.06)}}"}</style>
      <div onClick={ready ? onNext : undefined} style={{ position: "absolute", inset: 0, cursor: "pointer", background: rect ? "transparent" : ready ? "rgba(20,6,10,0.72)" : "rgba(20,6,10,0.35)" }} />
      {rect ? (
        <div
          style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            borderRadius: radius,
            border: "2px solid rgba(255,255,255,0.95)",
            boxShadow: "0 0 0 9999px rgba(20,6,10,0.72)",
            pointerEvents: "none",
            transition: "all .3s ease",
          }}
        >
          <div style={{ position: "absolute", inset: -2, borderRadius: radius, border: "2px solid #FFFFFF", animation: "guidePulse 1.4s ease-out infinite" }} />
        </div>
      ) : null}

      {ready ? (
        <div
          ref={tipRef}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            ...tipPos,
            padding: 18,
            borderRadius: 22,
            background: cardBg,
            border: isDark ? "1px solid #334155" : "none",
            boxShadow: "0 16px 36px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {arrow ? (
            <span
              style={{
                position: "absolute",
                left: arrowLeft,
                [arrow === "up" ? "top" : "bottom"]: -7,
                width: 14,
                height: 14,
                borderRadius: 2,
                background: cardBg,
                transform: "rotate(45deg)",
              }}
            />
          ) : null}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ padding: "4px 10px", borderRadius: 999, background: isDark ? "#3A1F26" : "#FDECEE", color: isDark ? "#FCA5A5" : "#D0021B", fontSize: FONT_SIZE.card, fontWeight: 800 }}>
              {tour ? `${index + 1}/${total}` : "Mẹo"}
            </span>
            {tour && !last ? (
              <button onClick={onSkip} style={{ minHeight: 44, padding: "0 0 0 12px", background: "none", fontSize: FONT_SIZE.card, fontWeight: 700, color: isDark ? "#94A3B8" : "#64748B" }}>
                Bỏ qua
              </button>
            ) : null}
          </div>
          <div style={{ fontSize: FONT_SIZE.md, fontWeight: 900, color: textMain }}>{step.title}</div>
          <div style={{ fontSize: FONT_SIZE.card, lineHeight: "24px", color: textSub }}>{step.body}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 4 }}>
            <span style={{ display: "flex", gap: 5, flexWrap: "wrap", minWidth: 0 }}>
              {tour
                ? Array.from({ length: total }, (_, i) => (
                    <span key={i} style={{ width: i === index ? 18 : 6, height: 6, borderRadius: 3, background: i === index ? "#D0021B" : isDark ? "#334155" : "#E2E8F0" }} />
                  ))
                : null}
            </span>
            <span style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {tour && index > 0 ? (
                <button
                  onClick={onPrev}
                  style={{
                    minHeight: 44,
                    padding: "0 16px",
                    borderRadius: 999,
                    border: `1.5px solid ${isDark ? "#F87171" : "#D0021B"}`,
                    background: isDark ? "transparent" : "#FFF6F7",
                    color: isDark ? "#FCA5A5" : "#D0021B",
                    fontSize: FONT_SIZE.card,
                    fontWeight: 800,
                  }}
                >
                  ‹ Trước
                </button>
              ) : null}
              <button
                onClick={onNext}
                style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, background: "#D0021B", color: "#FFFFFF", fontSize: FONT_SIZE.card, fontWeight: 800 }}
              >
                {!tour ? "Đã hiểu" : index === 0 && !hasTarget ? "Bắt đầu" : last ? "Xong" : "Tiếp ›"}
              </button>
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
