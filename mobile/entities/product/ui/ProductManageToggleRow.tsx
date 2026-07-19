import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Switch, Text, View } from "react-native";

import type { ProductManageToggleRowVariant } from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
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
  /** @deprecated статус только через Switch */
  titleStatus?: string;
  /** @deprecated artwork убран из UI */
  imageUrl?: string | null;
};

const resolveControl = (
  variant: ProductManageToggleRowVariant,
  onPress?: () => void,
): "switch" | "chevron" | "none" => {
  if (variant === "danger") {
    return "none";
  }
  if (variant === "installment" && onPress) {
    return "chevron";
  }
  return "switch";
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
}: ProductManageToggleRowProps) => {
  const theme = useAppTheme();
  const styles = useProductManageToggleRowStyles();
  const control = resolveControl(variant, onPress);
  const isDanger = variant === "danger";

  if (pending) {
    return (
      <View style={[styles.row, styles.rowPending]} accessibilityLiveRegion="polite">
        <Text style={styles.pendingLabel}>{pendingLabel}</Text>
      </View>
    );
  }

  const handleActivate = () => {
    if (disabled) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(!checked);
  };

  const handleSwitchChange = (next: boolean) => {
    if (disabled) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    onCheckedChange?.(next);
  };

  if (control === "switch") {
    return (
      <View
        style={[styles.row, disabled && styles.rowDisabled]}
        accessibilityRole="switch"
        accessibilityState={{ disabled, checked }}
        accessibilityLabel={ariaLabel ?? title}
      >
        <Pressable
          style={styles.textPressable}
          disabled={disabled}
          onPress={handleActivate}
          accessibilityRole="button"
          accessibilityLabel={ariaLabel ?? title}
        >
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </Pressable>
        <Switch
          value={checked}
          disabled={disabled}
          onValueChange={handleSwitchChange}
          trackColor={{
            false: theme.colors.actionBorder,
            true: theme.colors.action,
          }}
          thumbColor={theme.colors.onContrast}
          ios_backgroundColor={theme.colors.actionBorder}
        />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={ariaLabel ?? title}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        isDanger && styles.rowDanger,
        disabled && styles.rowDisabled,
        pressed && !disabled && styles.rowPressed,
      ]}
      onPress={handleActivate}
    >
      <View style={styles.textBlock} pointerEvents="none">
        <Text style={[styles.title, isDanger && styles.titleDanger]} numberOfLines={1}>
          {title}
        </Text>
        <Text
          style={[styles.description, isDanger && styles.descriptionDanger]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>
      {control === "chevron" ? (
        <MaterialIcons
          name="chevron-right"
          size={22}
          color={theme.colors.action}
          accessibilityElementsHidden
        />
      ) : null}
    </Pressable>
  );
};
