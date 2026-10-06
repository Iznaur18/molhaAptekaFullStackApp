import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";

import { resolveCategoryDisplayTileImageUri } from "@/entities/product-category-display/lib/resolveProductCategoryDisplay";
import { resolveFlexGridItemWidthStyle } from "@/shared/lib/resolveFlexGridItemWidth";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useCatalogBrowserTileStyles } from "@/shared/theme/catalogProductStyles";

export type CatalogBrowserTileVariant = "category" | "feed";

/** Заливка подложки в SVG-заглушке плитки: светлая → чёрная для тёмной темы. */
const DARK_PLACEHOLDER_FROM = "fill='%23eef2ff'";
const DARK_PLACEHOLDER_TO = "fill='%23000000'";

type CatalogBrowserTileCardProps = {
  label: string;
  imageUrl?: string | null;
  placeholderImageUrl: string;
  /** Админ выключил картинки плиток: только название на чистом фоне. */
  hideImage?: boolean;
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
  hideImage = false,
  tileWidth,
  columns,
  gap,
  contentWidth,
  variant: _variant = "category",
  disabled = false,
  pending = false,
  onPress,
  onEditPress,
  editAriaLabel,
}: CatalogBrowserTileCardProps) => {
  const styles = useCatalogBrowserTileStyles();
  const { theme, colorScheme } = useAppThemeSettings();
  // Фон плитки без картинки: белый в светлой теме, чёрный в тёмной.
  const textTileBackground =
    colorScheme === "dark"
      ? "#000000"
      : colorScheme === "light"
        ? "#ffffff"
        : theme.colors.surface;
  // У заглушки светлая подложка зашита внутрь: в тёмной теме плитка (и
  // категории, и подборки) оставалась светлой. Для тёмной темы берём заглушку
  // с чёрной подложкой.
  const themedPlaceholderImageUrl =
    colorScheme === "dark"
      ? placeholderImageUrl.replace(DARK_PLACEHOLDER_FROM, DARK_PLACEHOLDER_TO)
      : placeholderImageUrl;
  const resolvedImageUrl = resolveCategoryDisplayTileImageUri(
    // Заглушка могла приехать и как «картинка» плитки — тоже подменяем.
    imageUrl === placeholderImageUrl ? null : imageUrl,
    themedPlaceholderImageUrl,
  );
  // В тёмной теме фон плитки чёрный — и с картинкой, и без.
  const darkCategoryBackground =
    colorScheme === "dark" ? { backgroundColor: "#000000" } : null;
  const widthStyle = resolveFlexGridItemWidthStyle({ contentWidth, columns, gap });
  const nativeHeightStyle = Platform.OS === "web" ? null : { height: tileWidth };

  return (
    // Без картинки плитка тянется по тексту, а не по ячейке сетки.
    <View
      style={
        hideImage
          ? [styles.wrap, styles.wrapText]
          : [styles.wrap, widthStyle, nativeHeightStyle]
      }
    >
      <Pressable
        style={[
          styles.card,
          darkCategoryBackground,
          hideImage && styles.cardText,
          hideImage && onEditPress ? styles.cardTextWithEdit : null,
          hideImage && { backgroundColor: textTileBackground },
          (disabled || pending) && styles.cardPending,
        ]}
        onPress={onPress}
        disabled={disabled || pending}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {hideImage ? null : (
          <Image
            source={{ uri: resolvedImageUrl }}
            style={styles.image}
            contentFit="cover"
            recyclingKey={resolvedImageUrl}
          />
        )}
        <View
          style={hideImage ? styles.labelSlotText : styles.labelSlot}
          pointerEvents="none"
        >
          <Text
            style={[styles.label, hideImage && styles.labelText]}
            numberOfLines={hideImage ? undefined : 2}
          >
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
