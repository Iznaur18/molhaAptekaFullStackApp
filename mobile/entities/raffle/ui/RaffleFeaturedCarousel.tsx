import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from "react-native";

import { useRaffleFeaturedSlideLayout } from "@/entities/raffle/lib/useRaffleFeaturedSlideLayout";
import { RaffleFeaturedBanner } from "@/entities/raffle/ui/RaffleFeaturedBanner";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { HOME_FEED_UI, RAFFLE_FEATURED_CAROUSEL_UI } from "@/shared/config";
import {
  RAFFLE_FEATURED_LAYOUT,
  useRaffleFeaturedCarouselStyles,
} from "@/shared/theme/raffleFeaturedStyles";

type RaffleFeaturedCarouselProps = {
  raffles: RaffleFromApi[];
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

export const RaffleFeaturedCarousel = ({
  raffles,
  onOpenProducts,
  getManage,
}: RaffleFeaturedCarouselProps) => {
  const styles = useRaffleFeaturedCarouselStyles();
  const { slideWidth, snapInterval } = useRaffleFeaturedSlideLayout();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<RaffleFromApi>>(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [raffles.length]);

  useEffect(() => {
    if (raffles.length <= 1 || isPaused) {
      return undefined;
    }

    const timerId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % raffles.length;
      listRef.current?.scrollToOffset({
        offset: nextIndex * snapInterval,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, RAFFLE_FEATURED_CAROUSEL_UI.AUTOPLAY_MS);

    return () => clearInterval(timerId);
  }, [activeIndex, isPaused, raffles.length, snapInterval]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / snapInterval);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), Math.max(raffles.length - 1, 0)));
    },
    [raffles.length, snapInterval],
  );

  if (raffles.length === 0) {
    return null;
  }

  if (raffles.length === 1) {
    const raffle = raffles[0];
    return (
      <View style={styles.singleSlide} accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}>
        <RaffleFeaturedBanner
          raffle={raffle}
          onOpenProducts={onOpenProducts}
          manage={getManage?.(raffle) ?? null}
        />
      </View>
    );
  }

  return (
    <View
      style={styles.viewport}
      accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <FlatList
        ref={listRef}
        horizontal
        data={raffles}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        contentContainerStyle={{
          gap: RAFFLE_FEATURED_LAYOUT.slideGap,
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item, index }) => (
          <View
            style={{ width: slideWidth }}
            accessibilityElementsHidden={index !== activeIndex}
            importantForAccessibility={index === activeIndex ? "auto" : "no-hide-descendants"}
          >
            <RaffleFeaturedBanner
              raffle={item}
              onOpenProducts={onOpenProducts}
              manage={getManage?.(item) ?? null}
            />
          </View>
        )}
      />
    </View>
  );
};
