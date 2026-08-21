import { Image, type ImageStyle } from "expo-image";
import { Text, View, type StyleProp } from "react-native";

import { PRODUCT_UI } from "@/shared/config";
import { useCachedProductImageStyles } from "@/shared/theme/commerceScreenStyles";
import { PRODUCT_IMAGE_BLURHASH } from "@/shared/ui/productImagePlaceholder";

type CachedProductImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  fallbackLabel?: string;
  contentFit?: "cover" | "contain";
  /** Per-image blurhash/thumbhash, если бэкенд его отдаёт. */
  blurhash?: string | null;
  /** Приоритет загрузки: для первого экрана — "high". */
  priority?: "low" | "normal" | "high";
  /** Размытие самого изображения (фон letterbox). */
  blurRadius?: number;
};

export const CachedProductImage = ({
  uri,
  style,
  fallbackLabel = PRODUCT_UI.NO_IMAGE,
  contentFit = "cover",
  blurhash,
  priority = "normal",
  blurRadius,
}: CachedProductImageProps) => {
  const styles = useCachedProductImageStyles();

  if (!uri) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>{fallbackLabel}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={[styles.image, style]}
      contentFit={contentFit}
      // Размытое превью до готовности фото → нет пустого кадра и скачков вёрстки.
      placeholder={{ blurhash: blurhash ?? PRODUCT_IMAGE_BLURHASH }}
      placeholderContentFit={contentFit}
      cachePolicy="memory-disk"
      priority={priority}
      // Сброс вью при смене источника — без «протекания» чужого фото при
      // переиспользовании ячеек списка (виртуализация / FlashList).
      recyclingKey={uri}
      transition={200}
      {...(typeof blurRadius === "number" ? { blurRadius } : null)}
    />
  );
};
