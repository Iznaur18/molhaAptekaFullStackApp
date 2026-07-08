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
  resolveSiteHeaderBannerCarouselIndex,
  resolveSiteHeaderBannerCarouselMetrics,
} from "@/shared/lib/siteHeaderBannerCarouselLayout";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { SITE_HEADER_BANNER_LAYOUT } from "@/shared/lib/siteHeaderBannerLayout";
import { useSiteHeaderBannerCarouselStyles } from "@/shared/theme/siteHeaderBannerStyles";
import { SquircleView } from "@/shared/ui/SquircleView";

type SiteHeaderBannerCarouselProps = {
  slides: SiteHeaderBannerSlide[];
  edgeToEdge?: boolean;
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
  const listRef = useRef<FlatList<SiteHeaderBannerSlide>>(null);

  const carouselMetrics = useMemo(
    () => resolveSiteHeaderBannerCarouselMetrics(viewportWidth),
    [viewportWidth],
  );

  const { slideWidth, gapWidth, stride } = edgeToEdge
    ? {
        slideWidth: viewportWidth,
        gapWidth: 0,
        stride: viewportWidth,
      }
    : carouselMetrics;

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

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setViewportWidth(nextWidth);
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [slides.length, viewportWidth]);

  // Прогреваем memory-disk кеш expo-image, чтобы возврат на ленту показывал
  // баннер мгновенно, без повторной загрузки картинки.
  useEffect(() => {
    const uris = slides
      .map((slide) => resolveUploadedMediaUrl(slide.imageUrl))
      .filter((uri): uri is string => Boolean(uri));
    if (uris.length > 0) {
      void Image.prefetch(uris, { cachePolicy: "memory-disk" });
    }
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || stride <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      listRef.current?.scrollToOffset({
        offset: nextIndex * stride,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, SITE_HEADER_BANNER_UI.AUTOPLAY_MS);

    return () => clearInterval(timerId);
  }, [activeIndex, isPaused, slides.length, stride]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (stride <= 0) {
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;
      setActiveIndex(resolveSiteHeaderBannerCarouselIndex(offsetX, stride, slides.length));
    },
    [slides.length, stride],
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
    <View
      style={[styles.viewport, edgeStyles.viewport]}
    >
      <FlatList
          ref={listRef}
          horizontal
          pagingEnabled={edgeToEdge}
          snapToInterval={edgeToEdge || stride <= 0 ? undefined : stride}
          snapToAlignment="start"
          decelerationRate="fast"
          disableIntervalMomentum
          data={slides}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          getItemLayout={
            stride > 0
              ? (_, index) => ({
                  length: stride,
                  offset: stride * index,
                  index,
                })
              : undefined
          }
          renderItem={({ item, index }) => (
            <View
              style={{
                width: slideWidth > 0 ? slideWidth : "100%",
                marginRight: index < slides.length - 1 ? gapWidth : 0,
              }}
              accessibilityElementsHidden={index !== activeIndex}
              importantForAccessibility={index === activeIndex ? "auto" : "no-hide-descendants"}
            >
              {renderSlide(item)}
            </View>
          )}
        />
        <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {slides.map((slide, index) => (
            <Pressable
              key={slide.id}
              style={[styles.dot, index === activeIndex && styles.dotActive]}
              onPress={() => {
                if (stride <= 0) {
                  return;
                }
                listRef.current?.scrollToOffset({
                  offset: index * stride,
                  animated: true,
                });
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
