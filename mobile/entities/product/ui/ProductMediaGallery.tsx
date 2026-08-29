import { useMemo, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import {
  buildProductMediaSlides,
  resolveProductImageIndexForLightbox,
} from "@/entities/product/lib/buildProductMediaSlides";
import { PRODUCT_MEDIA_GALLERY_READONLY_LAYOUT as GRL } from "@/entities/product/lib/productMediaGalleryReadonlyLayout";
import { isReactNativeWeb } from "@/shared/lib/isReactNativeWeb";
import { ProductMediaHorizontalPager } from "@/entities/product/ui/ProductMediaHorizontalPager";
import { ProductImageLightbox } from "@/entities/product/ui/ProductImageLightbox";
import { ProductMediaSlideContent } from "@/entities/product/ui/ProductMediaSlideContent";
import { PRODUCT_CARD_UI, PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { PRODUCT_DETAIL_HERO_CHROME } from "@/shared/lib/productDetailHeroChromeLayout";
import {
  resolveProductDetailHeroSize,
  type ProductDetailHeroSize,
} from "@/shared/lib/productDetailScreenLayout";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductMediaGalleryStyles } from "@/shared/theme/catalogProductStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { HorizontalOverflowRow } from "@/shared/ui/HorizontalOverflowRow";

type ProductMediaGalleryProps = {
  previewVideoUrl?: string | null;
  imageUrls: string[];
  variant?: "catalog" | "detail";
  heroSize?: ProductDetailHeroSize;
  isSplitLayout?: boolean;
  onBack?: () => void;
  heroOverlay?: ReactNode;
  reportOverlay?: ReactNode;
};

export const ProductMediaGallery = ({
  previewVideoUrl = null,
  imageUrls,
  variant = "catalog",
  heroSize: heroSizeProp,
  isSplitLayout = false,
  onBack,
  heroOverlay = null,
  reportOverlay = null,
}: ProductMediaGalleryProps) => {
  const theme = useAppTheme();
  const styles = useProductMediaGalleryStyles();
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

  const detailHeroSize = useMemo(
    () => heroSizeProp ?? resolveProductDetailHeroSize(360, false),
    [heroSizeProp],
  );
  const heroStyle = isDetail
    ? [
        styles.detailHero,
        {
          width: detailHeroSize.width,
          aspectRatio: detailHeroSize.aspectRatio,
          alignSelf: detailHeroSize.alignSelf,
        },
      ]
    : styles.hero;
  const rootStyle = isDetail
    ? [styles.detailRoot, isSplitLayout && styles.detailRootSplit]
    : styles.root;
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
    const thumbsContentStyle = isDetail
      ? [styles.detailThumbs, isSplitLayout && styles.detailThumbsSplit]
      : styles.thumbs;
    const thumbVideoLabelStyle = isDetail ? styles.detailThumbVideoLabel : styles.thumbVideoLabel;

    const DetailThumbTouchable = isDetail && isReactNativeWeb() ? TouchableOpacity : Pressable;
    const detailThumbActiveOpacity = isDetail && isReactNativeWeb() ? 0.85 : undefined;

    const thumbs = mediaSlides.map((slide, index) => (
      <DetailThumbTouchable
        key={`${slide.type}-${slide.url}`}
        style={[thumbStyle, index === safeSlideIndex && thumbActiveStyle]}
        onPress={() => setActiveSlideIndex(index)}
        accessibilityRole="tab"
        accessibilityState={{ selected: index === safeSlideIndex }}
        {...(detailThumbActiveOpacity != null ? { activeOpacity: detailThumbActiveOpacity } : null)}
      >
        {slide.type === "video" ? (
          <Text style={thumbVideoLabelStyle}>▶</Text>
        ) : (
          <View style={styles.detailThumbImageHost}>
            <CachedProductImage uri={slide.url} style={styles.detailThumbImageFill} />
          </View>
        )}
      </DetailThumbTouchable>
    ));

    if (isDetail) {
      return (
        <HorizontalOverflowRow
          height={GRL.thumbSize}
          trackStyle={thumbsContentStyle}
          accessibilityRole="tablist"
          accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.GALLERY_THUMBS_ARIA}
        >
          {thumbs}
        </HorizontalOverflowRow>
      );
    }

    return <View style={thumbsContentStyle}>{thumbs}</View>;
  };

  return (
    <View style={rootStyle}>
      <View style={heroStyle}>
        <ProductMediaHorizontalPager
          style={[StyleSheet.absoluteFillObject, styles.detailPager]}
          slideCount={pagerSlideCount}
          activeIndex={safeSlideIndex}
          onIndexChange={setActiveSlideIndex}
          renderSlide={(index) => (
            <ProductMediaSlideContent
              slide={mediaSlides[index] ?? null}
              imageStyle={styles.media}
              blurBackdrop={isDetail}
              onVideoFailed={() => setPreviewVideoFailed(true)}
              onPress={
                isDetail && mediaSlides[index]?.type === "image"
                  ? () => setIsLightboxOpen(true)
                  : undefined
              }
              pressAccessibilityLabel={PRODUCT_CARD_UI.IMAGE_LIGHTBOX_OPEN_LABEL}
            />
          )}
        />
        {isDetail && onBack ? (
          <Pressable
            style={styles.detailBackButton}
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={PRODUCT_DETAILS_MODAL_UI.BACK_ARIA}
            hitSlop={8}
          >
            <MaterialIcons
              name="chevron-left"
              size={PRODUCT_DETAIL_HERO_CHROME.iconSize}
              color={theme.colors.text}
            />
          </Pressable>
        ) : null}
        {isDetail ? (
          <View style={styles.detailOverlay} pointerEvents="box-none">
            {heroOverlay}
            {reportOverlay ? <View style={styles.detailReportSlot}>{reportOverlay}</View> : null}
          </View>
        ) : null}
        {renderCounter()}
      </View>
      {renderThumbs()}
      {isDetail ? (
        <ProductImageLightbox
          visible={isLightboxOpen}
          imageUrls={imageUrls}
          startIndex={resolveProductImageIndexForLightbox(mediaSlides, safeSlideIndex)}
          onClose={() => setIsLightboxOpen(false)}
        />
      ) : null}
    </View>
  );
};
