import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
  type ViewStyle,
} from "react-native";

import { useRaffleFeaturedSlideLayout } from "@/entities/raffle/lib/useRaffleFeaturedSlideLayout";
import { RaffleFeaturedBanner } from "@/entities/raffle/ui/RaffleFeaturedBanner";
import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_CAROUSEL_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import {
  RAFFLE_FEATURED_LAYOUT,
  useRaffleFeaturedCarouselStyles,
} from "@/shared/theme/raffleFeaturedStyles";

const CAROUSEL_WINDOW_SIZE = 3;
const CAROUSEL_VIEWABILITY_THRESHOLD = 60;

type RaffleFeaturedCarouselProps = {
  raffles: RaffleFromApi[];
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

type RaffleCarouselSlideProps = {
  raffle: RaffleFromApi;
  cardWidth: number;
  isActive: boolean;
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

const RaffleCarouselSlide = ({
  raffle,
  cardWidth,
  isActive,
  onOpenProducts,
  getManage,
}: RaffleCarouselSlideProps) => (
  <RaffleFeaturedBanner
    raffle={raffle}
    cardWidth={cardWidth}
    onOpenProducts={onOpenProducts}
    manage={getManage?.(raffle) ?? null}
    inCarousel
    isVideoActive={isActive}
  />
);

export const RaffleFeaturedCarousel = ({
  raffles,
  onOpenProducts,
  getManage,
}: RaffleFeaturedCarouselProps) => {
  const styles = useRaffleFeaturedCarouselStyles();
  const { slideWidth, snapInterval } = useRaffleFeaturedSlideLayout();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<RaffleFromApi>>(null);
  const activeIndexRef = useRef(0);
  const cardWidth = viewportWidth > 0 ? viewportWidth : slideWidth;

  const slideWidthStyle = useMemo(
    (): ViewStyle => ({
      width: cardWidth,
    }),
    [cardWidth],
  );

  const contentContainerStyle = useMemo(
    () => ({
      gap: RAFFLE_FEATURED_LAYOUT.slideGap,
    }),
    [],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setViewportWidth(nextWidth);
    }
  }, []);

  useEffect(() => {
    activeIndexRef.current = 0;
    setActiveIndex(0);
  }, [raffles.length]);

  useEffect(() => {
    if (raffles.length <= 1 || isPaused) {
      return undefined;
    }

    const timerId = setInterval(() => {
      const nextIndex = (activeIndexRef.current + 1) % raffles.length;
      activeIndexRef.current = nextIndex;
      listRef.current?.scrollToOffset({
        offset: nextIndex * snapInterval,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, RAFFLE_FEATURED_CAROUSEL_UI.AUTOPLAY_MS);

    return () => clearInterval(timerId);
  }, [isPaused, raffles.length, snapInterval]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / snapInterval);
      const clampedIndex = Math.min(Math.max(nextIndex, 0), Math.max(raffles.length - 1, 0));
      activeIndexRef.current = clampedIndex;
      setActiveIndex(clampedIndex);
    },
    [raffles.length, snapInterval],
  );

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken<RaffleFromApi>[] }) => {
      const firstVisible = viewableItems[0];
      if (firstVisible?.index == null) {
        return;
      }
      activeIndexRef.current = firstVisible.index;
      setActiveIndex(firstVisible.index);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: CAROUSEL_VIEWABILITY_THRESHOLD,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: RaffleFromApi; index: number }) => (
      <View
        style={slideWidthStyle}
        accessibilityElementsHidden={index !== activeIndex}
        importantForAccessibility={index === activeIndex ? "auto" : "no-hide-descendants"}
      >
        <RaffleCarouselSlide
          raffle={item}
          cardWidth={cardWidth}
          isActive={index === activeIndex}
          onOpenProducts={onOpenProducts}
          getManage={getManage}
        />
      </View>
    ),
    [activeIndex, cardWidth, getManage, onOpenProducts, slideWidthStyle],
  );

  if (raffles.length === 0) {
    return null;
  }

  if (raffles.length === 1) {
    const raffle = raffles[0];
    return (
      <View style={styles.singleSlide} onLayout={handleViewportLayout}>
        <RaffleCarouselSlide
          raffle={raffle}
          cardWidth={cardWidth}
          isActive
          onOpenProducts={onOpenProducts}
          getManage={getManage}
        />
      </View>
    );
  }

  return (
    <View
      style={styles.viewport}
      onLayout={handleViewportLayout}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <FlatList
        ref={listRef}
        horizontal
        {...nestedHorizontalScrollProps}
        data={raffles}
        keyExtractor={(item) => item._id}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="start"
        disableIntervalMomentum
        windowSize={CAROUSEL_WINDOW_SIZE}
        maxToRenderPerBatch={1}
        initialNumToRender={1}
        removeClippedSubviews
        contentContainerStyle={contentContainerStyle}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={renderItem}
      />
    </View>
  );
};
