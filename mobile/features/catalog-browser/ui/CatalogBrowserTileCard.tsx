import { Image, Pressable, Text, View } from "react-native";

import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useCatalogBrowserTileStyles } from "@/shared/theme/catalogProductStyles";

type CatalogBrowserTileCardProps = {
  label: string;
  imageUrl?: string | null;
  onPress: () => void;
  onEditPress?: () => void;
  editAriaLabel?: string;
};

export const CatalogBrowserTileCard = ({
  label,
  imageUrl,
  onPress,
  onEditPress,
  editAriaLabel,
}: CatalogBrowserTileCardProps) => {
  const styles = useCatalogBrowserTileStyles();
  const resolvedImageUrl = imageUrl ? resolveUploadedMediaUrl(imageUrl) : "";

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.card} onPress={onPress}>
        <View style={styles.imageWrap}>
          {resolvedImageUrl ? (
            <Image source={{ uri: resolvedImageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.placeholder}>{label.slice(0, 1).toUpperCase()}</Text>
          )}
        </View>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </Pressable>
      {onEditPress ? (
        <Pressable
          style={styles.editButton}
          onPress={onEditPress}
          accessibilityLabel={editAriaLabel}
        >
          <Text style={styles.editButtonText}>✎</Text>
        </Pressable>
      ) : null}
    </View>
  );
};
