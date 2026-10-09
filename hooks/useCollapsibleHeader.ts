import { useScrollVisibility } from "@/context/ScrollVisibility_Context";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

/**
 * Header trượt theo ngón tay (kiểu Facebook/Chrome): kéo bao nhiêu px thì header
 * dịch bấy nhiêu px, thả tay giữa chừng thì tự trượt nốt về hiện hẳn / ẩn hẳn.
 *
 * Chạy hoàn toàn trên native driver qua `Animated.diffClamp`. `snapShift` là một
 * offset cộng thêm vào input của diffClamp — đổi nó là cách duy nhất để "đẩy"
 * diffClamp về 0 (hiện) hoặc `chromeH` (ẩn) khi snap, vì diffClamp không cho set
 * trực tiếp. `hiddenPx` là bản sao JS của giá trị diffClamp để biết snap về đâu.
 */
export function useCollapsibleHeader(
  chromeH: number,
  onScrollY?: (y: number) => void,
) {
  const { setHidden } = useScrollVisibility();
  const scrollY = useRef(new Animated.Value(0)).current;
  const snapShift = useRef(new Animated.Value(0)).current;
  const snapShiftValue = useRef(0);
  const hiddenPx = useRef(0);
  const lastY = useRef(0);
  const clamp = Math.max(chromeH, 1);

  const moveShiftBy = useCallback(
    (delta: number, animated: boolean) => {
      if (delta === 0) return;
      snapShiftValue.current += delta;
      if (animated) {
        Animated.timing(snapShift, {
          toValue: snapShiftValue.current,
          duration: 180,
          useNativeDriver: true,
        }).start();
      } else {
        snapShift.setValue(snapShiftValue.current);
      }
    },
    [snapShift],
  );

  // diffClamp native bắt đầu từ 0 và cộng dồn chênh lệch input kể từ 0, nên khi
  // tạo lại node (chromeH đổi) phải đưa input về 0 trước — header hiện lại sạch sẽ.
  const translateY = useMemo(() => {
    moveShiftBy(-(lastY.current + snapShiftValue.current), false);
    hiddenPx.current = 0;
    const input = Animated.add(
      scrollY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolateLeft: "clamp",
      }),
      snapShift,
    );
    return Animated.diffClamp(input, 0, clamp).interpolate({
      inputRange: [0, clamp],
      outputRange: [0, -clamp],
      extrapolate: "clamp",
    });
  }, [clamp, scrollY, snapShift, moveShiftBy]);

  const onScroll = useMemo(
    () =>
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: true,
        listener: (e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const rawY = e.nativeEvent.contentOffset.y;
          const y = Math.max(rawY, 0);
          hiddenPx.current = Math.min(
            Math.max(hiddenPx.current + (y - lastY.current), 0),
            clamp,
          );
          lastY.current = y;
          setHidden(y > 8 && hiddenPx.current > clamp / 2);
          onScrollY?.(rawY);
        },
      }),
    [scrollY, clamp, setHidden, onScrollY],
  );

  const snap = useCallback(() => {
    const showFully = hiddenPx.current < clamp / 2 || lastY.current < clamp;
    const target = showFully ? 0 : clamp;
    moveShiftBy(target - hiddenPx.current, true);
    hiddenPx.current = target;
    setHidden(!showFully);
  }, [clamp, moveShiftBy, setHidden]);

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Còn quán tính thì đợi onMomentumScrollEnd mới snap.
      if (Math.abs(e.nativeEvent.velocity?.y ?? 0) < 0.1) snap();
    },
    [snap],
  );

  const reveal = useCallback(() => {
    moveShiftBy(-hiddenPx.current, false);
    hiddenPx.current = 0;
    setHidden(false);
  }, [moveShiftBy, setHidden]);

  useFocusEffect(
    useCallback(() => {
      reveal();
      return () => setHidden(false);
    }, [reveal, setHidden]),
  );

  return {
    translateY,
    reveal,
    scrollProps: {
      onScroll,
      scrollEventThrottle: 16,
      onScrollEndDrag,
      onMomentumScrollEnd: snap,
    },
  };
}
