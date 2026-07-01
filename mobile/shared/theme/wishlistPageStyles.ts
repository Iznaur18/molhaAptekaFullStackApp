import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const PRODUCT_IMAGE_THUMB_SIDE = 64;
const DANGER_STRONG = "#b42318";
const NEUTRAL_GRAY = "#9ca3af";
const LIST_GAP = 18.4;

export const useWishlistPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    gap: LIST_GAP,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    marginBottom: 4,
  },
  state: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
  hint: {
    fontSize: 14.72,
    lineHeight: 21.3,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 5.6,
    paddingHorizontal: 2.4,
  },
  loginButton: {
    alignSelf: "stretch",
    minHeight: 40.8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10.4,
    backgroundColor: theme.colors.link,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 14.4,
  },
}));

export const useWishlistRowStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10.4,
    paddingVertical: 8,
    paddingHorizontal: 10.4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: PRODUCT_IMAGE_THUMB_SIDE,
    height: PRODUCT_IMAGE_THUMB_SIDE,
    borderRadius: 8.8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 2.4,
  },
  headingButton: {
    alignSelf: "stretch",
  },
  heading: {
    fontSize: 14.72,
    fontWeight: "600",
    lineHeight: 19.1,
    color: theme.colors.text,
  },
  price: {
    fontSize: 14.08,
    color: theme.colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  remove: {
    width: 29.6,
    height: 29.6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  removePressed: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  removeIcon: {
    color: NEUTRAL_GRAY,
  },
  removeIconPressed: {
    color: DANGER_STRONG,
  },
}));
