import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { buildProductMediaSlides } from "@/entities/product/lib/buildProductMediaSlides";
import { ProductMediaHorizontalPager } from "@/entities/product/ui/ProductMediaHorizontalPager";
import { ProductMediaSlideContent } from "@/entities/product/ui/ProductMediaSlideContent";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { useProductMediaGalleryStyles } from "@/shared/theme/catalogProductStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";

type ProductMediaGalleryProps = {
  previewVideoUrl?: string | null;
  imageUrls: string[];
  variant?: "catalog" | "detail";
  onBack?: () => void;
  heroOverlay?: ReactNode;
  reportOverlay?: ReactNode;
};

export const ProductMediaGallery = ({
  previewVideoUrl = null,
  imageUrls,
  variant = "catalog",
  onBack,
  heroOverlay = null,
  reportOverlay = null,
}: ProductMediaGalleryProps) => {
  const styles = useProductMediaGalleryStyles();
  const { height: screenHeight } = useWindowDimensions();
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const isDetail = variant === "detail";

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    return buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls,
    });
  }, [imageUrls, previewVideoUrl, previewVideoFailed]);

  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, mediaSlides.length - 1));
  const pagerSlideCount = Math.max(mediaSlides.length, 1);
  const hasMultipleSlides = mediaSlides.length > 1;

  const heroHeight = Math.min(screenHeight * 0.52, 400);
  const heroStyle = isDetail
    ? [styles.detailHero, { height: heroHeight }]
    : styles.hero;
  const rootStyle = isDetail ? styles.detailRoot : styles.root;
  const counterStyle = isDetail ? styles.detailCounter : styles.counter;

  const renderCounter = () => {
    if (!hasMultipleSlides) {
      return null;
    }
    return (
      <Text style={counterStyle}>
        {safeSlideIndex + 1} / {mediaSlides.length}
      </Text>
    );
  };

  const renderThumbs = () => {
    if (!hasMultipleSlides) {
      return null;
    }
    const thumbStyle = isDetail ? styles.detailThumb : styles.thumb;
    const thumbActiveStyle = isDetail ? styles.detailThumbActive : styles.thumbActive;
    const thumbsWrapStyle = isDetail ? styles.detailThumbs : styles.thumbs;

    return (
      <View style={thumbsWrapStyle}>
        {mediaSlides.map((slide, index) => (
          <Pressable
            key={`${slide.type}-${slide.url}`}
            style={[thumbStyle, index === safeSlideIndex && thumbActiveStyle]}
            onPress={() => setActiveSlideIndex(index)}
          >
            {slide.type === "video" ? (
              <Text style={styles.thumbVideoLabel}>▶</Text>
            ) : (
              <CachedProductImage uri={slide.url} style={styles.thumbImage} />
            )}
          </Pressable>
        ))}
      </View>
    );
  };

  return (
    <View style={rootStyle}>
      <View style={heroStyle}>
        {isDetail && onBack ? (
          <Pressable
            style={styles.detailBackButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
          >
            <MaterialIcons name="chevron-left" size={28} />
          </Pressable>
        ) : null}
        {isDetail ? (
          <View style={styles.detailOverlay} pointerEvents="box-none">
            {heroOverlay}
            {reportOverlay ? <View style={styles.detailReportSlot}>{reportOverlay}</View> : null}
          </View>
        ) : null}
        <ProductMediaHorizontalPager
          style={StyleSheet.absoluteFillObject}
          slideCount={pagerSlideCount}
          activeIndex={safeSlideIndex}
          onIndexChange={setActiveSlideIndex}
          renderSlide={(index) => (
            <ProductMediaSlideContent
              slide={mediaSlides[index] ?? null}
              imageStyle={styles.media}
              onVideoFailed={() => setPreviewVideoFailed(true)}
            />
          )}
        />
        {renderCounter()}
      </View>
      {renderThumbs()}
    </View>
  );
};
