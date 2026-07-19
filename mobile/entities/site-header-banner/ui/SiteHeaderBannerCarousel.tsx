import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Linking,
  Pressable,
  Text,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import type { SiteHeaderBannerSlide } from "@/entities/site-header-banner/model/types";
import { resolveSiteHeaderBannerMobileRoute } from "@/features/deep-linking/lib/resolveSiteHeaderBannerMobileRoute";
import { SITE_HEADER_BANNER_UI } from "@/shared/config";
import {
  resolveSiteHeaderBannerCarouselLoopIndexFromLogical,
  resolveSiteHeaderBannerCarouselLoopIndexFromOffset,
  resolveSiteHeaderBannerCarouselLoopJumpTarget,
  resolveSiteHeaderBannerCarouselLoopLogicalIndex,
  resolveSiteHeaderBannerCarouselMetrics,
} from "@/shared/lib/siteHeaderBannerCarouselLayout";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { SITE_HEADER_BANNER_LAYOUT } from "@/shared/lib/siteHeaderBannerLayout";
import { useSiteHeaderBannerCarouselStyles } from "@/shared/theme/siteHeaderBannerStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

/** Ждём окончания animated scrollToOffset перед прыжком с клона. */
const LOOP_AUTOPLAY_SETTLE_MS = 450;

type SiteHeaderBannerCarouselProps = {
  slides: SiteHeaderBannerSlide[];
  edgeToEdge?: boolean;
};

type LoopSlideItem = {
  key: string;
  slide: SiteHeaderBannerSlide;
  logicalIndex: number;
};

const buildLoopSlideItems = (slides: SiteHeaderBannerSlide[]): LoopSlideItem[] => {
  if (slides.length <= 1) {
    return slides.map((slide, logicalIndex) => ({
      key: slide.id,
      slide,
      logicalIndex,
    }));
  }

  const first = slides[0];
  const last = slides[slides.length - 1];

  return [
    {
      key: `loop-tail-${last.id}`,
      slide: last,
      logicalIndex: slides.length - 1,
    },
    ...slides.map((slide, logicalIndex) => ({
      key: slide.id,
      slide,
      logicalIndex,
    })),
    {
      key: `loop-head-${first.id}`,
      slide: first,
      logicalIndex: 0,
    },
  ];
};

export const SiteHeaderBannerCarousel = ({
  slides,
  edgeToEdge = false,
}: SiteHeaderBannerCarouselProps) => {
  const router = useRouter();
  const styles = useSiteHeaderBannerCarouselStyles();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<LoopSlideItem>>(null);
  const isJumpingRef = useRef(false);

  const carouselMetrics = useMemo(
    () => resolveSiteHeaderBannerCarouselMetrics(viewportWidth),
    [viewportWidth],
  );

  const { slideWidth, stride, sideInset } = edgeToEdge
    ? {
        slideWidth: viewportWidth,
        stride: viewportWidth,
        sideInset: 0,
      }
    : carouselMetrics;

  const loopEnabled = slides.length > 1;
  const loopItems = useMemo(() => buildLoopSlideItems(slides), [slides]);

  const contentContainerStyle = useMemo(
    () => (sideInset > 0 ? { paddingHorizontal: sideInset } : undefined),
    [sideInset],
  );

  const edgeStyles = edgeToEdge
    ? {
        viewport: styles.viewportEdgeToEdge,
        slide: styles.slideEdgeToEdge,
        singleSlide: styles.singleSlideEdgeToEdge,
      }
    : {
        viewport: undefined,
        slide: undefined,
        singleSlide: undefined,
      };

  const scrollToLoopIndex = useCallback(
    (loopIndex: number, animated: boolean) => {
      if (stride <= 0) {
        return;
      }

      listRef.current?.scrollToOffset({
        offset: loopIndex * stride,
        animated,
      });
    },
    [stride],
  );

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setViewportWidth(nextWidth);
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    if (stride <= 0) {
      return;
    }

    const startLoopIndex = loopEnabled
      ? resolveSiteHeaderBannerCarouselLoopIndexFromLogical(0)
      : 0;
    scrollToLoopIndex(startLoopIndex, false);
  }, [loopEnabled, scrollToLoopIndex, slides.length, stride]);

  useEffect(() => {
    const uris = slides
      .map((slide) => resolveUploadedMediaUrl(slide.imageUrl))
      .filter((uri): uri is string => Boolean(uri));
    if (uris.length > 0) {
      void Image.prefetch(uris, { cachePolicy: "memory-disk" });
    }
  }, [slides]);

  const settleLoopFromOffset = useCallback(
    (offsetX: number) => {
      if (stride <= 0 || isJumpingRef.current || !loopEnabled) {
        return;
      }

      const loopIndex = resolveSiteHeaderBannerCarouselLoopIndexFromOffset(offsetX, stride);
      const jumpTarget = resolveSiteHeaderBannerCarouselLoopJumpTarget(loopIndex, slides.length);

      if (jumpTarget != null) {
        isJumpingRef.current = true;
        scrollToLoopIndex(jumpTarget, false);
        setActiveIndex(
          resolveSiteHeaderBannerCarouselLoopLogicalIndex(jumpTarget, slides.length),
        );
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
        return;
      }

      setActiveIndex(resolveSiteHeaderBannerCarouselLoopLogicalIndex(loopIndex, slides.length));
    },
    [loopEnabled, scrollToLoopIndex, slides.length, stride],
  );

  useEffect(() => {
    if (!loopEnabled || isPaused || stride <= 0) {
      return undefined;
    }

    let settleTimerId: ReturnType<typeof setTimeout> | undefined;

    const timerId = setInterval(() => {
      const currentLoopIndex = resolveSiteHeaderBannerCarouselLoopIndexFromLogical(activeIndex);
      const nextLoopIndex = currentLoopIndex + 1;
      scrollToLoopIndex(nextLoopIndex, true);

      const jumpTarget = resolveSiteHeaderBannerCarouselLoopJumpTarget(
        nextLoopIndex,
        slides.length,
      );

      if (jumpTarget != null) {
        if (settleTimerId != null) {
          clearTimeout(settleTimerId);
        }
        settleTimerId = setTimeout(() => {
          isJumpingRef.current = true;
          scrollToLoopIndex(jumpTarget, false);
          setActiveIndex(
            resolveSiteHeaderBannerCarouselLoopLogicalIndex(jumpTarget, slides.length),
          );
          isJumpingRef.current = false;
        }, LOOP_AUTOPLAY_SETTLE_MS);
        return;
      }

      setActiveIndex(
        resolveSiteHeaderBannerCarouselLoopLogicalIndex(nextLoopIndex, slides.length),
      );
    }, SITE_HEADER_BANNER_UI.AUTOPLAY_MS);

    return () => {
      clearInterval(timerId);
      if (settleTimerId != null) {
        clearTimeout(settleTimerId);
      }
    };
  }, [activeIndex, isPaused, loopEnabled, scrollToLoopIndex, slides.length, stride]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settleLoopFromOffset(event.nativeEvent.contentOffset.x);
    },
    [settleLoopFromOffset],
  );

  const handleScrollEndDrag = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      settleLoopFromOffset(event.nativeEvent.contentOffset.x);
    },
    [settleLoopFromOffset],
  );

  const handleSlidePress = useCallback(
    (linkPath: string | null) => {
      if (!linkPath) {
        return;
      }
      const trimmed = linkPath.trim();
      if (/^https?:\/\//i.test(trimmed)) {
        void Linking.openURL(trimmed);
        return;
      }
      const route = resolveSiteHeaderBannerMobileRoute(trimmed);
      if (route) {
        router.push(route as never);
      }
    },
    [router],
  );

  const renderSlide = (slide: SiteHeaderBannerSlide) => {
    const imageUri = resolveUploadedMediaUrl(slide.imageUrl);
    const slideStyle = slide.backgroundColor
      ? { backgroundColor: slide.backgroundColor }
      : undefined;
    const image = (
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        accessibilityLabel={slide.imageAlt}
        contentFit="cover"
        cachePolicy="memory-disk"
        transition={200}
      />
    );

    return (
      <View style={[styles.slide, edgeStyles.slide, slideStyle]}>
        {slide.linkPath ? (
          <Pressable
            style={styles.pressable}
            accessibilityRole="button"
            onPress={() => handleSlidePress(slide.linkPath)}
          >
            {image}
          </Pressable>
        ) : (
          image
        )}
        <View style={styles.adBadge} pointerEvents="none" accessibilityElementsHidden>
          <Text style={styles.adBadgeText}>{SITE_HEADER_BANNER_UI.AD_BADGE}</Text>
        </View>
      </View>
    );
  };

  if (slides.length === 0) {
    return null;
  }

  const rootStyle: StyleProp<ViewStyle> = styles.root;

  if (slides.length === 1) {
    const singleSlideContent = (
      <View
        style={[rootStyle, styles.singleSlide, edgeStyles.singleSlide]}
        onLayout={handleViewportLayout}
        accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      >
        {renderSlide(slides[0])}
      </View>
    );

    if (edgeToEdge) {
      return singleSlideContent;
    }

    return (
      <SquircleView radius={SITE_HEADER_BANNER_LAYOUT.radius} style={rootStyle}>
        <View
          style={[styles.singleSlide, edgeStyles.singleSlide]}
          onLayout={handleViewportLayout}
          accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
        >
          {renderSlide(slides[0])}
        </View>
      </SquircleView>
    );
  }

  const carouselBody = (
    <View style={[styles.viewport, edgeStyles.viewport]}>
      <FlatList
        ref={listRef}
        horizontal
        {...nestedHorizontalScrollProps}
        pagingEnabled={edgeToEdge}
        snapToInterval={edgeToEdge || stride <= 0 ? undefined : stride}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        data={loopItems}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScrollEndDrag={handleScrollEndDrag}
        getItemLayout={
          stride > 0
            ? (_, index) => ({
                length: stride,
                offset: stride * index,
                index,
              })
            : undefined
        }
        renderItem={({ item }) => (
          <View
            style={{
              width: stride > 0 ? stride : "100%",
            }}
            accessibilityElementsHidden={item.logicalIndex !== activeIndex}
            importantForAccessibility={
              item.logicalIndex === activeIndex ? "auto" : "no-hide-descendants"
            }
          >
            <View style={{ width: slideWidth > 0 ? slideWidth : "100%" }}>
              {renderSlide(item.slide)}
            </View>
          </View>
        )}
      />
      <View
        style={styles.dots}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {slides.map((slide, index) => (
          <Pressable
            key={slide.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
            onPress={() => {
              if (stride <= 0) {
                return;
              }
              scrollToLoopIndex(
                resolveSiteHeaderBannerCarouselLoopIndexFromLogical(index),
                true,
              );
              setActiveIndex(index);
            }}
          />
        ))}
      </View>
    </View>
  );

  if (edgeToEdge) {
    return (
      <View
        style={rootStyle}
        onLayout={handleViewportLayout}
        accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        onTouchCancel={() => setIsPaused(false)}
      >
        {carouselBody}
      </View>
    );
  }

  return (
    <View
      style={rootStyle}
      onLayout={handleViewportLayout}
      accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <SquircleView radius={SITE_HEADER_BANNER_LAYOUT.radius}>{carouselBody}</SquircleView>
    </View>
  );
};
