import { View } from "react-native";

import type { useProductCardMediaState } from "@/entities/product/lib/useProductCardMediaState";
import { ProductMediaSlideContent } from "@/entities/product/ui/ProductMediaSlideContent";
import { useProductCardMediaStyles } from "@/shared/theme/catalogProductStyles";

type ProductCardMediaSlideProps = {
  media: ReturnType<typeof useProductCardMediaState>;
};

export const ProductCardMediaSlide = ({ media }: ProductCardMediaSlideProps) => {
  const styles = useProductCardMediaStyles();

  return (
    <View style={styles.frame}>
      <ProductMediaSlideContent
        slide={media.activeSlide}
        imageStyle={styles.media}
        onVideoFailed={() => media.setPreviewVideoFailed(true)}
      />
    </View>
  );
};
