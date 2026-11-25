import { StyleSheet } from "react-native";

import {
  BOOST_HOME_HEADER_GAP,
  BOOST_HOME_HEADER_MARGIN_BOTTOM,
  BOOST_HOME_ICON_RADIUS,
  BOOST_HOME_ICON_SIZE,
  BOOST_HOME_PRICE_INSET,
  BOOST_HOME_SECTION_PADDING,
  BOOST_HOME_SECTION_RADIUS,
  BOOST_HOME_WISHLIST_INSET,
} from "@/entities/product/lib/boostProductsHomeLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useBoostProductsHomeSectionStyles = createThemedStyles((theme) => ({
  section: {
    marginBottom: 0,
    padding: BOOST_HOME_SECTION_PADDING,
    borderRadius: BOOST_HOME_SECTION_RADIUS,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: BOOST_HOME_HEADER_GAP,
    marginBottom: BOOST_HOME_HEADER_MARGIN_BOTTOM,
    minWidth: 0,
  },
  icon: {
    width: BOOST_HOME_ICON_SIZE,
    height: BOOST_HOME_ICON_SIZE,
    borderRadius: BOOST_HOME_ICON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.actionSoft,
  },
  headings: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    margin: 0,
    fontSize: 16.3,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.text,
  },
  subtitle: {
    margin: 0,
    fontSize: 13.1,
    lineHeight: 16.4,
    color: theme.colors.textSecondary,
  },
  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
  },
  viewAllLabel: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
  },
  row: {
    gap: 10,
    alignItems: "flex-start",
  },
}));

export const useBoostProductMiniCardStyles = createThemedStyles((theme) => ({
  card: {
    flexGrow: 0,
    flexShrink: 0,
    minWidth: 0,
  },
  media: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
    paddingHorizontal: 8,
  },
  priceWrap: {
    position: "absolute",
    left: BOOST_HOME_PRICE_INSET,
    bottom: BOOST_HOME_PRICE_INSET,
    zIndex: 2,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  price: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  wishlistSlot: {
    position: "absolute",
    top: BOOST_HOME_WISHLIST_INSET,
    right: BOOST_HOME_WISHLIST_INSET,
    zIndex: 3,
  },
}));
