import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import type { ReactNode } from "react";

import {
  buildProductDetailsBadgeItems,
  type ProductDetailsBadgeItem,
} from "@/entities/product/lib/buildProductDetailsBadgeItems";
import {
  PRODUCT_DETAILS_BADGE_SOFT_COLORS,
  PRODUCT_DETAILS_SOFT_BADGE_LAYOUT,
} from "@/entities/product/lib/productDetailsBadgeSoftPalette";
import { PRODUCT_DETAIL_TAB_BAR_LAYOUT } from "@/shared/lib/productDetailTabBarLayout";
import { PRODUCT_DETAILS_MODAL_UI } from "@/shared/config";
import { nestedHorizontalScrollProps } from "@/shared/lib/nestedHorizontalScrollProps";
import { useAppTheme } from "@/shared/theme/AppThemeProvider";
import { useProductDetailScreenStyles } from "@/shared/theme/catalogProductStyles";
import { AppText } from "@/shared/ui/AppText";

type ProductDetailsBadgeStackProps = {
  product: Record<string, unknown>;
  onBadgePress?: (item: ProductDetailsBadgeItem) => void;
};

const BadgePressable = ({
  children,
  style,
  accessibilityLabel,
  onPress,
}: {
  children: ReactNode;
  style: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={style}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(PRODUCT_DETAIL_TAB_BAR_LAYOUT.pressScale, {
            damping: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springDamping,
            stiffness: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springStiffness,
          });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {
            damping: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springDamping,
            stiffness: PRODUCT_DETAIL_TAB_BAR_LAYOUT.springStiffness,
          });
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

const softBadgeChrome = {
  paddingHorizontal: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.paddingHorizontal,
  paddingVertical: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.paddingVertical,
  borderRadius: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.borderRadius,
  borderWidth: 0,
  flexShrink: 0,
} as const;

const softBadgeText = {
  fontSize: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.fontSize,
  lineHeight: PRODUCT_DETAILS_SOFT_BADGE_LAYOUT.lineHeight,
  fontWeight: "800" as const,
};

const renderBadgeShell = ({
  interactive,
  style,
  accessibilityLabel,
  onPress,
  children,
}: {
  interactive: boolean;
  style: StyleProp<ViewStyle>;
  accessibilityLabel: string;
  onPress: () => void;
  children: ReactNode;
}) => {
  if (!interactive) {
    return <View style={style}>{children}</View>;
  }

  return (
    <BadgePressable style={style} accessibilityLabel={accessibilityLabel} onPress={onPress}>
      {children}
    </BadgePressable>
  );
};

const renderSoftTextBadge = ({
  item,
  tone,
  interactive,
  onBadgePress,
}: {
  item: ProductDetailsBadgeItem;
  tone: { backgroundColor: string; color: string };
  interactive: boolean;
  onBadgePress?: (item: ProductDetailsBadgeItem) => void;
}) => {
  return renderBadgeShell({
    interactive,
    style: [softBadgeChrome, { backgroundColor: tone.backgroundColor }],
    accessibilityLabel: item.label,
    onPress: () => onBadgePress?.(item),
    children: <AppText style={[softBadgeText, { color: tone.color }]}>{item.label}</AppText>,
  });
};

const renderBadge = ({
  item,
  styles,
  theme,
  onBadgePress,
}: {
  item: ProductDetailsBadgeItem;
  styles: ReturnType<typeof useProductDetailScreenStyles>;
  theme: ReturnType<typeof useAppTheme>;
  onBadgePress?: (item: ProductDetailsBadgeItem) => void;
}) => {
  const interactive = typeof onBadgePress === "function";

  if (item.kind === "original") {
    return (
      <View key={item.key}>
        {renderBadgeShell({
          interactive,
          style: [
            styles.metaInfoChip,
            styles.metaInfoChipRow,
            styles.metaInfoChipOriginal,
            softBadgeChrome,
          ],
          accessibilityLabel: PRODUCT_DETAILS_MODAL_UI.ORIGINAL_BADGE_ARIA,
          onPress: () => onBadgePress?.(item),
          children: (
            <>
              <MaterialIcons name="check-circle" size={14} color={theme.colors.success} />
              <Text
                style={[softBadgeText, styles.metaInfoChipOriginalText]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </>
          ),
        })}
      </View>
    );
  }

  if (item.kind === "raffle") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.raffle,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "affiliate") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.affiliate,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "auction") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.auction,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "installment") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.installment,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "wholesale") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.wholesale,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "rental") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.rental,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "nearDistance") {
    return (
      <View key={item.key}>
        {renderSoftTextBadge({
          item,
          tone: PRODUCT_DETAILS_BADGE_SOFT_COLORS.nearDistance,
          interactive,
          onBadgePress,
        })}
      </View>
    );
  }

  if (item.kind === "listingOrigin") {
    const tone = PRODUCT_DETAILS_BADGE_SOFT_COLORS.listingOrigin;
    return (
      <View key={item.key}>
        {renderBadgeShell({
          interactive,
          style: [
            styles.metaInfoChip,
            styles.metaInfoChipRow,
            softBadgeChrome,
            { backgroundColor: tone.backgroundColor },
          ],
          accessibilityLabel: PRODUCT_DETAILS_MODAL_UI.LISTING_ORIGIN_SLOT_ARIA,
          onPress: () => onBadgePress?.(item),
          children: (
            <>
              <MaterialIcons name={item.iconName} size={14} color={tone.color} />
              <Text style={[softBadgeText, { color: tone.color }]} numberOfLines={1}>
                {item.label}
              </Text>
            </>
          ),
        })}
      </View>
    );
  }

  // Сюда доходят "priceMarket" и "promo". Своей палитры у "promo" нет ни здесь,
  // ни в вебе (client/.../ProductDetailsBadgeStack.jsx — такой же fall-through),
  // поэтому бейдж промокодов рисуется чипом без заливки. Поведение оставлено
  // как в вебе намеренно: чинить тон нужно на обеих платформах разом.
  const tone =
    item.kind === "priceMarket"
      ? { backgroundColor: item.backgroundColor, color: item.color }
      : { backgroundColor: undefined, color: undefined };

  return (
    <View key={item.key}>
      {renderBadgeShell({
        interactive,
        style: [
          styles.metaInfoChip,
          styles.metaInfoChipRow,
          softBadgeChrome,
          { backgroundColor: tone.backgroundColor },
        ],
        accessibilityLabel: PRODUCT_DETAILS_MODAL_UI.PRICE_MARKET_STATUS_SLOT_ARIA,
        onPress: () => onBadgePress?.(item),
        children: (
          <>
            <MaterialIcons name="sell" size={14} color={tone.color} />
            <Text style={[softBadgeText, { color: tone.color }]} numberOfLines={1}>
              {item.label}
            </Text>
          </>
        ),
      })}
    </View>
  );
};

export const ProductDetailsBadgeStack = ({
  product,
  onBadgePress,
}: ProductDetailsBadgeStackProps) => {
  const styles = useProductDetailScreenStyles();
  const theme = useAppTheme();
  const items = buildProductDetailsBadgeItems({ product });

  return (
    <View style={styles.priceBadgeRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.priceBadgeRowContent}
        {...nestedHorizontalScrollProps}
        keyboardShouldPersistTaps="handled"
      >
        {items.map((item) =>
          renderBadge({ item, styles, theme, onBadgePress }),
        )}
      </ScrollView>
    </View>
  );
};
