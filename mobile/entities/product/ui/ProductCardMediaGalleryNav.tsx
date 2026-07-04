import { Text } from "react-native";

import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardMediaGalleryNavStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardMediaGalleryCounterProps = {
  slideIndex: number;
  slideCount: number;
};

export const ProductCardMediaGalleryCounter = ({
  slideIndex,
  slideCount,
}: ProductCardMediaGalleryCounterProps) => {
  const styles = useProductCardMediaGalleryNavStyles();

  if (slideCount <= 1) {
    return null;
  }

  return (
    <Text
      style={styles.counter}
      accessibilityRole="text"
      accessibilityLabel={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(slideIndex + 1, slideCount)}
    >
      {slideIndex + 1} / {slideCount}
    </Text>
  );
};
