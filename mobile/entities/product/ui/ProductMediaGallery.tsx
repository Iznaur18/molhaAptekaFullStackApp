import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { buildProductMediaSlides } from "@/entities/product/lib/buildProductMediaSlides";
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

  const safeSlideIndex = Math.min(
    activeSlideIndex,
    Math.max(0, mediaSlides.length - 1),
  );
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

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  hero: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f4f4f4",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  navRow: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    transform: [{ translateY: -20 }],
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  counter: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  thumbs: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbActive: {
    borderColor: "#111",
    borderWidth: 2,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbVideoLabel: {
    fontSize: 18,
    color: "#111",
  },
});
