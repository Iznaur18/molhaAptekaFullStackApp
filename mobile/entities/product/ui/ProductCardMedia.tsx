import { Pressable, Text, View } from "react-native";

import type { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductMediaSlideContent } from "@/entities/product/ui/ProductMediaSlideContent";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardMediaStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardMediaProps = {
  media: ReturnType<typeof useProductCardMediaState>;
};

export const ProductCardMedia = ({ media }: ProductCardMediaProps) => {
  const styles = useProductCardMediaStyles();
  const hasMultipleSlides = media.mediaSlides.length > 1;

  const handlePrev = () => {
    const count = media.mediaSlides.length;
    if (count <= 1) {
      return;
    }
    media.setCardSlideIndex((index) => (index - 1 + count) % count);
  };

  const handleNext = () => {
    const count = media.mediaSlides.length;
    if (count <= 1) {
      return;
    }
    media.setCardSlideIndex((index) => (index + 1) % count);
  };

  return (
    <View
      style={styles.frame}
      accessibilityLabel={
        hasMultipleSlides ? PRODUCT_CARD_UI.GALLERY_REGION_ARIA : undefined
      }
    >
      <ProductMediaSlideContent
        slide={media.activeSlide}
        imageStyle={styles.media}
        onVideoFailed={() => media.setPreviewVideoFailed(true)}
      />

      {hasMultipleSlides ? (
        <>
          <View style={styles.navRow} pointerEvents="box-none">
            <Pressable
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel={PRODUCT_CARD_UI.GALLERY_PREV}
              onPress={handlePrev}
            >
              <Text style={styles.navButtonText}>‹</Text>
            </Pressable>
            <Pressable
              style={styles.navButton}
              accessibilityRole="button"
              accessibilityLabel={PRODUCT_CARD_UI.GALLERY_NEXT}
              onPress={handleNext}
            >
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>
          <Text
            style={styles.counter}
            accessibilityLabel={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(
              media.cardSlideIndex + 1,
              media.mediaSlides.length,
            )}
          >
            {media.cardSlideIndex + 1} / {media.mediaSlides.length}
          </Text>
        </>
      ) : null}
    </View>
  );
};
