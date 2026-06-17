import { StyleSheet } from "react-native";

import { PRODUCT_CARD_BADGE_COLORS as BC } from "@/entities/product/lib/productCardBadgePalette";
import {
  PRODUCT_CARD_BADGE_LAYOUT as BL,
  PRODUCT_CARD_IMAGE_BADGE_OVERLAY as BO,
  PRODUCT_CARD_MOBILE_LAYOUT,
} from "@/entities/product/lib/productCardBadgePalette";
import { CURATED_COMPACT_CARD_COLORS as C } from "@/entities/curated-product-list/lib/curatedCompactCardColors";
import { CURATED_PRODUCT_LIST_HOME_CARD_GAP } from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_CONTENT_PADDING_BOTTOM,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
  SCREEN_CONTENT_SECTION_GAP,
} from "@/shared/theme/screenContentLayout";

export const MEDIA_OVERLAY_SCRIM = "rgba(0,0,0,0.55)";
export const MEDIA_NAV_SCRIM = "rgba(0,0,0,0.45)";

export const useFeedScreenStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  listContent: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
  browserLink: {
    marginHorizontal: theme.spacing[2],
    marginBottom: theme.spacing[2],
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.actionSurface,
  },
  browserLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.action,
  },
}));

export const useCatalogFilterChipStyles = createThemedStyles((theme) => ({
  wrap: {
    paddingVertical: theme.spacing[2],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  row: {
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: theme.spacing[2],
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceMuted,
  },
  chipActive: {
    backgroundColor: theme.colors.nearBlack,
  },
  chipOutline: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useCatalogSearchBarStyles = createThemedStyles((theme) => ({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    gap: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  wrapEmbedded: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
  },
  input: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  inputEmbedded: {
    fontSize: 13,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  clear: {
    paddingHorizontal: theme.spacing[1],
  },
  clearText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.link,
  },
}));

export const useCatalogSubcategoryChipStyles = createThemedStyles((theme) => ({
  wrap: {
    paddingBottom: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  row: {
    gap: theme.spacing[2],
  },
  chip: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

export const useProductCardStyles = createThemedStyles((theme) => ({
  card: {
    flex: 1,
    position: "relative",
    margin: 3,
    paddingBottom: 7,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "rgba(17, 24, 39, 0.14)",
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
  },
  cardPressed: {
    opacity: 0.94,
  },
  wishlistSlot: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 3,
  },
  imageWrap: {
    position: "relative",
    marginHorizontal: -PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    aspectRatio: PRODUCT_CARD_MOBILE_LAYOUT.imageAspectRatio,
    backgroundColor: "rgba(17, 24, 39, 0.05)",
    overflow: "hidden",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageBadges: {
    position: "absolute",
    left: BL.imageInsetX,
    right: BL.imageInsetX,
    bottom: BL.imageInsetBottom,
    flexDirection: "row",
    alignItems: "center",
    gap: BL.imageGap,
  },
  content: {
    paddingHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    paddingTop: PRODUCT_CARD_MOBILE_LAYOUT.bodyGap,
    gap: PRODUCT_CARD_MOBILE_LAYOUT.bodyGap,
  },
  metaStrip: {
    gap: PRODUCT_CARD_MOBILE_LAYOUT.metaStripGap,
  },
  name: {
    fontSize: 13.8,
    lineHeight: 17,
    fontWeight: "400",
    color: theme.colors.text,
  },
  rating: {
    fontSize: 11.8,
    lineHeight: 14.8,
    fontWeight: "600",
    color: BC.rating,
  },
  ratingPlaceholder: {
    fontWeight: "500",
    color: BC.ratingPlaceholder,
  },
}));

export const useProductCardSellerRowStyles = createThemedStyles((theme) => ({
  root: {
    minHeight: 14,
    maxHeight: 14,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  nameText: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: "700",
    color: theme.colors.text,
    textDecorationLine: "underline",
  },
  nameTextPlain: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
}));

export const useProductLoyaltyPointsBadgeStyles = createThemedStyles(() => ({
  badge: {
    paddingHorizontal: BL.paddingHorizontal,
    paddingVertical: BL.paddingVertical,
    borderRadius: BL.borderRadius,
    borderWidth: 1,
    borderColor: BC.loyaltyBorder,
    backgroundColor: BC.loyaltyBg,
    maxWidth: 152,
  },
  badgeOverlay: {
    borderColor: BO.borderColor,
    backgroundColor: BO.loyaltyBackground,
    maxWidth: undefined,
    shadowColor: BO.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: BC.loyaltyText,
    fontSize: BL.fontSize,
    fontWeight: "700",
    lineHeight: BL.lineHeight,
  },
  badgeOverlayText: {
    color: BO.loyaltyText,
  },
}));

export const useProductPriceStyles = createThemedStyles((theme) => ({
  cardRoot: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "baseline",
    gap: 6,
    minHeight: 21,
    columnGap: 6,
    rowGap: 3,
  },
  inlineRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: theme.spacing[2],
  },
  label: {
    fontSize: 11.5,
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
  current: {
    fontSize: 24,
    fontWeight: "800",
    color: theme.colors.text,
  },
  cardCurrent: {
    fontSize: 15.2,
    fontWeight: "800",
    color: BC.priceCurrent,
    letterSpacing: -0.3,
  },
  old: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
  },
  cardOld: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "rgba(17, 24, 39, 0.52)",
  },
  badge: {
    paddingHorizontal: BL.paddingHorizontal,
    paddingVertical: BL.paddingVertical,
    borderRadius: BL.borderRadius,
    borderWidth: 1,
    borderColor: BC.discountBorder,
    backgroundColor: BC.discountBg,
  },
  badgeOverlay: {
    borderColor: BO.borderColor,
    backgroundColor: BO.discountBackground,
    shadowColor: BO.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeText: {
    color: BC.discountText,
    fontSize: BL.fontSize,
    fontWeight: "700",
    lineHeight: BL.lineHeight,
  },
  badgeOverlayText: {
    color: BO.discountText,
  },
  detailCurrent: {
    fontSize: 29.6,
    fontWeight: "800",
    color: theme.colors.action,
    letterSpacing: -0.9,
  },
  detailOld: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
  },
  detailRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    rowGap: 6,
    columnGap: 9,
  },
  detailDiscountBadge: {
    paddingHorizontal: 7.2,
    paddingVertical: 3.2,
    borderRadius: 6.4,
  },
  detailDiscountText: {
    fontSize: 13.1,
    fontWeight: "700",
  },
}));

const PRODUCT_DETAILS_GAP = 12;
const DETAIL_SPEC_PADDING_H = 16;
const DETAIL_DOCK_SCROLL_PADDING = 124;

export const useProductDetailFieldStyles = createThemedStyles((theme) => ({
  statsGrid: {
    gap: PRODUCT_DETAILS_GAP,
  },
  stack: {
    gap: PRODUCT_DETAILS_GAP,
  },
  rowDefault: {
    gap: 2,
  },
  rowStat: {
    gap: 3.5,
    paddingVertical: 9.9,
    paddingHorizontal: 11.2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8.8,
    backgroundColor: theme.colors.surface,
  },
  rowBlock: {
    gap: 6.6,
    paddingVertical: 13.6,
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10.4,
    backgroundColor: theme.colors.surface,
  },
  rowMeta: {
    gap: 2.9,
    paddingVertical: 8.8,
    paddingHorizontal: 10.4,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  keyStat: {
    fontSize: 10.9,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  keyBlock: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  keyMeta: {
    fontSize: 10.4,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  valueStat: {
    fontSize: 14.1,
    fontWeight: "600",
    color: theme.colors.text,
    lineHeight: 18.2,
  },
  valueBlock: {
    fontSize: 14.4,
    fontWeight: "500",
    color: theme.colors.text,
    lineHeight: 21.6,
  },
  valueMeta: {
    fontSize: 12.5,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  valueMultiline: {
    lineHeight: 21.6,
  },
  grid: {
    gap: 10,
  },
  row: {
    gap: 2,
  },
}));

export const useProductDetailsSellerPreviewStyles = createThemedStyles((theme) => ({
  root: {
    marginTop: 8,
    marginHorizontal: DETAIL_SPEC_PADDING_H,
    paddingVertical: 13.6,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10.4,
    backgroundColor: theme.colors.surface,
    gap: 6.6,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 20.8,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metric: {
    minWidth: "44%",
    flexGrow: 1,
    gap: 1.9,
  },
  metricKey: {
    fontSize: 10.9,
    fontWeight: "600",
    color: theme.colors.textMuted,
    lineHeight: 14,
  },
  metricValue: {
    fontSize: 13.1,
    fontWeight: "500",
    color: theme.colors.text,
    lineHeight: 17,
  },
}));

export const useProductCharacteristicsDetailsStyles = createThemedStyles((theme) => ({
  root: {
    marginTop: 12,
  },
  title: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  list: {
    gap: 7.2,
  },
  row: {
    gap: 2.4,
    paddingVertical: 5.6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  key: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text,
  },
}));

export const useProductSellerPreviewStyles = createThemedStyles((theme) => ({
  section: {
    marginTop: theme.spacing[5],
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing[2],
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  premium: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.warning,
  },
}));

export const useProductMediaGalleryStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
  },
  hero: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  media: {
    width: "100%",
    height: "100%",
  },
  navRow: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing[2],
    transform: [{ translateY: -20 }],
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MEDIA_NAV_SCRIM,
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    color: theme.colors.onContrast,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  counter: {
    position: "absolute",
    right: 10,
    bottom: 10,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[1],
    borderRadius: 6,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
    color: theme.colors.onContrast,
    fontSize: 12,
    fontWeight: "600",
  },
  thumbs: {
    marginTop: 10,
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbActive: {
    borderColor: theme.colors.nearBlack,
    borderWidth: 2,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  thumbVideoLabel: {
    fontSize: 18,
    color: theme.colors.text,
  },
  detailRoot: {
    width: "100%",
    gap: 5.6,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 5.6,
  },
  detailHero: {
    width: "100%",
    minHeight: 280,
    borderRadius: 13.6,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  detailBackButton: {
    position: "absolute",
    top: 10.4,
    left: 10.4,
    zIndex: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
    pointerEvents: "box-none",
  },
  detailReportSlot: {
    position: "absolute",
    left: 10.4,
    bottom: 10.4,
  },
  detailReportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  detailReportButtonDisabled: {
    opacity: 0.55,
  },
  detailSliderNav: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 3.2,
    transform: [{ translateY: -16 }],
  },
  detailSliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17,24,39,0.18)",
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailSliderButtonText: {
    fontSize: 17.6,
    fontWeight: "700",
    color: theme.colors.text,
    lineHeight: 18,
  },
  detailCounter: {
    position: "absolute",
    right: 7.2,
    bottom: 5.6,
    zIndex: 2,
    paddingHorizontal: 6.4,
    paddingVertical: 2.4,
    borderRadius: 6,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
    color: theme.colors.onContrast,
    fontSize: 11.5,
    fontWeight: "700",
    lineHeight: 11.5,
  },
  detailThumbs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6.4,
    paddingHorizontal: 12,
  },
  detailThumb: {
    width: 56,
    height: 56,
    borderRadius: 5.6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  detailThumbActive: {
    borderColor: theme.colors.action,
  },
}));

export const useProductDetailScreenStyles = createThemedStyles((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    paddingBottom: DETAIL_DOCK_SCROLL_PADDING,
    backgroundColor: theme.colors.bg,
  },
  containerNoDock: {
    paddingBottom: 32,
  },
  tabPanel: {
    gap: PRODUCT_DETAILS_GAP,
  },
  tabPanelInset: {
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingBottom: 16,
  },
  rowTop: {
    gap: 0,
  },
  spec: {
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingBottom: 12,
    gap: PRODUCT_DETAILS_GAP,
  },
  priceBlock: {
    paddingTop: 5.6,
    paddingBottom: 13.6,
    gap: PRODUCT_DETAILS_GAP,
  },
  productName: {
    fontSize: 17.3,
    fontWeight: "700",
    lineHeight: 23.3,
    color: theme.colors.text,
  },
  priceBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5.6,
    rowGap: 5.6,
    columnGap: 7.2,
  },
  detailsSection: {
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    gap: PRODUCT_DETAILS_GAP,
  },
  metaGrid: {
    gap: PRODUCT_DETAILS_GAP,
  },
  mobileInlineActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 7.2,
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingTop: 4,
    paddingBottom: 12,
  },
  sellerActionButton: {
    flex: 1,
    minWidth: 144,
  },
  promoteButtonDisabled: {
    opacity: 0.55,
  },
  reportSuccess: {
    marginTop: 8,
    fontSize: 13,
    color: theme.colors.success,
    textAlign: "center",
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
  },
  detailReportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  detailReportButtonDisabled: {
    opacity: 0.55,
  },
  purchaseDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8.8,
    paddingHorizontal: 12,
    paddingBottom: 10.4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
}));

export const useProductDetailTabBarStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 0,
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
  },
  tab: {
    paddingVertical: 6.4,
    paddingHorizontal: 13.6,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tabActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
  },
  tabTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
}));

import { PRODUCT_DETAIL_DOCK_WARNING_AMBER } from "@/shared/theme/uploadFieldStyles";

export const useProductDetailPurchaseActionsStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
  },
  dockRoot: {
    gap: 7.2,
  },
  shortcutsRow: {
    flexDirection: "row",
    gap: 7.2,
  },
  shortcutsRowStacked: {
    flexDirection: "column",
  },
  shortcutFullWidth: {
    flex: undefined,
    width: "100%",
  },
  cartSlot: {
    width: "100%",
  },
  shortcut: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: PRODUCT_DETAIL_DOCK_WARNING_AMBER,
    backgroundColor: PRODUCT_DETAIL_DOCK_WARNING_AMBER,
  },
  shortcutInactive: {
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  shortcutText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.onContrast,
    textAlign: "center",
  },
  shortcutTextInactive: {
    color: theme.colors.textMuted,
  },
}));

export const useProductDetailTabStyles = createThemedStyles((theme) => ({
  root: {
    gap: theme.spacing[3],
    paddingTop: theme.spacing[2],
  },
  summary: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  panel: {
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceElevated,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 20,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  empty: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  input: {
    minHeight: 80,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    padding: 10,
    fontSize: 15,
    textAlignVertical: "top",
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  option: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surface,
  },
  optionActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  list: {
    gap: 10,
  },
  item: {
    padding: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceElevated,
    gap: theme.spacing[1],
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  itemMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  itemBody: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  success: {
    fontSize: 13,
    color: theme.colors.success,
  },
  stars: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  star: {
    fontSize: 28,
    color: theme.colors.starMuted,
  },
  starActive: {
    color: theme.colors.star,
  },
  disabled: {
    opacity: 0.6,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    paddingTop: theme.spacing[2],
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  status: {
    fontSize: 14,
    color: theme.colors.success,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  compactInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  planCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    padding: theme.spacing[3],
  },
  planCardSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  planTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  planMeta: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  planTotal: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing[1],
  },
  methodChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surface,
  },
  methodChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  methodText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  methodTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  summaryStrong: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
  },
  tabContainer: {
    paddingTop: theme.spacing[2],
    gap: theme.spacing[2],
  },
}));

export const useCartScreenStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: theme.spacing[2],
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  footer: {
    paddingTop: theme.spacing[2],
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[1],
  },
  totalLabel: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fullTotalHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing[3],
  },
  checkoutHint: {
    fontSize: 14,
    color: theme.colors.danger,
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
  checkoutButton: {
    marginBottom: theme.spacing[2],
  },
  clearButton: {
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: theme.spacing[2],
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));

export const useHomeCatalogSearchRowStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  usersButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
}));

export const useCuratedProductCompactCardStyles = createThemedStyles(() => ({
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  imageWrap: {
    aspectRatio: 1,
    backgroundColor: C.imageBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    fontSize: 13.5,
    color: C.imageFallbackText,
  },
  priceWrap: {
    minHeight: 32,
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    backgroundColor: C.priceBg,
  },
  price: {
    fontSize: 15.6,
    fontWeight: "700",
    lineHeight: 19,
    color: C.priceText,
  },
}));

export const useHomeCuratedListsStyles = createThemedStyles((theme) => ({
  listBlock: {
    marginBottom: SCREEN_CONTENT_SECTION_GAP,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.ink,
    marginBottom: 10,
  },
  row: {
    paddingBottom: theme.spacing[2],
    gap: CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  },
}));

export const useUserStoriesStripStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: SCREEN_CONTENT_SECTION_GAP,
  },
  scroll: {
    paddingBottom: theme.spacing[2],
    gap: theme.spacing[3],
  },
  item: {
    width: 72,
    alignItems: "center",
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringViewed: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  ringAdd: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: theme.colors.action,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: 28,
    fontWeight: "300",
    color: theme.colors.action,
    lineHeight: 30,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    fontSize: 22,
    fontWeight: "700",
    color: theme.colors.textSecondary,
  },
  label: {
    marginTop: theme.spacing[1],
    fontSize: 11,
    color: theme.colors.textSecondary,
    maxWidth: 72,
    textAlign: "center",
  },
}));

export const useCatalogBrowserPageStyles = createThemedStyles((theme) => ({
  container: {
    padding: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: theme.spacing[2],
    backgroundColor: theme.colors.bg,
  },
}));

export const useCatalogBrowserSectionStyles = createThemedStyles((theme) => ({
  section: {
    marginBottom: SCREEN_CONTENT_SECTION_GAP,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.ink,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));

export const useCatalogBrowserTileStyles = createThemedStyles((theme) => ({
  wrap: {
    position: "relative",
  },
  card: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  cardFeed: {
    borderStyle: "dashed",
  },
  imageWrap: {
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceElevated,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  label: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 16,
    textAlign: "center",
    color: theme.colors.ink,
  },
  editButton: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.nearBlack,
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
}));
