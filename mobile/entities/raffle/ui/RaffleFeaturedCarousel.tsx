import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
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

const ActiveRaffleCarouselIndexContext = createContext(0);

type RaffleFeaturedCarouselProps = {
  raffles: RaffleFromApi[];
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

type RaffleCarouselSlideProps = {
  raffle: RaffleFromApi;
  index: number;
  cardWidth: number;
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

const RaffleCarouselSlide = ({
  raffle,
  index,
  cardWidth,
  onOpenProducts,
  getManage,
}: RaffleCarouselSlideProps) => {
  const activeIndex = useContext(ActiveRaffleCarouselIndexContext);
  const isActive = index === activeIndex;

  return (
    <View
      style={{ width: cardWidth }}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? "auto" : "no-hide-descendants"}
    >
      <RaffleFeaturedBanner
        raffle={raffle}
        cardWidth={cardWidth}
        onOpenProducts={onOpenProducts}
        manage={getManage?.(raffle) ?? null}
        inCarousel
        isVideoActive={isActive}
      />
    </View>
  );
};

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

  const contentContainerStyle = useMemo(
    () => ({
      gap: RAFFLE_FEATURED_LAYOUT.slideGap,
    }),
    [],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth <= 0) {
      return;
    }
    setViewportWidth((prev) => (prev === nextWidth ? prev : nextWidth));
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
      if (activeIndexRef.current === clampedIndex) {
        return;
      }
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
      const nextIndex = firstVisible.index;
      if (activeIndexRef.current === nextIndex) {
        return;
      }
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: CAROUSEL_VIEWABILITY_THRESHOLD,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: RaffleFromApi; index: number }) => (
      <RaffleCarouselSlide
        raffle={item}
        index={index}
        cardWidth={cardWidth}
        onOpenProducts={onOpenProducts}
        getManage={getManage}
      />
    ),
    [cardWidth, getManage, onOpenProducts],
  );

  if (raffles.length === 0) {
    return null;
  }

  if (raffles.length === 1) {
    const raffle = raffles[0];
    return (
      <View style={styles.singleSlide} onLayout={handleViewportLayout}>
        <ActiveRaffleCarouselIndexContext.Provider value={0}>
          <RaffleCarouselSlide
            raffle={raffle}
            index={0}
            cardWidth={cardWidth}
            onOpenProducts={onOpenProducts}
            getManage={getManage}
          />
        </ActiveRaffleCarouselIndexContext.Provider>
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
      <ActiveRaffleCarouselIndexContext.Provider value={activeIndex}>
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
          extraData={activeIndex}
          contentContainerStyle={contentContainerStyle}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onViewableItemsChanged={handleViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          renderItem={renderItem}
        />
      </ActiveRaffleCarouselIndexContext.Provider>
    </View>
  );
};
