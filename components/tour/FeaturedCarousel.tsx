import { TourCardCompact } from "@/components/tour/TourCardCompact";
import { BRAND } from "@/constants/theme";
import { TourItem } from "@/services/tour";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";

const SCREEN_W = Dimensions.get("window").width;
const CARD_W = SCREEN_W - 32; // 16px gutter each side
const GAP = 12;

/**
 * Auto-advancing featured carousel (TOUR MỚI NHẤT). Scrolls to the next card
 * every 5s, wrapping around, and exposes a dot indicator. Manual swipes update
 * the active dot via `onMomentumScrollEnd`.
 */
export function FeaturedCarousel({
  tours,
  onPressTour,
}: {
  tours: TourItem[];
  onPressTour: (tour: TourItem) => void;
}) {
  const ref = useRef<FlatList<TourItem>>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (tours.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % tours.length;
        ref.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [tours.length]);

  if (!tours.length) return null;

  return (
    <View>
      <FlatList
        ref={ref}
        data={tours}
        keyExtractor={(t) => t.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + GAP}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        getItemLayout={(_, i) => ({
          length: CARD_W + GAP,
          offset: (CARD_W + GAP) * i,
          index: i,
        })}
        onScrollToIndexFailed={({ index: i }) => {
          setTimeout(
            () => ref.current?.scrollToIndex({ index: i, animated: true }),
            300,
          );
        }}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          setIndex(Math.round(x / (CARD_W + GAP)));
        }}
        renderItem={({ item }) => (
          <TourCardCompact
            tour={item}
            width={CARD_W}
            featured
            onPress={() => onPressTour(item)}
          />
        )}
      />

      <View className="flex-row justify-center items-center mt-3">
        {tours.map((_, i) => (
          <View
            key={i}
            style={{
              height: 8,
              borderRadius: 4,
              marginHorizontal: 3,
              width: i === index ? 18 : 8,
              backgroundColor: i === index ? BRAND.red : "#CBD5E1",
            }}
          />
        ))}
      </View>
    </View>
  );
}
