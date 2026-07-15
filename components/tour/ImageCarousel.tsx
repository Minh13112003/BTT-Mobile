import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ImageCarouselProps {
  images: string[];
  height?: number;
  autoPlayInterval?: number;
  onPressImage?: (url: string) => void;
}

/**
 * Auto-play image carousel with swipe support and dot indicators.
 * Falls back gracefully to a single image when images[] has one item.
 */
export function ImageCarousel({
  images,
  height = 286,
  autoPlayInterval = 5000,
  onPressImage,
}: ImageCarouselProps) {
  const validImages = images?.length ? images : [""];
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<string>>(null);
  const itemWidth = SCREEN_WIDTH;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const scheduleNext = useCallback(
    (currentIndex: number) => {
      if (validImages.length <= 1) return;
      stopTimer();
      timerRef.current = setTimeout(() => {
        const next = (currentIndex + 1) % validImages.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        setActiveIndex(next);
        scheduleNext(next);
      }, autoPlayInterval);
    },
    [validImages.length, autoPlayInterval, stopTimer],
  );

  useEffect(() => {
    scheduleNext(0);
    return stopTimer;
  }, [scheduleNext, stopTimer]);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
  );

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(
      e.nativeEvent.contentOffset.x / itemWidth,
    );
    setActiveIndex(index);
    scheduleNext(index);
  };

  return (
    <View style={{ width: "100%", height }}>
      <FlatList
        ref={flatListRef}
        data={validImages}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(_, index) => ({
          length: itemWidth,
          offset: itemWidth * index,
          index,
        })}
        renderItem={({ item }) => (
          <Image
            source={{ uri: item }}
            style={{ width: itemWidth, height }}
            resizeMode="cover"
          />
        )}
      />

      {/* Dot indicators — chỉ hiện khi có nhiều hơn 1 ảnh */}
      {validImages.length > 1 && (
        <View
          style={{
            position: "absolute",
            bottom: 56,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
          }}
        >
          {validImages.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 20 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor:
                  i === activeIndex
                    ? "#D0021B"
                    : "rgba(255,255,255,0.55)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
}
