import { Image } from "expo-image";
import { Platform, Pressable, Text, View } from "react-native";
import { resolveProductManageTogglePalette } from "@izibuy/shared-lib";

import {
  resolveProductManageToggleRowVisualStyles,
  type ProductManageToggleRowVariant,
} from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";
import { isDisplayableMediaUrl, resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { useProductManageToggleRowStyles } from "@/shared/theme/modalChromeStyles";

type ProductManageToggleRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: () => void;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  variant?: ProductManageToggleRowVariant;
  ariaLabel?: string;
  titleStatus?: string;
  imageUrl?: string | null;
};

export const ProductManageToggleRow = ({
  title,
  description,
  checked = false,
  onCheckedChange,
  onPress,
  disabled = false,
  pending = false,
  pendingLabel = "",
  variant = "default",
  ariaLabel,
  titleStatus = "",
  imageUrl = null,
}: ProductManageToggleRowProps) => {
  const styles = useProductManageToggleRowStyles();
  const palette = resolveProductManageTogglePalette(variant, checked);
  const resolvedImageUrl =
    imageUrl != null && isDisplayableMediaUrl(imageUrl)
      ? resolveUploadedMediaUrl(String(imageUrl))
      : "";

  if (pending) {
    return (
      <View style={[styles.row, styles.rowPending]} accessibilityLiveRegion="polite">
        <Text style={styles.pendingLabel}>{pendingLabel}</Text>
      </View>
    );
  }

  const handlePress = () => {
    if (disabled) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(!checked);
  };

  const visualStyles = resolveProductManageToggleRowVisualStyles(styles, variant);
  const rowBackgroundStyle =
    palette != null
      ? { backgroundColor: palette.background }
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={ariaLabel ?? (titleStatus ? `${title} ${titleStatus}` : title)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        ...visualStyles,
        rowBackgroundStyle,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
        Platform.OS === "web" && !disabled && styles.rowWebClickable,
      ]}
      onPress={handlePress}
    >
      <View style={styles.rowContent} pointerEvents="none">
        <View style={styles.textBlock}>
          <Text style={[styles.title, palette ? { color: palette.title } : null]}>
            {title}
            {titleStatus ? <Text style={styles.titleStatus}>{` ${titleStatus}`}</Text> : null}
          </Text>
          <Text style={[styles.description, palette ? { color: palette.description } : null]}>
            {description}
          </Text>
        </View>
        {resolvedImageUrl ? (
          <View style={styles.artwork}>
            <Image
              source={{ uri: resolvedImageUrl }}
              style={styles.artworkImage}
              contentFit="contain"
              contentPosition="right center"
              accessibilityIgnoresInvertColors
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
};
