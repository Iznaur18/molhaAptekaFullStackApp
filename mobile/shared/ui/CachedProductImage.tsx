import { Image, type ImageStyle } from "expo-image";
import { StyleSheet, Text, View, type StyleProp } from "react-native";

import { PRODUCT_UI } from "@/shared/config";

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

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
  },
  fallbackText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    padding: 8,
  },
});
