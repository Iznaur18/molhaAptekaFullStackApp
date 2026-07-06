import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import {
  PRODUCT_CARD_GALLERY_DOT_ACTIVE_WIDTH,
  PRODUCT_CARD_GALLERY_DOT_WIDTH,
} from "@/entities/product/lib/productCardGalleryDotsLayout";
import { PRODUCT_CARD_UI } from "@/shared/config";
import { useProductCardGalleryDotsStyles } from "@/shared/theme/catalogProductStyles";

const DOT_SPRING = { damping: 18, stiffness: 340 };

type GalleryDotProps = {
  active: boolean;
};

const GalleryDot = ({ active }: GalleryDotProps) => {
  const styles = useProductCardGalleryDotsStyles();
  const width = useSharedValue(active ? PRODUCT_CARD_GALLERY_DOT_ACTIVE_WIDTH : PRODUCT_CARD_GALLERY_DOT_WIDTH);

  useEffect(() => {
    width.value = withSpring(
      active ? PRODUCT_CARD_GALLERY_DOT_ACTIVE_WIDTH : PRODUCT_CARD_GALLERY_DOT_WIDTH,
      DOT_SPRING,
    );
  }, [active, width]);

  const dotStyle = useAnimatedStyle(() => ({
    width: width.value,
    opacity: active ? 1 : 0.42,
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

type ProductCardGalleryDotsProps = {
  slideIndex: number;
  slideCount: number;
};

export const ProductCardGalleryDots = ({
  slideIndex,
  slideCount,
}: ProductCardGalleryDotsProps) => {
  const styles = useProductCardGalleryDotsStyles();

  if (slideCount <= 1) {
    return null;
  }

  return (
    <View
      style={styles.root}
      accessibilityRole="text"
      accessibilityLabel={PRODUCT_CARD_UI.GALLERY_COUNTER_ARIA(slideIndex + 1, slideCount)}
    >
      {Array.from({ length: slideCount }, (_, index) => (
        <GalleryDot key={index} active={index === slideIndex} />
      ))}
    </View>
  );
};
