import { useFocusEffect } from "expo-router";
import React, { createContext, useCallback, useContext, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

interface ScrollVisibilityValue {
  /** 0 = chrome fully visible, 1 = chrome hidden/faded. */
  hidden: Animated.Value;
  setHidden: (hidden: boolean) => void;
}

const ScrollVisibilityContext = createContext<ScrollVisibilityValue | null>(null);

/**
 * Shares a single "hide on scroll" animation value across the tab bar and the
 * per-screen headers so they collapse/fade together as the user scrolls.
 *
 * Animated with `useNativeDriver: false` because the header collapse animates
 * `height` (a layout prop) — every consumer of `hidden` must use the same
 * driver, so the tab bar fade is JS-driven too.
 */
export function ScrollVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hidden = useRef(new Animated.Value(0)).current;
  const target = useRef(0);

  const setHidden = useCallback(
    (next: boolean) => {
      const value = next ? 1 : 0;
      if (target.current === value) return;
      target.current = value;
      Animated.timing(hidden, {
        toValue: value,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [hidden],
  );

  return (
    <ScrollVisibilityContext.Provider value={{ hidden, setHidden }}>
      {children}
    </ScrollVisibilityContext.Provider>
  );
}

export function useScrollVisibility() {
  const ctx = useContext(ScrollVisibilityContext);
  if (!ctx) {
    throw new Error(
      "useScrollVisibility must be used within a ScrollVisibilityProvider",
    );
  }
  return ctx;
}

/**
 * onScroll handler that hides the chrome when scrolling down and reveals it near
 * the top / when scrolling up. Resets to visible on focus + blur so other tabs
 * never inherit a hidden chrome.
 */
export function useHideOnScroll() {
  const { setHidden } = useScrollVisibility();
  const lastY = useRef(0);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const dy = y - lastY.current;
      if (y <= 8) setHidden(false);
      else if (dy > 6) setHidden(true);
      else if (dy < -6) setHidden(false);
      lastY.current = y;
    },
    [setHidden],
  );

  useFocusEffect(
    useCallback(() => {
      lastY.current = 0;
      setHidden(false);
      return () => setHidden(false);
    }, [setHidden]),
  );

  return onScroll;
}
