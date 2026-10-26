import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, usePathname } from "expo-router";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import GuideOverlay from "@/components/guide/GuideOverlay";
import { GUIDE_STEPS, GUIDE_TAB_PATHS, GuideTab, skipStep } from "@/constants/guideSteps";
import { useAuth } from "@/context/Auth_Context";

/** Màn có danh sách cuộn đăng ký để hướng dẫn cuộn tới phần tử nằm ngoài màn hình. */
export type GuideScroller = { scrollBy: (dy: number) => void; scrollToTop: () => void };

export type GuideRun = { tab: GuideTab; step: number; mode: "tour" | "skip"; dir: 1 | -1 };

type GuideContextValue = {
  registerTarget: (key: string, node: any) => void;
  unregisterTarget: (key: string, node: any) => void;
  registerScroller: (tab: GuideTab, scroller: GuideScroller | null) => void;
  /** Bấm nút ? — luôn chạy lại hướng dẫn của tab. */
  start: (tab: GuideTab) => void;
  /** Lần đầu vào tab — chỉ chạy nếu tài khoản này chưa xem. */
  autoStart: (tab: GuideTab) => void;
};

const GuideContext = createContext<GuideContextValue | null>(null);

const storageKey = (userId: string) => `guide_seen:${userId}`;

/**
 * Hướng dẫn sử dụng lần đầu cho 5 tab: làm tối màn hình, chừa sáng đúng phần tử đang giới thiệu.
 * "Đã xem" lưu AsyncStorage theo tài khoản (máy mới / cài lại app thì hiện lại). Gắn trong AuthProvider.
 */
export function GuideProvider({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth();
  const userId = user?.id ? String(user.id) : "";
  const pathname = usePathname();

  const targets = useRef(new Map<string, any>());
  const scrollers = useRef(new Map<GuideTab, GuideScroller>());
  const [seen, setSeen] = useState<Set<GuideTab> | null>(null);
  const [run, setRun] = useState<GuideRun | null>(null);

  useEffect(() => {
    setSeen(null);
    setRun(null);
    if (!userId) return;
    let alive = true;
    AsyncStorage.getItem(storageKey(userId))
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
        if (userId) AsyncStorage.setItem(storageKey(userId), JSON.stringify([...next])).catch(() => {});
        return next;
      });
    },
    [userId],
  );

  // Rời tab (mở trang khác, bấm thông báo đẩy…) → tạm dừng, chưa tính là đã xem.
  useEffect(() => {
    if (run && pathname !== GUIDE_TAB_PATHS[run.tab]) setRun(null);
  }, [pathname, run]);

  // Giữ phần tử đăng ký TRƯỚC (vd nút "Xem thêm" của thông báo nằm trên cùng), tới khi nó bị gỡ.
  const registerTarget = useCallback((key: string, node: any) => {
    if (!targets.current.has(key)) targets.current.set(key, node);
  }, []);
  const unregisterTarget = useCallback((key: string, node: any) => {
    if (targets.current.get(key) === node) targets.current.delete(key);
  }, []);
  const registerScroller = useCallback((tab: GuideTab, scroller: GuideScroller | null) => {
    if (scroller) scrollers.current.set(tab, scroller);
    else scrollers.current.delete(tab);
  }, []);

  const start = useCallback((tab: GuideTab) => {
    scrollers.current.get(tab)?.scrollToTop();
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
    setRun((cur) => {
      if (cur) scrollers.current.get(cur.tab)?.scrollToTop();
      return null;
    });
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
    // Nút ? nằm trên header — đang cuộn xuống thì header Trang chủ đã thu lại, cuộn về đầu cho hiện ra.
    scrollers.current.get(run.tab)?.scrollToTop();
    setRun({ ...run, mode: "skip", dir: 1 });
  }, [run, markSeen]);

  // Phần tử của bước hiện tại không có trên màn → đi tiếp theo hướng đang bấm.
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

  const getNode = useCallback((key: string) => targets.current.get(key), []);

  const value = useMemo(
    () => ({ registerTarget, unregisterTarget, registerScroller, start, autoStart }),
    [registerTarget, unregisterTarget, registerScroller, start, autoStart],
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
          scroller={scrollers.current.get(run.tab)}
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

/**
 * Gắn vào phần tử cần làm nổi: `<View ref={useGuideTarget("home.member")} collapsable={false}>`.
 * `null` = không đăng ký (vd chỉ thẻ đầu tiên của danh sách mới đăng ký).
 */
export function useGuideTarget(key: string | null) {
  const { registerTarget, unregisterTarget } = useGuide();
  const nodeRef = useRef<any>(null);
  return useCallback(
    (node: any) => {
      if (!key) return;
      if (node) {
        nodeRef.current = node;
        registerTarget(key, node);
      } else if (nodeRef.current) {
        unregisterTarget(key, nodeRef.current);
        nodeRef.current = null;
      }
    },
    [key, registerTarget, unregisterTarget],
  );
}

/** Màn tab đăng ký cách cuộn danh sách của mình (để tới phần tử ở dưới trang). */
export function useGuideScroller(tab: GuideTab, scroller: GuideScroller) {
  const { registerScroller } = useGuide();
  const ref = useRef(scroller);
  ref.current = scroller;
  useEffect(() => {
    registerScroller(tab, {
      scrollBy: (dy) => ref.current.scrollBy(dy),
      scrollToTop: () => ref.current.scrollToTop(),
    });
    return () => registerScroller(tab, null);
  }, [tab, registerScroller]);
}

/** Tự mở hướng dẫn lần đầu vào tab (khi `ready` — dữ liệu đã tải xong). */
export function useTabGuide(tab: GuideTab, ready = true) {
  const { autoStart } = useGuide();
  useFocusEffect(
    useCallback(() => {
      if (!ready) return;
      const t = setTimeout(() => autoStart(tab), 700);
      return () => clearTimeout(t);
    }, [ready, tab, autoStart]),
  );
}

export function useGuideStart() {
  return useGuide().start;
}
