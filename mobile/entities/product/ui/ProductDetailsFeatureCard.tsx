import type { LucideIcon } from "@/shared/ui/productDetailsLucideIcons";
import { ChevronRight } from "@/shared/ui/productDetailsLucideIcons";
import { Pressable, Text, View } from "react-native";

import { PRODUCT_DETAILS_FEATURE_CARD_LAYOUT as FC } from "@/entities/product/lib/productDetailsFeatureCardLayout";
import { useAppThemeSettings } from "@/shared/theme/AppThemeProvider";
import { useProductDetailsFeatureCardStyles } from "@/shared/theme/catalogProductStyles";

type ProductDetailsFeatureCardProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  ariaLabel: string;
  onPress: () => void;
  disabled?: boolean;
};

export const ProductDetailsFeatureCard = ({
  icon: Icon,
  title,
  subtitle,
  ariaLabel,
  onPress,
  disabled = false,
}: ProductDetailsFeatureCardProps) => {
  const styles = useProductDetailsFeatureCardStyles();
  const { colorScheme } = useAppThemeSettings();
  const isDark = colorScheme === "dark";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        disabled ? styles.cardDisabled : null,
        !disabled && pressed ? styles.cardPressed : null,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={ariaLabel}
      accessibilityState={{ disabled }}
    >
      <View style={styles.iconWrap}>
        <Icon
          size={FC.iconGlyphSize}
          color={styles.iconColor.color}
          strokeWidth={FC.iconStrokeWidth}
        />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.chevronWrap, { opacity: FC.chevronOpacity }]}>
        <ChevronRight
          size={FC.chevronSize}
          color={styles.chevronColor.color}
          strokeWidth={FC.chevronStrokeWidth}
        />
      </View>
    </Pressable>
  );
};
