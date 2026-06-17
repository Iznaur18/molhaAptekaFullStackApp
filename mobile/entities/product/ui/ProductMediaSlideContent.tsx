import type { StyleProp } from "react-native";
import type { ImageStyle } from "expo-image";

import type { ProductMediaSlide } from "@/entities/product/lib/buildProductMediaSlides";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type ProductMediaSlideContentProps = {
  slide: ProductMediaSlide | null;
  imageStyle?: StyleProp<ImageStyle>;
  onVideoFailed?: () => void;
};

export const ProductMediaSlideContent = ({
  slide,
  imageStyle,
  onVideoFailed,
}: ProductMediaSlideContentProps) => {
  if (slide == null) {
    return <CachedProductImage uri={null} style={imageStyle} />;
  }

  if (slide.type === "video") {
    return <ProductPreviewVideo uri={slide.url} onPlaybackFailed={onVideoFailed} />;
  }

  return <CachedProductImage uri={slide.url} style={imageStyle} />;
};
