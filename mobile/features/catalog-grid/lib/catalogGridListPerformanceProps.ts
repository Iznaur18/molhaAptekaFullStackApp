import { Platform } from "react-native";

export const catalogGridListPerformanceProps = {
  initialNumToRender: 6,
  maxToRenderPerBatch: 4,
  windowSize: 7,
  removeClippedSubviews: Platform.OS === "android",
} as const;
