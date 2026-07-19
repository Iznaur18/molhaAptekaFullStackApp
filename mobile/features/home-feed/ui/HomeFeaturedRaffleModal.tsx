import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ViewToken,
} from "react-native";

import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { FeaturedRaffleModalCard } from "@/entities/raffle/ui/FeaturedRaffleModalCard";
import { HOME_FEED_UI, RAFFLE_FEATURED_BANNER_UI, RAFFLE_FEATURED_CAROUSEL_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import {
  RAFFLE_FEATURED_LAYOUT,
  useFeaturedRaffleModalStyles,
} from "@/shared/theme/raffleFeaturedStyles";

const MODAL_HORIZONTAL_PADDING = 16;
const MODAL_MAX_WIDTH = 480;
const MODAL_HEIGHT_RATIO = 0.8;
const VISUAL_SIZE_RATIO = 0.94;
const CAROUSEL_WINDOW_SIZE = 3;
const CAROUSEL_VIEWABILITY_THRESHOLD = 60;

type HomeFeaturedRaffleModalProps = {
  visible: boolean;
  raffles: RaffleFromApi[];
  onClose: () => void;
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

export const HomeFeaturedRaffleModal = ({
  visible,
  raffles,
  onClose,
  onOpenProducts,
  getManage,
}: HomeFeaturedRaffleModalProps) => {
  const styles = useFeaturedRaffleModalStyles();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<RaffleFromApi>>(null);
  const activeIndexRef = useRef(0);

  const cardWidth = Math.min(
    Math.max(0, windowWidth - MODAL_HORIZONTAL_PADDING * 2),
    MODAL_MAX_WIDTH,
  );
  const dialogHeight = Math.round(windowHeight * MODAL_HEIGHT_RATIO);
  const visualSize = Math.round(cardWidth * VISUAL_SIZE_RATIO);
  const snapInterval = cardWidth + RAFFLE_FEATURED_LAYOUT.slideGap;
  const activeRaffle = raffles[activeIndex] ?? raffles[0] ?? null;

  const contentContainerStyle = useMemo(
    () => ({ gap: RAFFLE_FEATURED_LAYOUT.slideGap }),
    [],
  );

  useEffect(() => {
    if (!visible) {
      activeIndexRef.current = 0;
      setActiveIndex(0);
      setIsPaused(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || raffles.length <= 1 || isPaused) {
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
  }, [isPaused, raffles.length, snapInterval, visible]);

  const handleOpenProducts = useCallback(() => {
    if (!activeRaffle) {
      return;
    }
    onClose();
    onOpenProducts(activeRaffle._id);
  }, [activeRaffle, onClose, onOpenProducts]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / snapInterval);
      const clampedIndex = Math.min(
        Math.max(nextIndex, 0),
        Math.max(raffles.length - 1, 0),
      );
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
        style={{ width: cardWidth }}
        accessibilityElementsHidden={index !== activeIndex}
        importantForAccessibility={index === activeIndex ? "auto" : "no-hide-descendants"}
      >
        <FeaturedRaffleModalCard
          raffle={item}
          visualSize={visualSize}
          manage={getManage?.(item) ?? null}
          isVideoActive={visible && index === activeIndex}
        />
      </View>
    ),
    [activeIndex, cardWidth, getManage, visible, visualSize],
  );

  if (raffles.length === 0) {
    return null;
  }

  const body =
    raffles.length === 1 ? (
      <FeaturedRaffleModalCard
        raffle={raffles[0]}
        visualSize={visualSize}
        manage={getManage?.(raffles[0]) ?? null}
        isVideoActive={visible}
      />
    ) : (
      <View
        style={styles.carousel}
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdropPressable}
          accessibilityRole="button"
          accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.CLOSE}
          onPress={onClose}
        />
        <View
          style={[styles.dialog, { width: cardWidth, height: dialogHeight }]}
          accessibilityRole="dialog"
          accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}
        >
          <View style={styles.header}>
            <Pressable
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.CLOSE}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={styles.closeButtonText}>{RAFFLE_FEATURED_BANNER_UI.CLOSE}</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {body}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={styles.footerButton}
              accessibilityRole="button"
              onPress={handleOpenProducts}
            >
              <Text style={styles.footerButtonText}>
                {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
