import { StyleSheet } from "react-native";

import { PRODUCT_GRID_GAP } from "@/shared/lib/screenBreakpoints";

export const catalogGridRowStyles = StyleSheet.create({
  shell: {
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  row: {
    flexDirection: "row",
    gap: PRODUCT_GRID_GAP,
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
});

export const resolveCatalogGridListContentStyle = (gap: number = PRODUCT_GRID_GAP) => ({
  gap,
});
