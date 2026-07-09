import { Platform, type StyleProp, type ViewStyle } from "react-native";

/** На y=0 не даём тянуть ленту вниз — intro-видео остаётся на месте. */
export const homeCatalogFeedListScrollProps = {
  bounces: false,
  alwaysBounceVertical: false,
  overScrollMode: "never" as const,
};

export const resolveHomeCatalogFeedListStyle = (
  ...styles: StyleProp<ViewStyle>[]
): StyleProp<ViewStyle>[] =>
  Platform.OS === "web" ? [...styles, { overscrollBehavior: "none" }] : styles;
