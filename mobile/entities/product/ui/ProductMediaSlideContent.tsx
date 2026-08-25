import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp } from "react-native";
import type { ImageStyle } from "expo-image";

import type { ProductMediaSlide } from "@/entities/product/lib/buildProductMediaSlides";
import { CachedProductImage } from "@/shared/ui/CachedProductImage";
import { ProductPreviewVideo } from "@/shared/ui/ProductPreviewVideo";

type ProductMediaSlideContentProps = {
  slide: ProductMediaSlide | null;
  imageStyle?: StyleProp<ImageStyle>;
  onVideoFailed?: () => void;
  /** Полное вмещение фото + размытый фон на letterbox (детали товара). */
  blurBackdrop?: boolean;
  /** Тап по фото (не по видео) — открыть полноэкранный просмотр. */
  onPress?: () => void;
  pressAccessibilityLabel?: string;
};

export const ProductMediaSlideContent = ({
  slide,
  imageStyle,
  onVideoFailed,
  blurBackdrop = false,
  onPress,
  pressAccessibilityLabel,
}: ProductMediaSlideContentProps) => {
  if (slide == null) {
    return <CachedProductImage uri={null} style={imageStyle} />;
  }

  if (slide.type === "video") {
    return <ProductPreviewVideo uri={slide.url} onPlaybackFailed={onVideoFailed} />;
  }

  const withPressable = (content: ReactNode) =>
    onPress == null ? (
      content
    ) : (
      <Pressable
        style={StyleSheet.absoluteFillObject}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={pressAccessibilityLabel}
      >
        {content}
      </Pressable>
    );

  if (!blurBackdrop) {
    return withPressable(<CachedProductImage uri={slide.url} style={imageStyle} />);
  }

  return withPressable(
    <View style={styles.blurRoot}>
      <CachedProductImage
        uri={slide.url}
        style={styles.blurLayer}
        contentFit="cover"
        blurRadius={36}
      />
      <CachedProductImage
        uri={slide.url}
        style={[StyleSheet.absoluteFillObject, imageStyle]}
        contentFit="contain"
      />
    </View>,
  );
};

const styles = StyleSheet.create({
  blurRoot: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: 1.16 }],
  },
});
