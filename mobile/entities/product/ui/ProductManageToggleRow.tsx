import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";

import type { ProductManageToggleRowVariant } from "@/entities/product/lib/resolveProductManageToggleRowVisualStyles";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductManageToggleRowStyles } from "@/shared/theme/modalChromeStyles";

type ToggleChangeResult = void | { needsSetup?: boolean; revert?: boolean };

/**
 * Обработчик может ответить синхронно (`{ revert: true }` — вернуть тумблер
 * назад, не дожидаясь сети) или промисом. commitChange ниже одинаково
 * разбирает оба через Promise.resolve; тип раньше разрешал только промис,
 * из-за чего пять синхронных call site'ов в ProductEditManageSection падали.
 */
type ToggleChangeHandler = (
  checked: boolean,
) => ToggleChangeResult | Promise<ToggleChangeResult>;

type ProductManageToggleRowProps = {
  title: string;
  description: string;
  checked?: boolean;
  onCheckedChange?: ToggleChangeHandler;
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
  onCheckedChange?: ToggleChangeHandler,
): "switch" | "chevron" | "none" => {
  if (variant === "danger") {
    return "none";
  }
  if (variant === "installment" && onPress && !onCheckedChange) {
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
  const control = resolveControl(variant, onPress, onCheckedChange);
  const isDanger = variant === "danger";
  const isLocked = disabled || pending;
  const statusLabel =
    pending && pendingLabel ? pendingLabel : (ariaLabel ?? title);
  const [displayChecked, setDisplayChecked] = useState(checked);

  useEffect(() => {
    setDisplayChecked(checked);
  }, [checked]);

  useEffect(() => {
    if (!pending) {
      setDisplayChecked(checked);
    }
  }, [pending, checked]);

  const commitChange = (next: boolean) => {
    setDisplayChecked(next);
    if (typeof onCheckedChange !== "function") {
      if (onPress) {
        onPress();
        setDisplayChecked(checked);
      }
      return;
    }
    void Promise.resolve(onCheckedChange(next)).then((result) => {
      if (result?.needsSetup || result?.revert) {
        setDisplayChecked(!next);
      }
    });
  };

  const handleActivate = () => {
    if (isLocked) {
      return;
    }
    if (onPress) {
      onPress();
      return;
    }
    commitChange(!displayChecked);
  };

  const handleSwitchChange = (next: boolean) => {
    if (isLocked) {
      return;
    }
    commitChange(next);
  };

  if (control === "switch") {
    return (
      <View
        style={styles.row}
        accessibilityRole="switch"
        accessibilityState={{ disabled: isLocked, checked: displayChecked, busy: pending }}
        accessibilityLabel={statusLabel}
      >
        <Pressable
          style={styles.textPressable}
          disabled={isLocked}
          onPress={handleActivate}
          accessibilityRole="button"
          accessibilityLabel={statusLabel}
        >
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        </Pressable>
        <Switch
          value={displayChecked}
          disabled={isLocked}
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
      accessibilityState={{ disabled: isLocked, busy: pending }}
      accessibilityLabel={statusLabel}
      disabled={isLocked}
      style={({ pressed }) => [
        styles.row,
        isDanger && styles.rowDanger,
        pressed && !isLocked && styles.rowPressed,
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
