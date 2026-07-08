import { StyleSheet } from "react-native";

/** Ozon-стиль: плоский бар во всю ширину, без боковых полей. */
export const MOBILE_BOTTOM_NAV_HORIZONTAL_INSET = 0;

/** Ozon-стиль: бар прижат к низу, «плавающий» зазор убран. */
export const MOBILE_BOTTOM_NAV_FLOAT_OFFSET = 0;

/** Вертикальный паддинг blur-контейнера таббара. */
export const MOBILE_BOTTOM_NAV_PADDING_VERTICAL = 4;

/** Ozon-стиль: высокий тач-таргет табов. */
export const MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT = 48;

/** Shell `paddingBottom` floor when safe-area inset is zero. */
export const MOBILE_BOTTOM_NAV_SHELL_MIN_PADDING_BOTTOM = 4;

/** Фактическая высота таббара — паритет с `MobileBottomTabBar`. */
export const resolveMobileBottomNavLayoutHeight = (safeAreaBottom = 0): number =>
  MOBILE_BOTTOM_NAV_FLOAT_OFFSET +
  StyleSheet.hairlineWidth +
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL +
  MOBILE_BOTTOM_NAV_ITEM_MIN_HEIGHT +
  MOBILE_BOTTOM_NAV_PADDING_VERTICAL +
  Math.max(safeAreaBottom, MOBILE_BOTTOM_NAV_SHELL_MIN_PADDING_BOTTOM);

/** Высота зоны таббара — для `paddingBottom` скролла под floating nav. */
export const resolveMobileBottomNavReservedHeight = (safeAreaBottom = 0): number =>
  resolveMobileBottomNavLayoutHeight(safeAreaBottom);

export const resolveMobileBottomNavHorizontalInset = (insets: {
  left?: number;
  right?: number;
} = {}): number =>
  Math.max(
    MOBILE_BOTTOM_NAV_HORIZONTAL_INSET,
    insets.left ?? 0,
    insets.right ?? 0,
  );
