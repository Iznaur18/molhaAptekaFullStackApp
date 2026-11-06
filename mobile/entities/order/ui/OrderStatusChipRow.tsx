import type { ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/**
 * Паритет web `MyOrdersPageMobile.css` / `MySalesPageMobile.css`
 * `@media (max-width: 640px)`: на телефоне ряд чипов не переносится, а
 * прокручивается вбок от края до края тулбара; шире — переносится.
 */
export const ORDER_STATUS_CHIPS_SCROLL_MAX_WIDTH = 640;

/** web `margin: 0 -0.75rem; padding: 0.15rem 0.75rem 0.25rem` — до краёв тулбара. */
const TOOLBAR_INLINE_PADDING = 12;

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    paddingVertical: 2.4,
  },
  scroll: {
    flexGrow: 0,
    marginHorizontal: -TOOLBAR_INLINE_PADDING,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: TOOLBAR_INLINE_PADDING,
    paddingTop: 2.4,
    paddingBottom: 4,
  },
});

type OrderStatusChipRowProps = {
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/** Ряд чипов статуса в «Моих покупках» и «Моих продажах». */
export const OrderStatusChipRow = ({
  accessibilityLabel,
  style,
  children,
}: OrderStatusChipRowProps) => {
  const { width } = useWindowDimensions();

  if (width <= ORDER_STATUS_CHIPS_SCROLL_MAX_WIDTH) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scroll, style]}
        contentContainerStyle={styles.scrollContent}
        accessibilityRole="toolbar"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View
      style={[styles.wrap, style]}
      accessibilityRole="toolbar"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
};
