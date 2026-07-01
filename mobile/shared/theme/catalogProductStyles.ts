import { Platform, StyleSheet } from "react-native";

import { PRODUCT_CARD_BADGE_COLORS as BC } from "@/entities/product/lib/productCardBadgePalette";
import {
  PRODUCT_CARD_BADGE_LAYOUT as BL,
  PRODUCT_CARD_BANNER_CHROME as BANNER,
  PRODUCT_CARD_IMAGE_BADGE_OVERLAY as BO,
  PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT as BOL,
  PRODUCT_CARD_MOBILE_LAYOUT,
} from "@/entities/product/lib/productCardBadgePalette";
import { PRODUCT_MEDIA_HERO_ASPECT_RATIO } from "@/entities/product/model/constants";
import {
  PRODUCT_CARD_MOBILE_CATALOG_LAYOUT as MCL,
  resolveProductCardCatalogGridImageHeight,
} from "@/entities/product/lib/productCardMobileCatalogLayout";
import { CURATED_COMPACT_CARD_COLORS as C } from "@/entities/curated-product-list/lib/curatedCompactCardColors";
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_TOP,
  CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_TITLE_PADDING_X,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import {
  USER_STORY_STRIP_COLORS,
  USER_STORY_STRIP_INNER_SIZE,
  USER_STORY_STRIP_LAYOUT,
} from "@/entities/user-story/lib/userStoryStripLayout";
import { PRODUCT_DETAIL_DOCK_SCROLL_PADDING } from "@/shared/lib/productDetailScreenLayout";
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

export const useCatalogBreadcrumbStyles = createThemedStyles((theme) => ({
  toolbar: {
    paddingTop: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
    letterSpacing: -0.44,
    color: theme.colors.ink,
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
  cardCatalogGrid: {
    width: "100%",
    height: MCL.fixedHeight,
    margin: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: MCL.bottomPadding,
  },
  cardCatalogGridModerationQueue: {
    height: undefined,
    minHeight: undefined,
    maxHeight: undefined,
  },
  imageWrapCatalogGrid: {
    height: resolveProductCardCatalogGridImageHeight(Platform.OS),
    aspectRatio: undefined,
  },
  contentCatalogGrid: {
    paddingHorizontal: MCL.contentInsetX,
    paddingTop: MCL.bodyGap,
    gap: MCL.bodyGap,
    flexGrow: 0,
  },
  nameCatalogGrid: {
    fontSize: MCL.nameFontSize,
    lineHeight: MCL.nameLineHeight,
    maxHeight: MCL.headingHeight,
    fontWeight: "700",
  },
  metaStripCatalogGrid: {
    gap: 2,
    maxHeight: MCL.metaHeight,
    overflow: "hidden",
  },
  ratingCatalogGrid: {
    fontSize: MCL.ratingFontSize,
    lineHeight: MCL.ratingLineHeight,
    maxHeight: MCL.ratingLineHeight,
  },
  sellerRowCatalogGrid: {
    maxHeight: MCL.sellerRowHeight,
    overflow: "hidden",
  },
  pressable: {
    flex: 1,
  },
  imagePressable: {
    width: "100%",
    height: "100%",
  },
  contentPressable: {
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
    left: BOL.insetX,
    bottom: BOL.insetBottom,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: BOL.gap,
    maxWidth: "100%",
    pointerEvents: "box-none",
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

export const useProductCardBannerStyles = createThemedStyles((theme) => ({
  frame: {
    width: "100%",
  },
  card: {
    position: "relative",
    borderRadius: BANNER.outerRadius,
    overflow: "hidden",
  },
  cardPressed: {
    opacity: 0.94,
  },
  imageWrap: {
    width: "100%",
    aspectRatio: BANNER.imageAspectRatio,
    backgroundColor: "rgba(17, 24, 39, 0.05)",
  },
  imagePressable: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: BANNER.contentPaddingX,
    paddingTop: BANNER.contentPaddingTop,
    paddingBottom: BANNER.contentPaddingBottom,
    gap: 8.8,
  },
  tierBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: BANNER.accent,
  },
  tierBadgeText: {
    color: theme.colors.onContrast,
    fontSize: 11.5,
    fontWeight: "600",
    lineHeight: 14,
  },
  name: {
    fontSize: 20.5,
    lineHeight: 25,
    fontWeight: "600",
    color: theme.colors.text,
  },
  priceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    rowGap: 7.2,
    columnGap: 8.8,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontSize: 13.1,
    lineHeight: 16,
    color: theme.colors.textMuted,
    fontWeight: "400",
  },
  metaSeparator: {
    color: theme.colors.borderStrong,
    fontSize: 13.1,
    lineHeight: 16,
  },
  metaRating: {
    color: theme.colors.textSecondary,
  },
  wishlistSlot: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
  },
  footerActions: {
    marginTop: "auto",
    paddingTop: 5.6,
    paddingHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    paddingBottom: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    gap: 7.2,
  },
  moderationBadge: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: "700",
    overflow: "hidden",
  },
  moderationBadgePending: {
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.warningText,
  },
  moderationBadgeApproved: {
    backgroundColor: `${theme.colors.success}1A`,
    color: theme.colors.success,
  },
  moderationBadgeRejected: {
    backgroundColor: `${theme.colors.danger}1A`,
    color: theme.colors.danger,
  },
  moderationComment: {
    marginTop: 4,
    marginHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    fontSize: 12.5,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  moderationPreviewFields: {
    marginTop: 8,
    gap: 8,
  },
  moderationPreviewSellerRow: {
    marginHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
  },
  moderationPreviewRow: {
    gap: 4,
    marginHorizontal: PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
  },
  moderationPreviewKey: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textSecondary,
  },
  moderationPreviewValue: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  moderationPreviewValueMultiline: {
    lineHeight: 20,
  },
}));

export const useProductCardSellerToolbarStyles = createThemedStyles((theme) => ({
  toolbar: {
    flexDirection: "column",
    gap: 7.2,
    width: "100%",
  },
  promoteButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.actionBorder,
    borderRadius: 10,
    backgroundColor: theme.colors.actionSurface,
    paddingVertical: 7.2,
    paddingHorizontal: 10.4,
    alignItems: "center",
  },
  promoteButtonText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.link,
  },
  editButton: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
    paddingVertical: 7.2,
    paddingHorizontal: 10.4,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.text,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
}));

export const useListPageFilterBarStyles = createThemedStyles((theme) => ({
  bar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 13.6,
  },
  field: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 140,
    gap: 4.8,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "600",
    lineHeight: 14.4,
    color: theme.colors.textSecondary,
  },
  control: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6.4,
    backgroundColor: theme.colors.surface,
    paddingVertical: 7.2,
    paddingHorizontal: 10.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  controlText: {
    flex: 1,
    fontSize: 13.1,
    color: theme.colors.text,
  },
  controlChevron: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  menu: {
    position: "absolute",
    maxHeight: 240,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    zIndex: 2,
    elevation: 8,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemActive: {
    backgroundColor: theme.colors.actionSurface,
  },
  menuItemText: {
    fontSize: 13.5,
    color: theme.colors.text,
  },
  menuItemTextActive: {
    fontWeight: "600",
    color: theme.colors.action,
  },
  quota: {
    flexBasis: "100%",
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.action,
  },
  quotaLabel: {
    fontWeight: "500",
    opacity: 0.85,
  },
}));

export const useProductCardMediaStyles = createThemedStyles((theme) => ({
  frame: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
  },
  moderationPendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.52)",
    zIndex: 2,
  },
  moderationPendingOverlayText: {
    color: theme.colors.onContrast,
    fontSize: 13.5,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 12,
  },
}));

export const useProductCardMediaGalleryNavStyles = createThemedStyles((theme) => ({
  navRow: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2.4,
    transform: [{ translateY: -14 }],
    zIndex: 3,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(17, 24, 39, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.42)",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 18,
    color: theme.colors.text,
  },
  counter: {
    position: "absolute",
    right: 5.6,
    bottom: 3.2,
    zIndex: 3,
    paddingHorizontal: 5.12,
    paddingVertical: 1.92,
    borderRadius: 6,
    backgroundColor: "rgba(15, 23, 42, 0.72)",
    color: theme.colors.onContrast,
    fontSize: 10.4,
    fontWeight: "700",
    lineHeight: 12,
    overflow: "hidden",
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
    paddingHorizontal: BOL.paddingHorizontal,
    paddingVertical: BOL.paddingVertical,
    borderRadius: BOL.borderRadius,
    borderWidth: 1,
    borderColor: BO.borderColor,
    backgroundColor: BO.loyaltyBackground,
    alignSelf: "flex-start",
    flexShrink: 0,
    maxWidth: "100%",
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
    fontSize: BOL.fontSize,
    lineHeight: BOL.lineHeight,
    fontWeight: "700",
    textAlign: "center",
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
    paddingHorizontal: BOL.paddingHorizontal,
    paddingVertical: BOL.paddingVertical,
    borderRadius: BOL.borderRadius,
    borderWidth: 1,
    borderColor: BO.borderColor,
    backgroundColor: BO.discountBackground,
    alignSelf: "flex-start",
    flexShrink: 0,
    maxWidth: "100%",
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
    fontSize: BOL.fontSize,
    lineHeight: BOL.lineHeight,
    fontWeight: "700",
    textAlign: "center",
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
    color: `${theme.colors.text}73`,
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
  bannerRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  bannerCurrent: {
    fontSize: 23.2,
    fontWeight: "600",
    color: theme.colors.action,
    letterSpacing: -0.7,
  },
  bannerOld: {
    fontSize: 14.7,
    fontWeight: "400",
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  bannerDiscountBadge: {
    paddingHorizontal: 8.8,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: "#fecdd3",
  },
  bannerDiscountText: {
    color: "#be123c",
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 15,
  },
}));

const PRODUCT_DETAILS_GAP = 12;
const DETAIL_SPEC_PADDING_H = 16;
const DETAIL_DOCK_SCROLL_PADDING = PRODUCT_DETAIL_DOCK_SCROLL_PADDING;

/** Parity: client ProductDetailsModalFields.css `.product-details-modal__stats-grid` */
const PRODUCT_DETAILS_STAT_GRID_GAP = 2;
const PRODUCT_DETAILS_STAT_ROW_GAP = 12;

export const useProductDetailFieldStyles = createThemedStyles((theme) => ({
  statsGrid: {
    gap: PRODUCT_DETAILS_STAT_GRID_GAP,
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
  },
  stack: {
    gap: PRODUCT_DETAILS_GAP,
  },
  rowDefault: {
    gap: 2,
  },
  rowStat: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: PRODUCT_DETAILS_STAT_ROW_GAP,
    paddingVertical: 3.2,
    minWidth: 0,
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
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    lineHeight: 18.2,
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
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: "55%",
    maxWidth: "55%",
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    lineHeight: 18.2,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
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
    borderWidth: 1,
    borderColor: `${theme.colors.link}29`,
    borderRadius: 10.4,
    backgroundColor: theme.colors.actionSurface,
    gap: 6.6,
  },
  rootPressed: {
    borderColor: `${theme.colors.link}52`,
    backgroundColor: theme.colors.actionSurface,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "600",
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.46,
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
    minWidth: 152,
    flexGrow: 1,
    maxWidth: "100%",
    gap: 1.9,
  },
  metricKey: {
    fontSize: 10.9,
    fontWeight: "600",
    color: theme.colors.textMuted,
    lineHeight: 13.6,
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
  rootEmbedded: {
    marginTop: 0,
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
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 5.6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  key: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  value: {
    flexShrink: 1,
    maxWidth: "55%",
    minWidth: 0,
    fontSize: 14,
    color: theme.colors.text,
    textAlign: "right",
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
    aspectRatio: PRODUCT_MEDIA_HERO_ASPECT_RATIO,
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
    backgroundColor: theme.colors.surface,
  },
  scrollArea: {
    flex: 1,
  },
  container: {
    paddingBottom: DETAIL_DOCK_SCROLL_PADDING,
    backgroundColor: theme.colors.surface,
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
    paddingTop: 16,
    paddingBottom: 8,
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
  heroActions: {
    position: "absolute",
    top: 10.4,
    right: 10.4,
    flexDirection: "row",
    gap: 8,
  },
  contentSwitcherTabs: {
    flexDirection: "row",
    gap: 8,
  },
  contentSwitcherTab: {
    paddingVertical: 6.4,
    paddingHorizontal: 13.6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: `${theme.colors.action}59`,
    backgroundColor: theme.colors.surface,
  },
  contentSwitcherTabActive: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  contentSwitcherTabText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.action,
  },
  contentSwitcherTabTextActive: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  /** Паритет с web `product-details-content-switcher__panel`. */
  contentSwitcherPanel: {
    minWidth: 0,
    paddingVertical: 13.6,
    paddingHorizontal: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10.4,
    backgroundColor: theme.colors.surface,
  },
  descriptionText: {
    fontSize: 14.4,
    fontWeight: "500",
    lineHeight: 21.6,
    color: theme.colors.text,
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
    backgroundColor: `${theme.colors.surface}F0`,
  },
  installmentDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 8.8,
    paddingHorizontal: 12,
    paddingBottom: 10.4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: `${theme.colors.surface}F0`,
  },
  installmentDockButton: {
    minHeight: 48,
    borderRadius: 11.2,
  },
}));

/** Паритет с web `ProductPriceOffer.css` + `product-details-modal__auction-section`. */
export const useProductPriceOfferStyles = createThemedStyles((theme) => ({
  card: {
    marginTop: 0,
    paddingVertical: 13.6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.actionBorder,
    borderRadius: 12,
    backgroundColor: theme.colors.actionSurface,
    shadowColor: theme.colors.action,
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    gap: 0,
  },
  pageTitle: {
    marginBottom: 12,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
    letterSpacing: -0.4,
    color: theme.colors.ink,
  },
  heading: {
    marginBottom: 10.4,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
    color: theme.colors.ink,
  },
  topList: {
    gap: 6.4,
    marginBottom: 16,
  },
  topItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10.4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
  },
  topRank: {
    width: 21.6,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  topBuyerPressable: {
    flexShrink: 1,
    minWidth: 0,
    flexGrow: 1,
  },
  topBuyerName: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.action,
  },
  topPrice: {
    marginLeft: "auto",
    flexShrink: 0,
    fontSize: 14.4,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  empty: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 19.6,
    color: theme.colors.textMuted,
  },
  form: {
    marginTop: 13.6,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    gap: 0,
  },
  formHeading: {
    marginBottom: 8,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
    color: theme.colors.ink,
  },
  label: {
    gap: 5.6,
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  input: {
    marginTop: 5.6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingVertical: 8.8,
    paddingHorizontal: 13.6,
    fontSize: 15.2,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  actions: {
    gap: 8,
    marginTop: 10.4,
  },
  inlinePrimaryButton: {
    minHeight: 40,
    borderRadius: 8,
  },
  hint: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 19.6,
    color: theme.colors.textMuted,
  },
  status: {
    alignSelf: "flex-start",
    marginTop: 10.4,
    paddingVertical: 5.6,
    paddingHorizontal: 10.4,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 17,
  },
  statusPending: {
    backgroundColor: theme.colors.actionSoft,
    color: theme.colors.infoNavy,
  },
  statusAccepted: {
    backgroundColor: `${theme.colors.success}1A`,
    color: theme.colors.success,
  },
  statusRejected: {
    backgroundColor: `${theme.colors.danger}1A`,
    color: theme.colors.danger,
  },
  error: {
    marginTop: 10.4,
    paddingVertical: 7.2,
    paddingHorizontal: 10.4,
    borderRadius: 8,
    backgroundColor: `${theme.colors.danger}1A`,
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 19.6,
  },
  inactiveHint: {
    fontSize: 14,
    lineHeight: 19.6,
    color: theme.colors.textMuted,
  },
}));

export const useProductDetailTabBarStyles = createThemedStyles((theme) => ({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingVertical: 10,
  },
  tab: {
    paddingVertical: 6.4,
    paddingHorizontal: 13.6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: `${theme.colors.action}59`,
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
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  /** Паритет с web `installment-buyer-block__hint` (InstallmentBuyerBlock.css). */
  installmentBuyerHint: {
    margin: 0,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.actionBorder,
    borderRadius: 10.4,
    backgroundColor: theme.colors.actionSoft,
    fontSize: 13.6,
    lineHeight: 20,
    color: theme.colors.infoNavy,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
    backgroundColor: `${theme.colors.danger}1A`,
    borderRadius: theme.radius.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    gap: 8,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    gap: theme.spacing[1],
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
    marginBottom: 4,
  },
  itemAuthor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    minWidth: 0,
    flexShrink: 1,
    flex: 1,
    overflow: "visible",
  },
  itemAuthorName: {
    flexGrow: 0,
    flexShrink: 1,
    fontSize: 14.4,
    fontWeight: "600",
    color: theme.colors.text,
  },
  itemAuthorBadge: {
    flexShrink: 0,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.textMuted,
    flexShrink: 0,
  },
  itemStars: {
    flexDirection: "row",
    gap: 2,
    marginVertical: 3,
  },
  itemStarChar: {
    fontSize: 13,
  },
  itemStarActive: {
    color: theme.colors.star,
  },
  itemStarMuted: {
    color: theme.colors.starMuted,
  },
  itemMeta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  itemBody: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  success: {
    fontSize: 13,
    color: theme.colors.success,
    backgroundColor: `${theme.colors.success}1A`,
    borderRadius: theme.radius.input,
    paddingHorizontal: 10,
    paddingVertical: 8,
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  planCardSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
    shadowColor: theme.colors.action,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  planContent: {
    flex: 1,
  },
  planRadioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  planRadioOuterSelected: {
    borderColor: theme.colors.action,
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.action,
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
  paymentSelect: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    marginTop: 6,
  },
  paymentSelectText: {
    fontSize: 15,
    color: theme.colors.text,
    flex: 1,
  },
  paymentSelectChevron: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginLeft: 8,
  },
  paymentDropdown: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    marginTop: 4,
  },
  paymentDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  paymentDropdownItemLast: {
    borderBottomWidth: 0,
  },
  paymentDropdownItemText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  paymentDropdownItemActive: {
    backgroundColor: theme.colors.actionSurface,
  },
  paymentDropdownItemTextActive: {
    color: theme.colors.action,
    fontWeight: "600",
  },
  quantityField: {
    maxWidth: 120,
  },
  summaryCard: {
    position: "relative",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  summaryCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    zIndex: 1,
  },
  summaryScore: {
    fontSize: 37.6,
    fontWeight: "800",
    color: theme.colors.ink,
    lineHeight: 37.6,
    letterSpacing: -1.5,
    minWidth: 52,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  summaryMeta: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4.8,
    minWidth: 0,
    flexShrink: 1,
  },
  summaryStars: {
    flexDirection: "row",
    gap: 2.4,
  },
  summaryStarChar: {
    fontSize: 21.6,
    lineHeight: 21.6,
  },
  summaryStarFilled: {
    fontSize: 21.6,
    lineHeight: 21.6,
  },
  summaryCount: {
    fontSize: 14.4,
    fontWeight: "600",
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  subheading: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  summaryStrong: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "600",
  },
  totalBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    borderRadius: theme.radius.input,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    gap: 2,
  },
  totalBoxLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textMuted,
  },
  totalBoxValue: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.text,
  },
  addressSection: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: theme.colors.surfaceMuted,
    gap: 14,
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
    gap: theme.spacing[3],
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
  },
  summaryContent: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  totalRow: {
    minWidth: 0,
  },
  totalLabel: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  totalValue: {
    minWidth: 0,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
  },
  fullTotalHint: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  checkoutHint: {
    fontSize: 14,
    color: theme.colors.danger,
    textAlign: "center",
  },
  checkoutButton: {
    marginBottom: theme.spacing[2],
  },
  clearButton: {
    flexShrink: 0,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
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
    marginBottom: CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.ink,
    marginBottom: CURATED_PRODUCT_LIST_HOME_TITLE_MARGIN_BOTTOM,
    paddingHorizontal: CURATED_PRODUCT_LIST_HOME_TITLE_PADDING_X,
  },
  row: {
    paddingTop: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_TOP,
    paddingBottom: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_BOTTOM,
    paddingHorizontal: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL,
    gap: CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  },
}));

/** Паритет с `client/.../CatalogCityFilterBanner.css`. */
export const useCatalogCityFilterBannerStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.text,
  },
  action: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "600",
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
}));

export const useUserStoriesStripStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: USER_STORY_STRIP_LAYOUT.marginBottom,
    paddingTop: USER_STORY_STRIP_LAYOUT.paddingTop,
    paddingBottom: USER_STORY_STRIP_LAYOUT.paddingBottom,
  },
  scrollWrapper: {
    minHeight: 119,
    borderRadius: USER_STORY_STRIP_LAYOUT.scrollBorderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "transparent",
    backgroundColor: USER_STORY_STRIP_COLORS.scrollBackground,
    overflow: "hidden",
  },
  scroll: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: USER_STORY_STRIP_LAYOUT.scrollPaddingLeft,
    paddingRight: USER_STORY_STRIP_LAYOUT.scrollPaddingRight,
    paddingTop: USER_STORY_STRIP_LAYOUT.scrollPaddingTop,
    paddingBottom: USER_STORY_STRIP_LAYOUT.scrollPaddingBottom,
    gap: USER_STORY_STRIP_LAYOUT.itemGap,
  },
  item: {
    flexShrink: 0,
    width: USER_STORY_STRIP_LAYOUT.itemWidth,
    alignItems: "center",
    gap: USER_STORY_STRIP_LAYOUT.itemContentGap,
  },
  ring: {
    width: USER_STORY_STRIP_LAYOUT.ringSize,
    height: USER_STORY_STRIP_LAYOUT.ringSize,
    borderRadius: USER_STORY_STRIP_LAYOUT.ringSize / 2,
    padding: USER_STORY_STRIP_LAYOUT.ringPadding,
    backgroundColor: USER_STORY_STRIP_COLORS.ringActive,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringViewed: {
    backgroundColor: USER_STORY_STRIP_COLORS.ringViewed,
  },
  ringAdd: {
    width: USER_STORY_STRIP_LAYOUT.ringSize,
    height: USER_STORY_STRIP_LAYOUT.ringSize,
    borderRadius: USER_STORY_STRIP_LAYOUT.ringSize / 2,
    padding: USER_STORY_STRIP_LAYOUT.ringPadding,
    backgroundColor: USER_STORY_STRIP_COLORS.ringActive,
    alignItems: "center",
    justifyContent: "center",
  },
  plus: {
    fontSize: USER_STORY_STRIP_LAYOUT.plusFontSize,
    fontWeight: "400",
    color: theme.colors.onContrast,
    lineHeight: USER_STORY_STRIP_LAYOUT.plusFontSize,
  },
  avatar: {
    width: USER_STORY_STRIP_INNER_SIZE,
    height: USER_STORY_STRIP_INNER_SIZE,
    borderRadius: USER_STORY_STRIP_INNER_SIZE / 2,
    borderWidth: USER_STORY_STRIP_LAYOUT.avatarBorderWidth,
    borderColor: USER_STORY_STRIP_COLORS.avatarBorder,
  },
  avatarFallback: {
    width: USER_STORY_STRIP_INNER_SIZE,
    height: USER_STORY_STRIP_INNER_SIZE,
    borderRadius: USER_STORY_STRIP_INNER_SIZE / 2,
    borderWidth: USER_STORY_STRIP_LAYOUT.avatarBorderWidth,
    borderColor: USER_STORY_STRIP_COLORS.avatarBorder,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.textSecondary,
  },
  avatarFallbackText: {
    fontSize: USER_STORY_STRIP_LAYOUT.avatarFallbackFontSize,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  countBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    minWidth: USER_STORY_STRIP_LAYOUT.countMinWidth,
    height: USER_STORY_STRIP_LAYOUT.countHeight,
    paddingHorizontal: USER_STORY_STRIP_LAYOUT.countPaddingHorizontal,
    borderRadius: USER_STORY_STRIP_LAYOUT.countHeight / 2,
    backgroundColor: USER_STORY_STRIP_COLORS.countBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: {
    fontSize: USER_STORY_STRIP_LAYOUT.countFontSize,
    fontWeight: "700",
    color: theme.colors.onContrast,
    lineHeight: USER_STORY_STRIP_LAYOUT.countHeight,
  },
  label: {
    width: "100%",
    fontSize: USER_STORY_STRIP_LAYOUT.labelFontSize,
    color: theme.colors.onContrast,
    maxWidth: USER_STORY_STRIP_LAYOUT.itemWidth,
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
    height: "100%",
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
