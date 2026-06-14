import { Image, type ImageStyle } from "expo-image";
import { Text, View, type StyleProp } from "react-native";

import { PRODUCT_UI } from "@/shared/config";
import { useCachedProductImageStyles } from "@/shared/theme/commerceScreenStyles";

type CachedProductImageProps = {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  fallbackLabel?: string;
};

export const CachedProductImage = ({
  uri,
  style,
  fallbackLabel = PRODUCT_UI.NO_IMAGE,
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
      contentFit="cover"
      cachePolicy="memory-disk"
      transition={200}
    />
  );
};
