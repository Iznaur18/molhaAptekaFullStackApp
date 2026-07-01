import { Pressable, Text, View } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardMediaGalleryNavStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardMediaGalleryNavProps = {
  slideIndex: number;
  slideCount: number;
  onPrevious: () => void;
  onNext: () => void;
};

export const ProductCardMediaGalleryNav = ({
  slideIndex,
  slideCount,
  onPrevious,
  onNext,
}: ProductCardMediaGalleryNavProps) => {
  const styles = useProductCardMediaGalleryNavStyles();

  if (slideCount <= 1) {
    return null;
  }

  return (
    <>
      <View style={styles.navRow} pointerEvents="box-none">
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CARD_UI.GALLERY_PREV}
          onPress={(event) => {
            event.stopPropagation();
            onPrevious();
          }}
        >
          <Text style={styles.navButtonText}>‹</Text>
        </Pressable>
        <Pressable
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel={PRODUCT_CARD_UI.GALLERY_NEXT}
          onPress={(event) => {
            event.stopPropagation();
            onNext();
          }}
        >
          <Text style={styles.navButtonText}>›</Text>
        </Pressable>
      </View>
      <Text
        style={styles.counter}
        accessibilityRole="text"
        accessibilityLabel={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(slideIndex + 1, slideCount)}
      >
        {slideIndex + 1} / {slideCount}
      </Text>
    </>
  );
};
