import { Platform, Pressable, Text, View } from "react-native";

import {
  resolveProductManageToggleRowVisualStyles,
  type ProductManageToggleRowVariant,
} from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";
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
}: ProductManageToggleRowProps) => {
  const styles = useProductManageToggleRowStyles();

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

  const visualStyles = resolveProductManageToggleRowVisualStyles(styles, variant, checked);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={ariaLabel ?? (titleStatus ? `${title} ${titleStatus}` : title)}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        ...visualStyles,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
        Platform.OS === "web" && !disabled && styles.rowWebClickable,
      ]}
      onPress={handlePress}
    >
      <View style={styles.textBlock} pointerEvents="none">
        <Text style={styles.title}>
          {title}
          {titleStatus ? <Text style={styles.titleStatus}>{` ${titleStatus}`}</Text> : null}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Pressable>
  );
};
