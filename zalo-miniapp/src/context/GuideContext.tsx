import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import GuideOverlay from "@/components/GuideOverlay";
import { GUIDE_STEPS, GUIDE_TAB_PATHS, GuideTab, skipStep } from "@/constants/guideSteps";
import { useAuth } from "@/context/AuthContext";
import { getItem, setItem } from "@/utils/storage";

export type GuideRun = { tab: GuideTab; step: number; mode: "tour" | "skip"; dir: 1 | -1 };

type GuideContextValue = {
  registerTarget: (key: string, el: HTMLElement) => void;
  unregisterTarget: (key: string, el: HTMLElement) => void;
  /** Bấm nút ? — luôn chạy lại hướng dẫn của tab. */
  start: (tab: GuideTab) => void;
  /** Lần đầu vào tab — chỉ chạy nếu tài khoản này chưa xem. */
  autoStart: (tab: GuideTab) => void;
};

const GuideContext = createContext<GuideContextValue | null>(null);

const storageKey = (userId: string) => `guide_seen:${userId}`;
const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

/**
 * Port từ context/Guide_Context.tsx (RN): hướng dẫn lần đầu cho 5 tab, "đã xem" lưu theo tài khoản.
 * Trang cuộn bằng window nên không cần trang tự đăng ký cách cuộn như bản RN.
 * Gắn trong ZMPRouter (cần useLocation), bọc AnimationRoutes + BottomNav + nút nổi ở App.tsx.
 */
export function GuideProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const userId = user?.id ? String(user.id) : "";
  const { pathname } = useLocation();

  const targets = useRef(new Map<string, HTMLElement>());
  const [seen, setSeen] = useState<Set<GuideTab> | null>(null);
  const [run, setRun] = useState<GuideRun | null>(null);

  useEffect(() => {
    setSeen(null);
    setRun(null);
    if (!userId) return;
    let alive = true;
    getItem(storageKey(userId))
      .then((raw) => {
        if (alive) setSeen(new Set(raw ? (JSON.parse(raw) as GuideTab[]) : []));
      })
      .catch(() => alive && setSeen(new Set()));
    return () => {
      alive = false;
    };
  }, [userId]);

  const markSeen = useCallback(
    (tab: GuideTab) => {
      setSeen((prev) => {
        const next = new Set(prev ?? []);
        next.add(tab);
        if (userId) setItem(storageKey(userId), JSON.stringify([...next])).catch(() => {});
        return next;
      });
    },
    [userId],
  );

  // Rời tab → tạm dừng, chưa tính là đã xem.
  useEffect(() => {
    if (run && pathname !== GUIDE_TAB_PATHS[run.tab]) setRun(null);
  }, [pathname, run]);

  // Giữ phần tử đăng ký TRƯỚC (vd nút "Xem thêm" của thông báo nằm trên cùng), tới khi nó bị gỡ.
  const registerTarget = useCallback((key: string, el: HTMLElement) => {
    if (!targets.current.has(key)) targets.current.set(key, el);
  }, []);
  const unregisterTarget = useCallback((key: string, el: HTMLElement) => {
    if (targets.current.get(key) === el) targets.current.delete(key);
  }, []);
  const getNode = useCallback((key: string) => targets.current.get(key), []);

  const start = useCallback((tab: GuideTab) => {
    scrollTop();
    setRun({ tab, step: 0, mode: "tour", dir: 1 });
  }, []);

  const autoStart = useCallback(
    (tab: GuideTab) => {
      if (!isLoggedIn || !seen || seen.has(tab)) return;
      setRun((cur) => cur ?? { tab, step: 0, mode: "tour", dir: 1 });
    },
    [isLoggedIn, seen],
  );

  const close = useCallback(() => {
    scrollTop();
    setRun(null);
  }, []);

  const next = useCallback(() => {
    if (!run) return;
    if (run.mode === "skip" || run.step >= GUIDE_STEPS[run.tab].length - 1) {
      markSeen(run.tab);
      close();
    } else setRun({ ...run, step: run.step + 1, dir: 1 });
  }, [run, markSeen, close]);

  const prev = useCallback(() => {
    if (run && run.mode === "tour" && run.step > 0) setRun({ ...run, step: run.step - 1, dir: -1 });
  }, [run]);

  const skip = useCallback(() => {
    if (!run) return;
    markSeen(run.tab);
    scrollTop();
    setRun({ ...run, mode: "skip", dir: 1 });
  }, [run, markSeen]);

  // Phần tử của bước hiện tại không có trên trang → đi tiếp theo hướng đang bấm.
  const missing = useCallback(() => {
    if (!run) return;
    if (run.mode === "skip") return close();
    const step = run.step + run.dir;
    if (step < 0) setRun({ ...run, step: 0, dir: 1 });
    else if (step >= GUIDE_STEPS[run.tab].length) {
      markSeen(run.tab);
      close();
    } else setRun({ ...run, step });
  }, [run, markSeen, close]);

  const value = useMemo(
    () => ({ registerTarget, unregisterTarget, start, autoStart }),
    [registerTarget, unregisterTarget, start, autoStart],
  );

  const steps = run ? GUIDE_STEPS[run.tab] : [];
  const step = run ? (run.mode === "skip" ? skipStep(run.tab) : steps[run.step]) : null;

  return (
    <GuideContext.Provider value={value}>
      {children}
      {run && step ? (
        <GuideOverlay
          key={`${run.tab}-${run.mode}-${run.step}`}
          step={step}
          index={run.step}
          total={steps.length}
          mode={run.mode}
          getNode={getNode}
          onNext={next}
          onPrev={prev}
          onSkip={skip}
          onMissing={missing}
        />
      ) : null}
    </GuideContext.Provider>
  );
}

function useGuide(): GuideContextValue {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error("useGuide phải dùng trong GuideProvider");
  return ctx;
}

/** Gắn vào phần tử cần làm nổi: `<div ref={useGuideTarget("home.member")}>`. `null` = không đăng ký. */
export function useGuideTarget(key: string | null) {
  const { registerTarget, unregisterTarget } = useGuide();
  const elRef = useRef<HTMLElement | null>(null);
  return useCallback(
    (el: HTMLElement | null) => {
      if (!key) return;
      if (el) {
        elRef.current = el;
        registerTarget(key, el);
      } else if (elRef.current) {
        unregisterTarget(key, elRef.current);
        elRef.current = null;
      }
    },
    [key, registerTarget, unregisterTarget],
  );
}

/** Tự mở hướng dẫn lần đầu vào tab (khi `ready` — dữ liệu đã tải xong). */
export function useTabGuide(tab: GuideTab, ready = true) {
  const { autoStart } = useGuide();
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => autoStart(tab), 700);
    return () => clearTimeout(t);
  }, [ready, tab, autoStart]);
}

export function useGuideStart() {
  return useGuide().start;
}
