import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";

import { resolveCategoryDisplayTileImageUri } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { resolveFlexGridItemWidthStyle } from "@/shared/lib/resolveFlexGridItemWidth";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useCatalogBrowserTileStyles } from "@/shared/theme/catalogProductStyles";

export type CatalogBrowserTileVariant = "category" | "feed";

type CatalogBrowserTileCardProps = {
  label: string;
  imageUrl?: string | null;
  placeholderImageUrl: string;
  tileWidth: number;
  columns: number;
  gap: number;
  contentWidth: number;
  variant?: CatalogBrowserTileVariant;
  disabled?: boolean;
  pending?: boolean;
  onPress: () => void;
  onEditPress?: () => void;
  editAriaLabel?: string;
};

export const CatalogBrowserTileCard = ({
  label,
  imageUrl,
  placeholderImageUrl,
  tileWidth,
  columns,
  gap,
  contentWidth,
  variant = "category",
  disabled = false,
  pending = false,
  onPress,
  onEditPress,
  editAriaLabel,
}: CatalogBrowserTileCardProps) => {
  const styles = useCatalogBrowserTileStyles();
  const { theme } = useAppThemeSettings();
  const resolvedImageUrl = resolveCategoryDisplayTileImageUri(imageUrl, placeholderImageUrl);
  const isFeedTile = variant === "feed";
  const widthStyle = resolveFlexGridItemWidthStyle({ contentWidth, columns, gap });
  const nativeHeightStyle = Platform.OS === "web" ? null : { height: tileWidth };

  return (
    <View style={[styles.wrap, widthStyle, nativeHeightStyle]}>
      <Pressable
        style={[
          styles.card,
          isFeedTile && styles.cardFeed,
          (disabled || pending) && styles.cardPending,
        ]}
        onPress={onPress}
        disabled={disabled || pending}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Image
          source={{ uri: resolvedImageUrl }}
          style={styles.image}
          contentFit="cover"
          recyclingKey={resolvedImageUrl}
        />
        <View style={styles.labelSlot} pointerEvents="none">
          <Text style={styles.label} numberOfLines={2}>
            {label}
          </Text>
        </View>
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
