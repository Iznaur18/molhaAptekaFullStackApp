import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { SiteHeaderBannerSlide } from "@/entities/site-header-banner/model/types";
import { resolveSiteHeaderBannerMobileRoute } from "@/features/deep-linking/lib/resolveSiteHeaderBannerMobileRoute";
import { SITE_HEADER_BANNER_UI } from "@/shared/config";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useSiteHeaderBannerCarouselStyles } from "@/shared/theme/siteHeaderBannerStyles";

type SiteHeaderBannerCarouselProps = {
  slides: SiteHeaderBannerSlide[];
};

export const SiteHeaderBannerCarousel = ({ slides }: SiteHeaderBannerCarouselProps) => {
  const router = useRouter();
  const styles = useSiteHeaderBannerCarouselStyles();
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const listRef = useRef<FlatList<SiteHeaderBannerSlide>>(null);

  const handleViewportLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setViewportWidth(nextWidth);
    }
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused || viewportWidth <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      listRef.current?.scrollToOffset({
        offset: nextIndex * viewportWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, SITE_HEADER_BANNER_UI.AUTOPLAY_MS);

    return () => clearInterval(timerId);
  }, [activeIndex, isPaused, slides.length, viewportWidth]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (viewportWidth <= 0) {
        return;
      }
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / viewportWidth);
      setActiveIndex(Math.min(Math.max(nextIndex, 0), Math.max(slides.length - 1, 0)));
    },
    [slides.length, viewportWidth],
  );

  const handleSlidePress = useCallback(
    (linkPath: string | null) => {
      if (!linkPath) {
        return;
      }
      const route = resolveSiteHeaderBannerMobileRoute(linkPath);
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
        resizeMode="cover"
      />
    );

    return (
      <View style={[styles.slide, slideStyle]}>
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
      </View>
    );
  };

  if (slides.length === 0) {
    return null;
  }

  if (slides.length === 1) {
    return (
      <View
        style={styles.root}
        onLayout={handleViewportLayout}
        accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      >
        {renderSlide(slides[0])}
      </View>
    );
  }

  return (
    <View
      style={styles.root}
      onLayout={handleViewportLayout}
      accessibilityLabel={SITE_HEADER_BANNER_UI.CAROUSEL_ARIA}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      onTouchCancel={() => setIsPaused(false)}
    >
      <View style={styles.viewport}>
        <FlatList
          ref={listRef}
          horizontal
          pagingEnabled
          data={slides}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          renderItem={({ item, index }) => (
            <View
              style={{ width: viewportWidth > 0 ? viewportWidth : "100%" }}
              accessibilityElementsHidden={index !== activeIndex}
              importantForAccessibility={index === activeIndex ? "auto" : "no-hide-descendants"}
            >
              {renderSlide(item)}
            </View>
          )}
        />
      </View>
      <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {slides.map((slide, index) => (
          <Pressable
            key={slide.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
            onPress={() => {
              if (viewportWidth <= 0) {
                return;
              }
              listRef.current?.scrollToOffset({
                offset: index * viewportWidth,
                animated: true,
              });
              setActiveIndex(index);
            }}
          />
        ))}
      </View>
    </View>
  );
};
