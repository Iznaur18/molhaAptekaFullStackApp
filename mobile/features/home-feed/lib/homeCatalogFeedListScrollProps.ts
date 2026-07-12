import { Platform, type StyleProp, type ViewStyle } from "react-native";

/** На y=0 не даём тянуть ленту вниз — intro-видео остаётся на месте. */
export const homeCatalogFeedListScrollProps = {
  bounces: false,
  alwaysBounceVertical: false,
  overScrollMode: "never" as const,
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
