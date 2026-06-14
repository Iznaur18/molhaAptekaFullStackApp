import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { buildProductMediaSlides } from "@/entities/product/lib/buildProductMediaSlides";
import { useProductMediaGalleryStyles } from "@/shared/theme/catalogProductStyles";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type ProductMediaGalleryProps = {
  previewVideoUrl?: string | null;
  imageUrls: string[];
};

export const ProductMediaGallery = ({
  previewVideoUrl = null,
  imageUrls,
}: ProductMediaGalleryProps) => {
  const styles = useProductMediaGalleryStyles();
  const [previewVideoFailed, setPreviewVideoFailed] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const mediaSlides = useMemo(() => {
    const videoUrl =
      previewVideoUrl != null && !previewVideoFailed ? previewVideoUrl : null;
    const slides = buildProductMediaSlides({
      previewVideoUrl: videoUrl,
      imageUrls,
    });
    return slides;
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

  if (!activeSlide) {
    return (
      <View style={styles.hero}>
        <CachedProductImage uri={null} style={styles.media} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        {activeSlide.type === "video" ? (
          <ProductPreviewVideo
            uri={activeSlide.url}
            onPlaybackFailed={() => setPreviewVideoFailed(true)}
          />
        ) : (
          <CachedProductImage uri={activeSlide.url} style={styles.media} />
        )}

        {hasMultipleSlides ? (
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
        ) : null}
      </View>

      {hasMultipleSlides ? (
        <View style={styles.thumbs}>
          {mediaSlides.map((slide, index) => (
            <Pressable
              key={`${slide.type}-${slide.url}`}
              style={[styles.thumb, index === safeSlideIndex && styles.thumbActive]}
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
      ) : null}
    </View>
  );
};
