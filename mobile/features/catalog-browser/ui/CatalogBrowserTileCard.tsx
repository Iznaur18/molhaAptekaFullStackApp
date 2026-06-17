import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";

import { resolveCategoryDisplayTileImageUri } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { useCatalogBrowserTileStyles } from "@/shared/theme/catalogProductStyles";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";

export type CatalogBrowserTileVariant = "category" | "feed";

type CatalogBrowserTileCardProps = {
  label: string;
  imageUrl?: string | null;
  placeholderImageUrl: string;
  tileWidth: number;
  variant?: CatalogBrowserTileVariant;
  onPress: () => void;
  onEditPress?: () => void;
  editAriaLabel?: string;
};

export const CatalogBrowserTileCard = ({
  label,
  imageUrl,
  placeholderImageUrl,
  tileWidth,
  variant = "category",
  onPress,
  onEditPress,
  editAriaLabel,
}: CatalogBrowserTileCardProps) => {
  const styles = useCatalogBrowserTileStyles();
  const { theme } = useAppThemeSettings();
  const resolvedImageUrl = resolveCategoryDisplayTileImageUri(imageUrl, placeholderImageUrl);
  const isFeedTile = variant === "feed";

  return (
    <View style={[styles.wrap, { width: tileWidth }]}>
      <Pressable
        style={[styles.card, isFeedTile && styles.cardFeed]}
        onPress={onPress}
      >
        <View style={styles.imageWrap}>
          <Image source={{ uri: resolvedImageUrl }} style={styles.image} contentFit="cover" />
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
          <MaterialIcons name="edit" size={16} color={theme.colors.link} />
        </Pressable>
      ) : null}
    </View>
  );
};
