import { Platform, type StyleProp, type ViewStyle } from "react-native";

/**
 * Bounce нужен для pull-to-refresh (`RefreshControl`).
 * На web overscroll отключаем — иначе появляется rubber-band без нативного PTR.
 */
export const homeCatalogFeedListScrollProps = {
  bounces: true,
  alwaysBounceVertical: true,
  overScrollMode: "auto" as const,
};

/** Тюнинг виртуализации главной ленты — меньше off-screen mount. */
export const homeCatalogFeedListPerformanceProps = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  windowSize: 7,
  removeClippedSubviews: Platform.OS === "android",
} as const;

export const resolveHomeCatalogFeedListStyle = (
  ...styles: StyleProp<ViewStyle>[]
): StyleProp<ViewStyle>[] =>
  Platform.OS === "web" ? [...styles, { overscrollBehavior: "none" }] : styles;
