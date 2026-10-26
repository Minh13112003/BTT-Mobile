import { FONT_SIZE } from "@/constants/typography";
import { GuideStep } from "@/constants/guideSteps";
import { useTheme } from "@/context/Theme_Context";
import type { GuideScroller } from "@/context/Guide_Context";
import React, { useEffect, useRef, useState } from "react";
import { Animated, BackHandler, Easing, Pressable, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type Rect = { x: number; y: number; w: number; h: number };

const PAD = 6;
const GAP = 14;
const DIM = "rgba(20,6,10,0.72)";

interface Props {
  step: GuideStep;
  index: number;
  total: number;
  mode: "tour" | "skip";
  getNode: (key: string) => any;
  scroller?: GuideScroller;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onMissing: () => void;
}

function measure(node: any): Promise<Rect | null> {
  return new Promise((resolve) => {
    if (!node?.measureInWindow) return resolve(null);
    node.measureInWindow((x: number, y: number, w: number, h: number) =>
      resolve(w > 0 && h > 0 ? { x, y, w, h } : null),
    );
  });
}

/** Hình chữ nhật bo góc, vẽ ngược chiều để `evenodd` khoét lỗ trên lớp tối. */
function holePath(r: Rect, radius: number) {
  const rad = Math.min(radius, r.w / 2, r.h / 2);
  const { x, y, w, h } = r;
  return (
    `M${x + rad},${y} H${x + w - rad} A${rad},${rad} 0 0 1 ${x + w},${y + rad} V${y + h - rad} ` +
    `A${rad},${rad} 0 0 1 ${x + w - rad},${y + h} H${x + rad} A${rad},${rad} 0 0 1 ${x},${y + h - rad} ` +
    `V${y + rad} A${rad},${rad} 0 0 1 ${x + rad},${y} Z`
  );
}

/**
 * Một bước hướng dẫn: lớp tối phủ toàn màn hình chừa sáng phần tử (đo bằng `measureInWindow`,
 * đo lại mỗi 250ms vì header thu/giãn khi cuộn), khung chú thích đặt dưới hoặc trên vùng sáng.
 * Chạm vào chỗ tối = bước tiếp. Phím Back (Android) = Bỏ qua.
 */
export default function GuideOverlay({ step, index, total, mode, getNode, scroller, onNext, onPrev, onSkip, onMissing }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [rect, setRect] = useState<Rect | null>(null);
  const [tipH, setTipH] = useState(0);
  const fade = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const hasTarget = !!step.keys?.length;
  const keysSig = step.keys?.join("|") ?? "";
  // Hàm/đối tượng từ provider đổi danh tính mỗi lần render → đọc qua ref để vòng đo không bị khởi động lại.
  const live = useRef({ getNode, scroller, onMissing });
  live.current = { getNode, scroller, onMissing };
  const tour = mode === "tour";
  const last = index >= total - 1;

  // Đo vị trí phần tử; lần đầu thấy nó nằm ngoài vùng nhìn thì cuộn tới. Không tìm thấy ~2 giây → bỏ qua bước.
  useEffect(() => {
    if (!hasTarget) return;
    let alive = true;
    let misses = 0;
    let scrolled = false;
    const keys = keysSig.split("|");
    const tick = async () => {
      const { getNode, scroller, onMissing } = live.current;
      const rects = await Promise.all(keys.map((k) => measure(getNode(k))));
      if (!alive) return;
      const found = rects.filter(Boolean) as Rect[];
      if (!found.length) {
        if (++misses > 8) onMissing();
        return;
      }
      const x = Math.min(...found.map((r) => r.x));
      const y = Math.min(...found.map((r) => r.y));
      const r = {
        x: x - PAD,
        y: y - PAD,
        w: Math.max(...found.map((f) => f.x + f.w)) - x + PAD * 2,
        h: Math.max(...found.map((f) => f.y + f.h)) - y + PAD * 2,
      };
      const top = insets.top + 8;
      const bottom = H - insets.bottom - 140;
      if (!scrolled && scroller && (r.y < top || r.y + r.h > bottom)) {
        scrolled = true;
        scroller.scrollBy(r.y - (insets.top + 110));
        return;
      }
      setRect((prev) =>
        prev && Math.abs(prev.x - r.x) < 1 && Math.abs(prev.y - r.y) < 1 && Math.abs(prev.w - r.w) < 1 && Math.abs(prev.h - r.h) < 1
          ? prev
          : r,
      );
    };
    tick();
    const id = setInterval(tick, 250);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [hasTarget, keysSig, insets.top, insets.bottom, H]);

  const ready = !hasTarget || !!rect;
  useEffect(() => {
    if (ready) Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  }, [ready, fade]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (tour) onSkip();
      else onNext();
      return true;
    });
    return () => sub.remove();
  }, [tour, onSkip, onNext]);

  // Khung chú thích: ưu tiên dưới vùng sáng, không đủ chỗ thì lên trên, cùng lắm đặt sát đáy.
  const estH = tipH || 230;
  let tipStyle: { top?: number; bottom?: number } = { top: Math.max(insets.top + 40, (H - estH) / 2) };
  let arrow: "up" | "down" | null = null;
  if (rect) {
    if (rect.y + rect.h + GAP + estH <= H - insets.bottom - 8) {
      tipStyle = { top: rect.y + rect.h + GAP };
      arrow = "up";
    } else if (rect.y - GAP - estH >= insets.top + 8) {
      tipStyle = { bottom: H - rect.y + GAP };
      arrow = "down";
    } else tipStyle = { bottom: insets.bottom + 100 };
  }
  const arrowLeft = rect ? Math.max(20, Math.min(W - 32 - 34, rect.x + rect.w / 2 - 16 - 7)) : 0;
  const radius = (step.radius ?? 18) + PAD / 2;

  const cardBg = isDark ? "#1E222B" : "#FFFFFF";
  const textMain = isDark ? "#F8FAFC" : "#1A1A2E";
  const textSub = isDark ? "#CBD5E1" : "#475569";
  const chipBg = isDark ? "#3A1F26" : "#FDECEE";
  const chipText = isDark ? "#FCA5A5" : "#D0021B";

  return (
    <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, elevation: 1000 }}>
      <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={ready ? onNext : undefined}>
        <Svg width={W} height={H}>
          <Path
            d={`M0,0 H${W} V${H} H0 Z ${rect ? holePath(rect, radius) : ""}`}
            fill={ready ? DIM : "rgba(20,6,10,0.35)"}
            fillRule="evenodd"
          />
        </Svg>
        {rect ? (
          <>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                borderRadius: radius,
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.95)",
              }}
            />
            <Animated.View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                borderRadius: radius,
                borderWidth: 2,
                borderColor: "#FFFFFF",
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
              }}
            />
          </>
        ) : null}
      </Pressable>

      {ready ? (
        <Animated.View
          onLayout={(e) => setTipH(e.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            ...tipStyle,
            opacity: fade,
            padding: 18,
            borderRadius: 22,
            backgroundColor: cardBg,
            borderWidth: isDark ? 1 : 0,
            borderColor: "#334155",
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 10 },
            elevation: 12,
            gap: 10,
          }}
        >
          {arrow ? (
            <View
              style={{
                position: "absolute",
                left: arrowLeft,
                [arrow === "up" ? "top" : "bottom"]: -7,
                width: 14,
                height: 14,
                borderRadius: 2,
                backgroundColor: cardBg,
                transform: [{ rotate: "45deg" }],
              }}
            />
          ) : null}

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: chipBg }}>
              <Text style={{ fontSize: FONT_SIZE.card, fontWeight: "800", color: chipText }}>
                {tour ? `${index + 1}/${total}` : "Mẹo"}
              </Text>
            </View>
            {tour && !last ? (
              <TouchableOpacity onPress={onSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ minHeight: 44, justifyContent: "center", paddingLeft: 12 }}>
                <Text style={{ fontSize: FONT_SIZE.card, fontWeight: "700", color: isDark ? "#94A3B8" : "#64748B" }}>Bỏ qua</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={{ fontSize: FONT_SIZE.md, fontWeight: "900", color: textMain }}>{step.title}</Text>
          <Text style={{ fontSize: FONT_SIZE.card, lineHeight: 24, color: textSub }}>{step.body}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4, gap: 10 }}>
            <View style={{ flexDirection: "row", gap: 5, flexShrink: 1, flexWrap: "wrap" }}>
              {tour
                ? Array.from({ length: total }, (_, i) => (
                    <View
                      key={i}
                      style={{
                        width: i === index ? 18 : 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: i === index ? "#D0021B" : isDark ? "#334155" : "#E2E8F0",
                      }}
                    />
                  ))
                : null}
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {tour && index > 0 ? (
                <TouchableOpacity
                  onPress={onPrev}
                  activeOpacity={0.8}
                  style={{
                    minHeight: 44,
                    paddingHorizontal: 16,
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: isDark ? "#F87171" : "#D0021B",
                    backgroundColor: isDark ? "transparent" : "#FFF6F7",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: FONT_SIZE.card, fontWeight: "800", color: isDark ? "#FCA5A5" : "#D0021B" }}>‹ Trước</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                onPress={onNext}
                activeOpacity={0.85}
                style={{ minHeight: 44, paddingHorizontal: 20, borderRadius: 999, backgroundColor: "#D0021B", justifyContent: "center" }}
              >
                <Text style={{ fontSize: FONT_SIZE.card, fontWeight: "800", color: "#FFFFFF" }}>
                  {!tour ? "Đã hiểu" : index === 0 && !hasTarget ? "Bắt đầu" : last ? "Xong" : "Tiếp ›"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      ) : null}
    </View>
  );
}
