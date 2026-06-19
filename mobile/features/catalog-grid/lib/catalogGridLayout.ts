import { StyleSheet } from "react-native";

import { PRODUCT_GRID_GAP } from "@/shared/lib/screenBreakpoints";

export const catalogGridRowStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: PRODUCT_GRID_GAP,
  },
});

export const resolveCatalogGridListContentStyle = (gap: number = PRODUCT_GRID_GAP) => ({
  gap,
});
