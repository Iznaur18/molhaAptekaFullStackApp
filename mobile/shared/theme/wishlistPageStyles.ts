import { StyleSheet } from "react-native";

import { WISHLIST_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import {
  PROFILE_LIST_HERO_CHROME as HERO,
  PROFILE_LIST_HERO_NO_SHADOW,
} from "@/shared/lib/profileListHeroChrome";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const PRODUCT_IMAGE_THUMB_SIDE = 64;

export const useWishlistPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  listContent: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    flexGrow: 1,
  },
  /** Desktop hub: gutter 0 как web `.wishlist-page { padding: 0 }`. */
  listInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    alignSelf: "stretch",
    width: "100%",
    gap: L.headerGap,
    marginBottom: L.headerMarginBottom,
  },
  listItem: {
    marginTop: L.listGap,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: HERO.gap,
    padding: HERO.padding,
    borderRadius: HERO.radiusDefault,
    backgroundColor: theme.colors.accent,
    ...PROFILE_LIST_HERO_NO_SHADOW,
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  heroCaption: {
    fontSize: HERO.captionFontSize,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: HERO.captionLetterSpacing,
    color: theme.colors.onContrast,
    opacity: 0.72,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  heroValue: {
    fontSize: HERO.valueFontSize,
    fontWeight: HERO.valueFontWeight,
    letterSpacing: HERO.valueLetterSpacing,
    color: theme.colors.onContrast,
    fontVariant: ["tabular-nums"],
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.onContrast,
    opacity: 0.85,
  },
  heroInfo: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.onContrast,
    opacity: 0.8,
  },
  heroIconWrap: {
    width: HERO.iconSize,
    height: HERO.iconSize,
    borderRadius: HERO.iconSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.16)",
  },
  emptyRoot: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
  },
  emptyInAccountShell: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  emptyBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: layout.contentPaddingHorizontal,
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
    gap: 8,
    paddingVertical: 6,
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
    color: theme.colors.textMuted,
  },
  removeIconPressed: {
    color: theme.colors.danger,
  },
}));
