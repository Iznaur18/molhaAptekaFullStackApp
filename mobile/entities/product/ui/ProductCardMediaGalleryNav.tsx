import { Pressable, Text, View } from "react-native";

import type { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { useProductCardMediaGalleryActions } from "@/entities/product/lib/useProductCardMediaGalleryActions";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardMediaStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardMediaGalleryNavProps = {
  media: ReturnType<typeof useProductCardMediaState>;
};

export const ProductCardMediaGalleryNav = ({ media }: ProductCardMediaGalleryNavProps) => {
  const styles = useProductCardMediaStyles();
  const { hasMultipleSlides, goToPreviousSlide, goToNextSlide } =
    useProductCardMediaGalleryActions(media);

  if (!hasMultipleSlides) {
    return null;
  }

  return (
    <View
      style={styles.galleryOverlay}
      pointerEvents="box-none"
      accessibilityLabel={PRODUCT_CARD_UI.GALLERY_REGION_ARIA}
    >
      <View style={styles.navRow} pointerEvents="box-none">
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CARD_UI.GALLERY_PREV}
          onPress={goToPreviousSlide}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CARD_UI.GALLERY_NEXT}
          onPress={goToNextSlide}
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
    </View>
  );
};
