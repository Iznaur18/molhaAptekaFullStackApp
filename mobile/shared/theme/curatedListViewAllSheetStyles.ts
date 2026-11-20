import { Platform, StyleSheet } from "react-native";

import {
  CURATED_LIST_HEADER,
  CURATED_LIST_VIEW_ALL_BUTTON,
  CURATED_LIST_VIEW_ALL_SHEET_LAYOUT as L,
} from "@/entities/curated-product-list/lib/curatedListViewAllSheetLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCuratedListViewAllSheetStyles = createThemedStyles((theme) => ({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dismiss: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    width: "100%",
    maxHeight: `${L.maxHeightRatio * 100}%`,
    minHeight: `${L.minHeightRatio * 100}%`,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: L.borderTopRadius,
    borderTopRightRadius: L.borderTopRadius,
    overflow: "hidden",
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 16,
  },
  bodyScroll: {
    flexGrow: 1,
    flexShrink: 1,
  },
  body: {
    gap: L.bodyGap,
    padding: L.bodyPadding,
  },
  title: {
    margin: 0,
    fontSize: L.titleFontSize,
    fontWeight: L.titleFontWeight,
    lineHeight: L.titleLineHeight,
    color: theme.colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  gridCategories: {
    flexDirection: "column",
    gap: L.categoryCardGap,
  },
}));

/** Header + «Все» на карусели (product / category). */
export const useCuratedListCarouselHeaderStyles = createThemedStyles((theme) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: CURATED_LIST_HEADER.gap,
    marginBottom: CURATED_LIST_HEADER.marginBottom,
    paddingHorizontal: CURATED_LIST_HEADER.paddingHorizontal,
    minWidth: 0,
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginTop: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
    gap: CURATED_LIST_VIEW_ALL_BUTTON.gap,
    paddingVertical: CURATED_LIST_VIEW_ALL_BUTTON.paddingVertical,
    paddingHorizontal: CURATED_LIST_VIEW_ALL_BUTTON.paddingHorizontal,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bg,
  },
  viewAllLabel: {
    fontSize: CURATED_LIST_VIEW_ALL_BUTTON.fontSize,
    fontWeight: CURATED_LIST_VIEW_ALL_BUTTON.fontWeight,
    lineHeight: CURATED_LIST_VIEW_ALL_BUTTON.lineHeight,
    color: theme.colors.textSecondary,
  },
}));
