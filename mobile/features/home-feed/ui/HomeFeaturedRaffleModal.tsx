import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
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
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { FeaturedRaffleManage, RaffleFromApi } from "@/entities/raffle/model/types";
import { FeaturedRaffleModalCard } from "@/entities/raffle/ui/FeaturedRaffleModalCard";
import { HOME_FEED_UI, RAFFLE_FEATURED_BANNER_UI, RAFFLE_FEATURED_CAROUSEL_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { resolveDialogAccessibilityProps } from "@/shared/lib/resolveDialogAccessibilityProps";
import { useAdminEditModalAnimation } from "@/shared/model/useAdminEditModalAnimation";
import {
  FEATURED_RAFFLE_MODAL_ANIMATION,
  RAFFLE_FEATURED_LAYOUT,
  useFeaturedRaffleModalStyles,
} from "@/shared/theme/raffleFeaturedStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

const VISUAL_SIZE_RATIO = 0.94;
const CAROUSEL_WINDOW_SIZE = 3;
const CAROUSEL_VIEWABILITY_THRESHOLD = 60;

const SHEET_CORNER_RADII = {
  topLeft: FEATURED_RAFFLE_MODAL_ANIMATION.sheetRadius,
  topRight: FEATURED_RAFFLE_MODAL_ANIMATION.sheetRadius,
  bottomLeft: 0,
  bottomRight: 0,
} as const;

const ActiveRaffleSlideIndexContext = createContext(0);

type HomeFeaturedRaffleModalProps = {
  visible: boolean;
  raffles: RaffleFromApi[];
  onClose: () => void;
  onOpenProducts: (raffleId: string) => void;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

type HomeFeaturedRaffleModalSlideProps = {
  raffle: RaffleFromApi;
  index: number;
  cardWidth: number;
  visualSize: number;
  visible: boolean;
  getManage?: (raffle: RaffleFromApi) => FeaturedRaffleManage | null;
};

const HomeFeaturedRaffleModalSlide = ({
  raffle,
  index,
  cardWidth,
  visualSize,
  visible,
  getManage,
}: HomeFeaturedRaffleModalSlideProps) => {
  const activeIndex = useContext(ActiveRaffleSlideIndexContext);
  const isActive = index === activeIndex;

  return (
    <View
      style={{ width: cardWidth }}
      accessibilityElementsHidden={!isActive}
      importantForAccessibility={isActive ? "auto" : "no-hide-descendants"}
    >
      <FeaturedRaffleModalCard
        raffle={raffle}
        visualSize={visualSize}
        manage={getManage?.(raffle) ?? null}
        isVideoActive={visible && isActive}
      />
    </View>
  );
};

export const HomeFeaturedRaffleModal = ({
  visible,
  raffles,
  onClose,
  onOpenProducts,
  getManage,
}: HomeFeaturedRaffleModalProps) => {
  const styles = useFeaturedRaffleModalStyles();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<RaffleFromApi>>(null);
  const activeIndexRef = useRef(0);

  const sheetSlideDistance = useMemo(() => windowHeight, [windowHeight]);
  const { modalVisible, backdropAnimatedStyle, sheetAnimatedStyle } =
    useAdminEditModalAnimation(visible, {
      sheetSlideDistance,
      enterMs: FEATURED_RAFFLE_MODAL_ANIMATION.enterMs,
      exitMs: FEATURED_RAFFLE_MODAL_ANIMATION.exitMs,
    });

  const cardWidth = Math.max(0, windowWidth);
  const dialogHeight = Math.round(windowHeight * FEATURED_RAFFLE_MODAL_ANIMATION.heightRatio);
  const visualSize = Math.round(cardWidth * VISUAL_SIZE_RATIO);
  const visualInset = Math.max(0, Math.round((cardWidth - visualSize) / 2));
  const snapInterval = cardWidth + RAFFLE_FEATURED_LAYOUT.slideGap;
  const activeRaffle = raffles[activeIndex] ?? raffles[0] ?? null;

  const contentContainerStyle = useMemo(
    () => ({ gap: RAFFLE_FEATURED_LAYOUT.slideGap }),
    [],
  );
  const scrollContentStyle = useMemo(
    () => [styles.scrollContent, { paddingTop: visualInset }],
    [styles.scrollContent, visualInset],
  );
  const footerStyle = useMemo(
    () => [styles.footer, { paddingBottom: Math.max(12, insets.bottom) }],
    [insets.bottom, styles.footer],
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
      <HomeFeaturedRaffleModalSlide
        raffle={item}
        index={index}
        cardWidth={cardWidth}
        visualSize={visualSize}
        getManage={getManage}
        visible={visible}
      />
    ),
    [cardWidth, getManage, visible, visualSize],
  );

  if (raffles.length === 0 || !modalVisible) {
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
        <ActiveRaffleSlideIndexContext.Provider value={activeIndex}>
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
        </ActiveRaffleSlideIndexContext.Provider>
      </View>
    );

  return (
    <Modal
      visible={modalVisible}
      animationType="none"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
          pointerEvents="box-none"
        >
          <Pressable
            style={styles.backdropPressable}
            accessibilityRole="button"
            accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.CLOSE}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[styles.dialogShell, { height: dialogHeight }, sheetAnimatedStyle]}
        >
          <SquircleView
            cornerRadii={SHEET_CORNER_RADII}
            style={styles.dialog}
            shadowStyle={styles.dialogShadow}
            {...resolveDialogAccessibilityProps()}
            accessibilityLabel={HOME_FEED_UI.RAFFLES_SECTION_ARIA}
          >
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={scrollContentStyle}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {body}
            </ScrollView>

            <View style={footerStyle}>
              <Pressable
                style={styles.footerButton}
                accessibilityRole="button"
                onPress={handleOpenProducts}
              >
                <Text style={styles.footerButtonText}>
                  {RAFFLE_FEATURED_BANNER_UI.OPEN_PRODUCTS}
                </Text>
              </Pressable>
              <Pressable
                style={styles.footerClose}
                accessibilityRole="button"
                accessibilityLabel={RAFFLE_FEATURED_BANNER_UI.CLOSE}
                onPress={onClose}
                hitSlop={8}
              >
                <Text style={styles.footerCloseText}>{RAFFLE_FEATURED_BANNER_UI.CLOSE}</Text>
              </Pressable>
            </View>
          </SquircleView>
        </Animated.View>
      </View>
    </Modal>
  );
};
