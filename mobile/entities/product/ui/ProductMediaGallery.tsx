import { useMemo, useState, type ReactNode } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { buildProductMediaSlides } from "@/entities/product/lib/buildProductMediaSlides";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { useProductMediaGalleryStyles } from "@/shared/theme/catalogProductStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

const DETAIL_HERO_MIN_HEIGHT_MAX = 448;
const DETAIL_HERO_MIN_HEIGHT_RATIO = 0.58;

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
  const { height: windowHeight } = useWindowDimensions();
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const isDetail = variant === "detail";
  const detailHeroMinHeight = Math.min(
    windowHeight * DETAIL_HERO_MIN_HEIGHT_RATIO,
    DETAIL_HERO_MIN_HEIGHT_MAX,
  );

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    return buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls,
    });
  }, [imageUrls, previewVideoUrl, previewVideoFailed]);

  const safeSlideIndex = Math.min(activeSlideIndex, Math.max(0, mediaSlides.length - 1));
  const activeSlide = mediaSlides[safeSlideIndex] ?? null;
  const hasMultipleSlides = mediaSlides.length > 1;

  const handlePrev = () => {
    if (!hasMultipleSlides) {
      return;
    }
    setActiveSlideIndex((index) => (index - 1 + mediaSlides.length) % mediaSlides.length);
  };

  const handleNext = () => {
    if (!hasMultipleSlides) {
      return;
    }
    setActiveSlideIndex((index) => (index + 1) % mediaSlides.length);
  };

  const heroStyle = isDetail
    ? [styles.detailHero, { minHeight: detailHeroMinHeight }]
    : styles.hero;
  const rootStyle = isDetail ? styles.detailRoot : styles.root;

  const renderHeroMedia = () => {
    if (!activeSlide) {
      return <CachedProductImage uri={null} style={styles.media} />;
    }
    if (activeSlide.type === "video") {
      return (
        <ProductPreviewVideo
          uri={activeSlide.url}
          onPlaybackFailed={() => setPreviewVideoFailed(true)}
        />
      );
    }
    return <CachedProductImage uri={activeSlide.url} style={styles.media} />;
  };

  const renderNav = () => {
    if (!hasMultipleSlides) {
      return null;
    }
    if (isDetail) {
      return (
        <>
          <View style={styles.detailSliderNav} pointerEvents="box-none">
            <Pressable style={styles.detailSliderButton} onPress={handlePrev}>
              <Text style={styles.detailSliderButtonText}>‹</Text>
            </Pressable>
            <Pressable style={styles.detailSliderButton} onPress={handleNext}>
              <Text style={styles.detailSliderButtonText}>›</Text>
            </Pressable>
          </View>
          <Text style={styles.detailCounter}>
            {safeSlideIndex + 1} / {mediaSlides.length}
          </Text>
        </>
      );
    }
    return (
      <>
        <View style={styles.navRow}>
          <Pressable style={styles.navButton} onPress={handlePrev}>
            <Text style={styles.navButtonText}>‹</Text>
          </Pressable>
          <Pressable style={styles.navButton} onPress={handleNext}>
            <Text style={styles.navButtonText}>›</Text>
          </Pressable>
        </View>
        <Text style={styles.counter}>
          {safeSlideIndex + 1} / {mediaSlides.length}
        </Text>
      </>
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
        {renderHeroMedia()}
        {renderNav()}
      </View>
      {renderThumbs()}
    </View>
  );
};
