import { Pressable, Text, View } from "react-native";

import { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductCardMediaSlide } from "@/entities/product/ui/ProductCardMediaSlide";
import { useProductCompactCardStyles } from "@/shared/theme/productCompactCardStyles";

type ProductCompactCardMediaThumbProps = {
  product: Record<string, unknown> & { _id: string };
  onPress: () => void;
  accessibilityLabel: string;
  dimmed?: boolean;
};

export const ProductCompactCardMediaThumb = ({
  product,
  onPress,
  accessibilityLabel,
  dimmed = false,
}: ProductCompactCardMediaThumbProps) => {
  const styles = useProductCompactCardStyles();
  const cardMedia = useProductCardMediaState(product);
  const slideCount = cardMedia.mediaSlides.length;

  const showPreviousSlide = () => {
    cardMedia.setCardSlideIndex((index) => (index - 1 + slideCount) % slideCount);
  };

  const showNextSlide = () => {
    cardMedia.setCardSlideIndex((index) => (index + 1) % slideCount);
  };

  return (
    <View style={[styles.thumbWrap, dimmed && styles.thumbWrapPending]}>
      <Pressable
        style={({ pressed }) => [styles.thumbPressable, pressed && styles.thumbPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <ProductCardMediaSlide media={cardMedia} />
      </Pressable>

      {slideCount > 1 ? (
        <>
          <Text style={styles.mediaCounter} accessibilityRole="text">
            {cardMedia.cardSlideIndex + 1}/{slideCount}
          </Text>
          <View style={styles.thumbNav} pointerEvents="box-none">
            <Pressable
              style={styles.thumbNavHit}
              onPress={showPreviousSlide}
              accessibilityRole="button"
              accessibilityLabel="Предыдущее фото"
              hitSlop={4}
            >
              <Text style={styles.thumbNavText}>‹</Text>
            </Pressable>
            <Pressable
              style={styles.thumbNavHit}
              onPress={showNextSlide}
              accessibilityRole="button"
              accessibilityLabel="Следующее фото"
              hitSlop={4}
            >
              <Text style={styles.thumbNavText}>›</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </View>
  );
};
