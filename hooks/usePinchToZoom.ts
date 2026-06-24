import { useState, useRef, useMemo } from "react";
import { PanResponder } from "react-native";

export function usePinchToZoom(initialScale = 1, minScale = 0.9, maxScale = 2.2) {
  const [scale, setScale] = useState(initialScale);
  const scaleRef = useRef(initialScale);
  const lastScale = useRef(initialScale);
  const initialDistance = useRef(0);

  const getDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt) => {
          // Chỉ phản hồi khi người dùng chạm bằng đúng 2 ngón tay (pinch gesture)
          const touches = evt.nativeEvent?.touches || [];
          return touches.length === 2;
        },
        onPanResponderGrant: (evt) => {
          const touches = evt.nativeEvent?.touches || [];
          if (touches.length === 2) {
            initialDistance.current = getDistance(touches);
          }
        },
        onPanResponderMove: (evt) => {
          const touches = evt.nativeEvent?.touches || [];
          if (touches.length === 2 && initialDistance.current > 0) {
            const currentDistance = getDistance(touches);
            const ratio = currentDistance / initialDistance.current;
            let newScale = lastScale.current * ratio;
            newScale = Math.max(minScale, Math.min(newScale, maxScale));
            scaleRef.current = newScale;
            setScale(newScale);
          }
        },
        onPanResponderRelease: () => {
          lastScale.current = scaleRef.current;
          initialDistance.current = 0;
        },
        onPanResponderTerminate: () => {
          initialDistance.current = 0;
        },
      }),
    [minScale, maxScale]
  );

  return { scale, setScale, panHandlers: panResponder.panHandlers };
}

