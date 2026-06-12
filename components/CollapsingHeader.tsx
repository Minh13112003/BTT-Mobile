import Header from "@/components/Header";
import { useScrollVisibility } from "@/context/ScrollVisibility_Context";
import { useTheme } from "@/context/Theme_Context";
import React, { useState } from "react";
import { Animated, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Collapses its children (height -> 0 + fade) when the shared `hidden` value
 * reaches 1, e.g. a sticky search bar that auto-hides on scroll down. The height
 * is measured once on layout so the collapse leaves no gap.
 */
export function Collapsible({ children }: { children: React.ReactNode }) {
  const { hidden } = useScrollVisibility();
  const [height, setHeight] = useState(0);

  const animatedStyle = height
    ? {
        height: hidden.interpolate({
          inputRange: [0, 1],
          outputRange: [height, 0],
        }),
        opacity: hidden.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0],
        }),
        overflow: "hidden" as const,
      }
    : undefined;

  return (
    <Animated.View style={animatedStyle}>
      <View
        onLayout={(e) => {
          // Re-measure on content changes (e.g. the region sub-filter sliding
          // open) so the collapsed height tracks the real content and never
          // clips it. Threshold avoids a fractional-pixel re-render loop.
          const measured = e.nativeEvent.layout.height;
          if (measured && Math.abs(measured - height) > 1) setHeight(measured);
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
}

/**
 * App header that hides on scroll. A persistent brand-colored strip fills the
 * status-bar safe area so the clock always has a backdrop, while the logo/action
 * row below it collapses away when scrolling down.
 */
export function CollapsingHeader({
  title,
  showActions = true,
}: {
  title?: string;
  showActions?: boolean;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View>
      {/* Persistent safe-area backdrop so the status bar never overlaps content */}
      <View
        style={{
          height: insets.top,
          backgroundColor: isDark ? "#1E222B" : "#E51F27",
        }}
      />
      <Collapsible>
        <Header title={title} showActions={showActions} safeArea={false} />
      </Collapsible>
    </View>
  );
}
