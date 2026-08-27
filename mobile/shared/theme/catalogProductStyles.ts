import { Platform, StyleSheet } from "react-native";

import { PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO } from "@izibuy/design-tokens";

import {
  PRODUCT_CARD_BADGE_LAYOUT as BL,
  PRODUCT_CARD_DETAIL_BADGE_LAYOUT as BDETAIL,
  PRODUCT_CARD_DETAIL_BADGE_ROW_CHROME as DBRC,
  PRODUCT_CARD_IMAGE_BADGE_OVERLAY_LAYOUT as BOL,
  PRODUCT_CARD_MOBILE_LAYOUT,
  resolveProductCardBadgeColors,
  resolveProductCardBannerChrome,
  resolveProductCardImageBadgeOverlay,
} from "@/entities/product/lib/productCardBadgePalette";
import { PRODUCT_DETAILS_FEATURE_CARD_LAYOUT as FC } from "@/entities/product/lib/productDetailsFeatureCardLayout";
import { PRODUCT_DETAILS_CONTENT_SWITCHER_LAYOUT as CS } from "@/entities/product/lib/productDetailsContentSwitcherLayout";
import { PRODUCT_PICKUP_DETAILS_PANEL_LAYOUT as PL } from "@/entities/product/lib/productPickupDetailsPanelLayout";
import { PRODUCT_DETAILS_META_GRID_LAYOUT as MG } from "@/entities/product/lib/productDetailsMetaGridLayout";
import { PRODUCT_DETAILS_SELLER_PREVIEW_LAYOUT as SP } from "@/entities/product/lib/productDetailsSellerPreviewLayout";
import { PRODUCT_DETAILS_BADGE_SOFT_COLORS } from "@/entities/product/lib/productDetailsBadgeSoftPalette";
import { resolveProductCardSoftElevationShadow } from "@/entities/product/lib/productCardPromotionFramePalette";
import { PRODUCT_CARD_RATING_LAYOUT as RL } from "@/entities/product/lib/productCardRatingLayout";
import {
  PRODUCT_CARD_MOBILE_CATALOG_LAYOUT as MCL,
  resolveProductCardCatalogGridContentBelowImageHeight,
} from "@/entities/product/lib/productCardMobileCatalogLayout";
import {
  PRODUCT_CARD_OUT_OF_STOCK_LAYOUT as OOS,
  resolveProductCardOutOfStockOverlayColors,
} from "@/entities/product/lib/productCardOutOfStockLayout";
import { CATALOG_BROWSER_LANDING_LAYOUT } from "@/features/catalog-browser/lib/catalogBrowserLandingLayout";
import { HOME_FEED_SECTION_GAP } from "@/features/home-feed/lib/homeFeedSectionLayout";
import { resolveCuratedCompactCardColors } from "@/entities/curated-product-list/lib/curatedCompactCardColors";
import {
  CATALOG_BROWSER_DISPLAY_TITLE,
  HOME_CATALOG_SECTION_TITLE_MARGIN_TOP,
  HOME_FEED_DISPLAY_TITLE,
} from "@/shared/theme/displayTypography";
import {
  CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL,
  CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_TOP,
  CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM,
  CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_HORIZONTAL,
  CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_VERTICAL,
} from "@/entities/curated-product-list/lib/curatedProductListHomeLayout";
import {
  USER_STORY_STRIP_INNER_SIZE,
  USER_STORY_STRIP_LAYOUT,
} from "@/entities/user-story/lib/userStoryStripLayout";
import {
  PRODUCT_DETAIL_TAB_BAR_LAYOUT,
  resolveProductDetailTabUnderlineHoverColor,
} from "@/shared/lib/productDetailTabBarLayout";
import { PRODUCT_DETAIL_DOCK_SCROLL_PADDING } from "@/shared/lib/productDetailScreenLayout";
import {
  PRODUCT_DETAIL_HERO_CHROME,
  resolveProductDetailHeroChromeBackground,
  resolveProductDetailHeroWishlistActiveBackground,
} from "@/shared/lib/productDetailHeroChromeLayout";
import { mixHexColors } from "@/shared/lib/mixHexColors";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_CONTENT_PADDING_BOTTOM,
  SCREEN_CONTENT_PADDING_HORIZONTAL,
} from "@/shared/theme/screenContentLayout";

export const MEDIA_OVERLAY_SCRIM = "rgba(0,0,0,0.55)";
export const MEDIA_NAV_SCRIM = "rgba(0,0,0,0.45)";

export const useFeedScreenStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  homeFeedScene: {
    // Фон сцены совпадает с foreground-цветом листа: фиолетовая шапка —
    // обычный первый ряд FlatList (HomeCatalogPrimaryBackdrop), поэтому
    // любые недорисованные зоны списка сливаются с контентом без полос.
    backgroundColor: theme.colors.bg,
    width: "100%",
    alignSelf: "stretch",
  },
  homeFeedList: {
    backgroundColor: "transparent",
    zIndex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  // Корень сцены главной: интро-слой (absolute) + сдвигаемая шторка поверх.
  homeFeedStage: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  // Задний слой с интро-видео — прижат к верху, высоту задаём инлайном (dockOffset).
  homeFeedIntroBackdropLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  // Передняя «шторка» с товарами: overflow скрывает контент за скруглённой кромкой.
  // Непрозрачный фон обязателен: за шторкой лежит интро-бэкдроп (высотой почти
  // во весь экран), и без заливки он просвечивал в прозрачных зонах списка —
  // например, снизу под последним рядом при прокрутке вниз. В состоянии интро
  // шторка сдвинута вниз и бэкдроп остаётся виден НАД её кромкой (заливка не
  // мешает), а в открытой ленте она полностью перекрывает интро.
  homeFeedSheet: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: theme.colors.bg,
  },
  homeFeedListContent: {
    width: "100%",
    alignSelf: "stretch",
    paddingHorizontal: 0,
    flexGrow: 1,
  },
  homeFeedSearchHeader: {
    width: "100%",
    marginBottom: HOME_FEED_SECTION_GAP,
  },
  homeFeedInsetContent: {
    width: "100%",
    alignSelf: "stretch",
    // Inline pad — у app-shell contentContainer / sticky shell (паритет web).
    paddingHorizontal: 0,
  },
  homeFeedForeground: {
    // Единый передний фон ленты; совпадает со сценой (homeFeedScene) и с
    // фоном остальных экранов — карточки товаров (surface) читаются на нём.
    backgroundColor: theme.colors.bg,
  },
  homeFeedRowSurface: {
    alignSelf: "stretch",
    width: "100%",
  },
  homeFeedSheetFiller: {
    flexGrow: 1,
    minHeight: 1,
    alignSelf: "stretch",
  },
  homeFeedListFooterWrap: {
    alignSelf: "stretch",
  },
  homeFeedPendingRoot: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
  },
  homeFeedPendingSheet: {
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    overflow: "hidden",
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
  listHeader: {
    alignSelf: "stretch",
    gap: HOME_FEED_SECTION_GAP,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
  loadMoreRetry: {
    marginTop: 8,
    minHeight: 40,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadMoreRetryText: {
    fontSize: 14,
    fontWeight: "700",
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

/** listHeader flex gap перед «ГЛАВНАЯ» — схлопываем; margin-top title = web h2. */
const HOME_CATALOG_SECTION_TITLE_COMPACT_PULL_UP = HOME_FEED_SECTION_GAP;

const catalogBreadcrumbTitleBase = {
  fontFamily: HOME_FEED_DISPLAY_TITLE.fontFamily,
  fontSize: HOME_FEED_DISPLAY_TITLE.fontSize,
  fontWeight: HOME_FEED_DISPLAY_TITLE.fontWeight,
  lineHeight: HOME_FEED_DISPLAY_TITLE.lineHeight,
  letterSpacing: HOME_FEED_DISPLAY_TITLE.letterSpacing,
  textTransform: HOME_FEED_DISPLAY_TITLE.textTransform,
  paddingLeft: HOME_FEED_DISPLAY_TITLE.paddingLeft,
  paddingRight: HOME_FEED_DISPLAY_TITLE.paddingRight,
  marginBottom: HOME_FEED_DISPLAY_TITLE.marginBottom,
} as const;

export const useCatalogBreadcrumbStyles = createThemedStyles((theme) => ({
  toolbar: {
    paddingTop: 16,
    marginBottom: 14,
  },
  toolbarCompactTop: {
    paddingTop: 0,
    marginTop: -HOME_CATALOG_SECTION_TITLE_COMPACT_PULL_UP,
    // Web `.home-feed-section-title { margin-bottom: 0.4rem }` — только на title.
    marginBottom: 0,
  },
  // Паритет web `.home-feed-section-title`
  title: {
    ...catalogBreadcrumbTitleBase,
    color: theme.colors.text,
    marginTop: HOME_FEED_DISPLAY_TITLE.marginTop,
  },
  titleCompactTop: {
    ...catalogBreadcrumbTitleBase,
    color: theme.colors.text,
    marginTop: HOME_CATALOG_SECTION_TITLE_MARGIN_TOP,
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

export const useProductCardStyles = createThemedStyles((theme) => {
  const BC = resolveProductCardBadgeColors(theme.colors);
  const soft = resolveProductCardSoftElevationShadow(theme.colors);
  return {
  card: {
    flex: 1,
    position: "relative",
    margin: 3,
    paddingBottom: 7,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    shadowColor: soft.shadowColor,
    shadowOffset: { width: 0, height: soft.shadowOffsetY },
    shadowOpacity: soft.shadowOpacity,
    shadowRadius: soft.shadowRadius,
    elevation: soft.elevation,
    overflow: "hidden",
  },
  cardCatalogGrid: {
    flexGrow: 0,
    flexShrink: 0,
    width: "100%",
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
  cardOutOfStock: {
    opacity: OOS.cardOpacity,
    ...(Platform.OS === "web" ? ({ filter: "grayscale(1)" } as const) : null),
  },
  imageWrapCatalogGrid: {
    marginHorizontal: -MCL.contentInsetX,
    aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
    borderTopLeftRadius: MCL.imageTopRadius,
    borderTopRightRadius: MCL.imageTopRadius,
    borderBottomLeftRadius: MCL.imageBottomRadius,
    borderBottomRightRadius: MCL.imageBottomRadius,
  },
  contentCatalogGrid: {
    paddingHorizontal: MCL.contentInsetX,
    paddingTop: MCL.bodyGap,
    gap: MCL.bodyGap,
    flexGrow: 0,
    flexShrink: 0,
    height: resolveProductCardCatalogGridContentBelowImageHeight(),
  },
  contentPressableCatalogGrid: {
    alignSelf: "stretch",
    alignItems: "flex-start",
    gap: MCL.bodyGap,
  },
  nameCatalogGrid: {
    fontSize: MCL.nameFontSize,
    lineHeight: MCL.nameLineHeight,
    maxHeight: MCL.headingHeight,
    fontWeight: "500",
  },
  metaStripCatalogGrid: {
    gap: 2,
    maxHeight: MCL.metaHeight,
    overflow: "visible",
  },
  ratingCatalogGrid: {
    fontSize: MCL.ratingFontSize,
    lineHeight: MCL.ratingLineHeight,
    maxHeight: MCL.ratingLineHeight,
  },
  sellerRowCatalogGrid: {
    minHeight: MCL.sellerRowHeight,
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
    alignSelf: "stretch",
  },
  cardPressed: {
    opacity: 0.94,
  },
  wishlistSlot: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 3,
  },
  imageWrap: {
    position: "relative",
    marginHorizontal: -PRODUCT_CARD_MOBILE_LAYOUT.contentInsetX,
    aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
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
    fontSize: 14,
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
  };
});

export const useProductCardRatingRowStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: RL.rowGap,
    minHeight: RL.minHeight,
    maxWidth: "100%",
  },
  rootCatalogGrid: {
    minHeight: MCL.ratingLineHeight,
    maxHeight: MCL.ratingLineHeight,
  },
  rootPlaceholder: {
    alignSelf: "stretch",
  },
  text: {
    fontSize: RL.fontSize,
    lineHeight: RL.lineHeight,
    fontWeight: RL.fontWeight,
    color: theme.colors.textMuted,
  },
  textCatalogGrid: {
    fontSize: MCL.ratingFontSize,
    lineHeight: MCL.ratingLineHeight,
  },
  textPlaceholder: {
    fontWeight: RL.placeholderFontWeight,
    color: mixHexColors(theme.colors.textMuted, theme.colors.surface, 0.48),
  },
  placeholderOnly: {
    alignSelf: "stretch",
    maxHeight: MCL.ratingLineHeight,
  },
  sep: {
    flexShrink: 0,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: RL.countGap,
    flexShrink: 1,
    minWidth: 0,
  },
  countIcon: {
    flexShrink: 0,
  },
}));

export const useProductCardBannerStyles = createThemedStyles((theme) => {
  const BANNER = resolveProductCardBannerChrome(theme.colors);
  return {
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
    aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
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
  };
});

export const useProductCardSellerToolbarStyles = createThemedStyles((theme) => ({
  toolbar: {
    flexDirection: "column",
    gap: 7.2,
    width: "100%",
  },
  toolbarCompact: {
    flexDirection: "row",
    gap: 8,
  },
  promoteButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: theme.colors.actionBorder,
    borderRadius: 14,
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
  promoteButtonCompact: {
    flex: 1,
    width: undefined,
  },
  editButton: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
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
  editButtonCompact: {
    flex: 1,
    width: undefined,
  },
  copyButton: {
    width: 33,
    minHeight: 33,
    alignSelf: "stretch",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
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
    gap: 10,
  },
  field: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 140,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    color: theme.colors.textSecondary,
  },
  control: {
    minHeight: 33,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  controlText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
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
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
    zIndex: 2,
    elevation: 8,
    shadowColor: theme.colors.text,
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

export const useProductCardOutOfStockOverlayStyles = createThemedStyles((theme) => {
  const O = resolveProductCardOutOfStockOverlayColors(theme.colors);
  return {
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: OOS.overlayPadding,
    backgroundColor: O.overlayBackground,
    zIndex: OOS.overlayZIndex,
  },
  label: {
    paddingHorizontal: OOS.labelPaddingHorizontal,
    paddingVertical: OOS.labelPaddingVertical,
    borderRadius: 999,
    backgroundColor: O.labelBackground,
    color: O.labelColor,
    fontSize: OOS.labelFontSize,
    fontWeight: "700",
    lineHeight: OOS.labelLineHeight,
    textAlign: "center",
  },
  };
});

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

export const useProductCardGalleryDotsStyles = createThemedStyles((theme) => ({
  root: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 8,
    zIndex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    pointerEvents: "none",
  },
  dot: {
    height: 5,
    borderRadius: 999,
    backgroundColor: theme.colors.onContrast,
  },
}));

export const useProductCardWishlistBurstStyles = createThemedStyles(() => ({
  root: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 4,
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
  rootCatalogGrid: {
    minHeight: MCL.sellerRowHeight,
    maxHeight: MCL.sellerRowHeight,
  },
  nameText: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: "700",
    color: theme.colors.text,
    textDecorationLine: "underline",
  },
  nameTextCatalogGrid: {
    fontSize: MCL.sellerFontSize,
    lineHeight: MCL.sellerLineHeight,
  },
  nameTextPlain: {
    fontSize: 11.5,
    lineHeight: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  nameTextPlainCatalogGrid: {
    fontSize: MCL.sellerFontSize,
    lineHeight: MCL.sellerLineHeight,
  },
}));

export const useProductLoyaltyPointsBadgeStyles = createThemedStyles((theme) => {
  const BC = resolveProductCardBadgeColors(theme.colors);
  const BO = resolveProductCardImageBadgeOverlay(theme.colors);
  return {
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
    // флеш к левому краю фото — левые углы прямые (Ozon-стиль)
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: BO.loyaltyBackground,
    alignSelf: "flex-start",
    flexShrink: 0,
    maxWidth: "100%",
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
    fontWeight: "800",
    textAlign: "left",
  },
  detailBadge: {
    paddingHorizontal: BDETAIL.paddingHorizontal,
    paddingVertical: BDETAIL.paddingVertical,
    borderRadius: BDETAIL.borderRadius,
    borderWidth: 0,
    backgroundColor: PRODUCT_DETAILS_BADGE_SOFT_COLORS.loyalty.backgroundColor,
    flexShrink: 0,
  },
  detailBadgeText: {
    color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.loyalty.color,
    fontSize: BDETAIL.fontSize,
    lineHeight: BDETAIL.lineHeight,
    fontWeight: "800",
  },
  };
});

export const useProductPriceStyles = createThemedStyles((theme) => {
  const BC = resolveProductCardBadgeColors(theme.colors);
  const BO = resolveProductCardImageBadgeOverlay(theme.colors);
  return {
  cardRoot: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "baseline",
    gap: 6,
    minHeight: 21,
    columnGap: 6,
    rowGap: 3,
  },
  cardRootCatalogGrid: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    alignSelf: "flex-start",
    minHeight: MCL.priceHeight,
    maxHeight: MCL.priceHeight,
    gap: 0,
    columnGap: MCL.priceColumnGap,
    rowGap: MCL.priceRowGap,
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
    color: theme.colors.action,
  },
  cardCurrent: {
    fontSize: 18,
    fontWeight: "800",
    color: BC.priceCurrent,
    letterSpacing: -0.3,
  },
  cardCurrentCatalogGrid: {
    lineHeight: MCL.priceHeight,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
  },
  old: {
    fontSize: 14,
    fontWeight: "600",
    color: BC.priceOld,
    textDecorationLine: "line-through",
  },
  cardOld: {
    fontSize: 11.5,
    fontWeight: "600",
    color: BC.priceOld,
  },
  cardOldCatalogGrid: {
    lineHeight: MCL.priceHeight,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : null),
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
    // флеш к левому краю фото — левые углы прямые (Ozon-стиль)
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    backgroundColor: BO.discountBackground,
    alignSelf: "flex-start",
    flexShrink: 0,
    maxWidth: "100%",
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
    fontWeight: "800",
    textAlign: "left",
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
    color: BC.priceOld,
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
    paddingHorizontal: BDETAIL.paddingHorizontal,
    paddingVertical: BDETAIL.paddingVertical,
    borderRadius: BDETAIL.borderRadius,
    borderWidth: 0,
    backgroundColor: PRODUCT_DETAILS_BADGE_SOFT_COLORS.discount.backgroundColor,
    flexShrink: 0,
  },
  detailDiscountText: {
    color: PRODUCT_DETAILS_BADGE_SOFT_COLORS.discount.color,
    fontSize: BDETAIL.fontSize,
    lineHeight: BDETAIL.lineHeight,
    fontWeight: "800",
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
    color: theme.colors.textPlaceholder,
    textDecorationLine: "line-through",
  },
  cartRoot: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 6,
    columnGap: 8,
    rowGap: 2,
  },
  cartCurrent: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.link,
    letterSpacing: -0.3,
  },
  cartOld: {
    fontSize: 13,
    fontWeight: "500",
    color: BC.priceOld,
    textDecorationLine: "line-through",
  },
  bannerDiscountBadge: {
    paddingHorizontal: 8.8,
    paddingVertical: 3.5,
    borderRadius: 999,
    borderWidth: 0,
    backgroundColor: theme.colors.dangerSurface,
  },
  bannerDiscountText: {
    color: theme.colors.danger,
    fontSize: 12.5,
    fontWeight: "600",
    lineHeight: 15,
  },
  };
});

const PRODUCT_DETAILS_GAP = 12;
const DETAIL_SPEC_PADDING_H = 16;
const DETAIL_DOCK_SCROLL_PADDING = PRODUCT_DETAIL_DOCK_SCROLL_PADDING;

/** Верхние / все углы purchase-dock (сквиркл). */
export const PRODUCT_DETAIL_PURCHASE_DOCK_TOP_RADIUS = 20;

/** Отступ плавающего purchase-dock от краёв колонки (углы читаются на bg). */
export const PRODUCT_DETAIL_PURCHASE_DOCK_INSET = 12;

/** Нижний inset: на ~10% высоты dock ближе к низу экрана, чем боковые. */
const PRODUCT_DETAIL_PURCHASE_DOCK_APPROX_HEIGHT = 140;
const PRODUCT_DETAIL_PURCHASE_DOCK_LOWER_RATIO = 0.1;
export const PRODUCT_DETAIL_PURCHASE_DOCK_BOTTOM_INSET = Math.max(
  0,
  PRODUCT_DETAIL_PURCHASE_DOCK_INSET -
    Math.round(PRODUCT_DETAIL_PURCHASE_DOCK_APPROX_HEIGHT * PRODUCT_DETAIL_PURCHASE_DOCK_LOWER_RATIO),
);

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
  rowStatMultiline: {
    alignItems: "flex-start",
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
    gap: MG.rowGap,
    paddingVertical: MG.rowPaddingVertical,
    paddingHorizontal: MG.rowPaddingHorizontal,
    borderRadius: MG.rowBorderRadius,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: MG.rowBorderWidth,
    borderColor: theme.colors.surfaceMuted,
    minWidth: 0,
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
    fontSize: MG.keyFontSize,
    fontWeight: MG.keyFontWeight,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: MG.keyLetterSpacing,
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
    fontSize: MG.valueFontSize,
    fontWeight: MG.valueFontWeight,
    lineHeight: MG.valueLineHeight,
    color: theme.colors.textSecondary,
  },
  metaGrid: {
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    gap: MG.gap,
  },
  metaGridThreeCol:
    Platform.OS === "web"
      ? ({
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        } as const)
      : {
          flexDirection: "row",
          flexWrap: "wrap",
        },
  metaGridOneCol: {
    flexDirection: "column",
  },
  metaGridCellThreeCol: {
    flexGrow: 1,
    flexBasis: "31%",
    minWidth: 0,
    maxWidth: "100%",
  },
  metaGridCellOneCol: {
    width: "100%",
    minWidth: 0,
  },
  metaValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: MG.metaValueRowGap,
    minWidth: 0,
  },
  metaValueText: {
    flex: 1,
    minWidth: 0,
  },
  copyButton: {
    padding: 4,
    borderRadius: theme.radius.input,
  },
  copyButtonPressed: {
    opacity: 0.7,
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
    alignSelf: "stretch",
    marginTop: SP.rootMarginTop,
    marginHorizontal: SP.rootMarginHorizontal,
    padding: SP.rootPadding,
    borderWidth: SP.rootBorderWidth,
    borderColor: theme.colors.border,
    borderRadius: SP.rootBorderRadius,
    backgroundColor: theme.colors.surfaceMuted,
    gap: SP.rootGap,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  rootSplit: {
    width: "100%",
    marginTop: 0,
    marginHorizontal: 0,
  },
  rootPressed: {
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.actionSoft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.headerGap,
    minWidth: 0,
  },
  avatar: {
    width: SP.avatarSize,
    height: SP.avatarSize,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: SP.headerTextGap,
  },
  label: {
    fontSize: SP.labelFontSize,
    fontWeight: SP.labelFontWeight,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: SP.labelLetterSpacing,
  },
  nameText: {
    fontSize: SP.nameFontSize,
    fontWeight: SP.nameFontWeight,
    color: theme.colors.ink,
    lineHeight: SP.nameLineHeight,
  },
  chevron: {
    opacity: SP.chevronOpacity,
  },
  metrics:
    Platform.OS === "web"
      ? ({
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: SP.metricsGap,
          width: "100%",
          minWidth: 0,
        } as const)
      : {
          flexDirection: "row",
          flexWrap: "wrap",
          gap: SP.metricsGap,
          width: "100%",
        },
  metric: {
    flexDirection: "row",
    alignItems: "center",
    gap: SP.metricGap,
    minWidth: 0,
    paddingVertical: SP.metricPaddingVertical,
    paddingHorizontal: SP.metricPaddingHorizontal,
    borderRadius: SP.metricBorderRadius,
    backgroundColor: theme.colors.bg,
    ...(Platform.OS === "web"
      ? null
      : {
          width: "48%",
        }),
  },
  metricIcon: {
    width: SP.metricIconSize,
    height: SP.metricIconSize,
    borderRadius: SP.metricIconRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    flexShrink: 0,
  },
  metricBody: {
    flex: 1,
    minWidth: 0,
    gap: SP.metricBodyGap,
  },
  metricValue: {
    fontSize: SP.metricValueFontSize,
    fontWeight: SP.metricValueFontWeight,
    color: theme.colors.ink,
    lineHeight: SP.metricValueLineHeight,
  },
  metricKey: {
    fontSize: SP.metricKeyFontSize,
    fontWeight: SP.metricKeyFontWeight,
    color: theme.colors.textMuted,
    lineHeight: SP.metricKeyLineHeight,
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
    gap: 12,
    paddingVertical: 5.6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  keyCell: {
    flex: 7,
    minWidth: 0,
  },
  valueCell: {
    flex: 3,
    minWidth: 0,
  },
  key: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.textSecondary,
    textAlign: "left",
  },
  value: {
    fontSize: 14,
    color: theme.colors.link,
    textAlign: "left",
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

export const useProductDetailHeroChromeStyles = createThemedStyles((theme) => ({
  backButton: {
    position: "absolute",
    top: PRODUCT_DETAIL_HERO_CHROME.inset,
    left: PRODUCT_DETAIL_HERO_CHROME.inset,
    zIndex: 5,
    elevation: 5,
    width: PRODUCT_DETAIL_HERO_CHROME.backSize,
    height: PRODUCT_DETAIL_HERO_CHROME.backSize,
    borderRadius: PRODUCT_DETAIL_HERO_CHROME.backSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: resolveProductDetailHeroChromeBackground(theme.colors),
  },
  actionsRow: {
    position: "absolute",
    top: PRODUCT_DETAIL_HERO_CHROME.inset,
    right: PRODUCT_DETAIL_HERO_CHROME.inset,
    zIndex: 5,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: PRODUCT_DETAIL_HERO_CHROME.actionsGap,
  },
  actionButton: {
    width: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    height: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minWidth: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minHeight: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    borderRadius: PRODUCT_DETAIL_HERO_CHROME.actionRadius,
    padding: PRODUCT_DETAIL_HERO_CHROME.actionPadding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: resolveProductDetailHeroChromeBackground(theme.colors),
  },
  actionButtonDisabled: {
    opacity: 0.55,
  },
  wishlistActive: {
    backgroundColor: resolveProductDetailHeroWishlistActiveBackground(theme.colors),
  },
}));

export const useProductMediaGalleryStyles = createThemedStyles((theme) => ({
  root: {
    width: "100%",
  },
  hero: {
    width: "100%",
    aspectRatio: PRODUCT_MEDIA_DISPLAY_ASPECT_RATIO,
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
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
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
  detailRootSplit: {
    paddingTop: 0,
    paddingHorizontal: 0,
    paddingBottom: 0,
  },
  detailHero: {
    width: "100%",
    borderRadius: 13.6,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  detailBackButton: {
    position: "absolute",
    top: PRODUCT_DETAIL_HERO_CHROME.inset,
    left: PRODUCT_DETAIL_HERO_CHROME.inset,
    zIndex: 5,
    elevation: 5,
    width: PRODUCT_DETAIL_HERO_CHROME.backSize,
    height: PRODUCT_DETAIL_HERO_CHROME.backSize,
    borderRadius: PRODUCT_DETAIL_HERO_CHROME.backSize / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: resolveProductDetailHeroChromeBackground(theme.colors),
  },
  detailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
    elevation: 4,
    pointerEvents: "box-none",
  },
  detailPager: {
    zIndex: 0,
    elevation: 0,
  },
  detailReportSlot: {
    position: "absolute",
    left: 10.4,
    bottom: 10.4,
    zIndex: 5,
    elevation: 5,
  },
  detailReportButton: {
    width: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    height: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minWidth: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minHeight: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    borderRadius: PRODUCT_DETAIL_HERO_CHROME.actionRadius,
    padding: PRODUCT_DETAIL_HERO_CHROME.actionPadding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: resolveProductDetailHeroChromeBackground(theme.colors),
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
    zIndex: 3,
    elevation: 3,
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
    paddingVertical: DBRC.paddingVertical,
    borderRadius: DBRC.borderRadius,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
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
  productTabPanelHidden: {
    display: "none",
  },
  container: {
    paddingBottom: DETAIL_DOCK_SCROLL_PADDING,
    backgroundColor: theme.colors.surface,
  },
  containerSplit: {
    paddingBottom: 0,
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
    gap: PRODUCT_DETAILS_GAP,
  },
  pageWideLayout: {
    gap: PRODUCT_DETAILS_GAP,
    padding: DETAIL_SPEC_PADDING_H,
    paddingBottom: 0,
  },
  pageWideTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16.2,
    width: "100%",
    minWidth: 0,
  },
  pageWideGallery: {
    flexShrink: 0,
    minWidth: 0,
  },
  pageWideRail: {
    flex: 1,
    minWidth: 0,
    gap: 5.6,
  },
  pageWideTabs: {
    width: "100%",
    minWidth: 0,
  },
  pageWideRest: {
    gap: PRODUCT_DETAILS_GAP,
    width: "100%",
    minWidth: 0,
  },
  pageWideAltPanel: {
    width: "100%",
    minWidth: 0,
  },
  specSplit: {
    paddingHorizontal: 0,
  },
  priceBlockSplit: {
    paddingTop: 0,
  },
  commerceFold: {
    gap: PRODUCT_DETAILS_GAP,
    width: "100%",
    minWidth: 0,
  },
  featureCardsSplit:
    Platform.OS === "web"
      ? ({
          display: "grid",
          gridTemplateColumns: `repeat(auto-fit, minmax(${FC.gridSplitMinCellWidth}px, 1fr))`,
          alignItems: "stretch",
        } as const)
      : null,
  detailsSectionSplit: {
    paddingHorizontal: 0,
  },
  spec: {
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingBottom: 0,
    gap: PRODUCT_DETAILS_GAP,
  },
  priceBlock: {
    paddingTop: 5.6,
    paddingBottom: 0,
    gap: PRODUCT_DETAILS_GAP,
  },
  productName: {
    fontSize: 17.3,
    fontWeight: "700",
    lineHeight: 23.3,
    color: theme.colors.text,
  },
  aboveNameChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: BDETAIL.rowGap,
  },
  priceBadgeRow: {
    alignSelf: "stretch",
    width: "100%",
    borderRadius: DBRC.borderRadius,
    backgroundColor: `${theme.colors.text}0A`,
    overflow: "hidden",
  },
  priceBadgeRowContent: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: BDETAIL.rowGap,
    columnGap: BDETAIL.rowGap,
    paddingHorizontal: DBRC.paddingHorizontal,
    paddingVertical: DBRC.paddingVertical,
  },
  installmentTeaser: {
    marginTop: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  buyNFreeCard: {
    position: "relative" as const,
    marginTop: 0,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: theme.colors.actionSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.action,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  buyNFreeCardReady: {
    backgroundColor: "rgba(31, 122, 77, 0.12)",
    borderColor: "rgba(31, 122, 77, 0.4)",
  },
  buyNFreeInfo: {
    position: "absolute" as const,
    top: 10,
    right: 10,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: theme.colors.surface,
  },
  buyNFreeHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingRight: 36,
  },
  buyNFreeCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  buyNFreeKicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  buyNFreeTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: theme.colors.ink,
  },
  buyNFreeStatus: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
  },
  buyNFreeStatusReady: {
    color: "#1f7a4d",
  },
  buyNFreeBadge: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#1f7a4d",
    alignItems: "center",
    justifyContent: "center",
  },
  buyNFreeBadgeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  buyNFreeLogin: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNFreeLoginText: {
    color: theme.colors.onContrast,
    fontSize: 13,
    fontWeight: "700",
  },
  buyNFreeTrack: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
  },
  buyNFreeStamp: {
    flex: 1,
    minWidth: 0,
    height: 34,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNFreeStampDone: {
    borderStyle: "solid",
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  buyNFreeStampCurrent: {
    borderStyle: "solid",
    borderColor: theme.colors.action,
  },
  buyNFreeStampText: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textMuted,
  },
  buyNFreeStampTextDone: {
    color: theme.colors.onContrast,
  },
  buyNFreeStampTextCurrent: {
    color: theme.colors.action,
  },
  buyNFreeGift: {
    flex: 1.35,
    minWidth: 0,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "rgba(31, 122, 77, 0.4)",
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNFreeGiftUnlocked: {
    borderStyle: "solid",
    borderColor: "#1f7a4d",
    backgroundColor: "#1f7a4d",
  },
  buyNFreeGiftLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  buyNFreeGiftLabelUnlocked: {
    color: "rgba(255,255,255,0.9)",
  },
  buyNFreeGiftValue: {
    fontSize: 12,
    fontWeight: "800",
    color: theme.colors.textMuted,
  },
  buyNFreeGiftValueUnlocked: {
    color: "#fff",
  },
  buyNFreeMeter: {
    height: 22,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  buyNFreeMeterFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.action,
  },
  buyNFreeMeterLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: FC.cardGap,
    width: "100%",
    paddingVertical: FC.cardPaddingVertical,
    paddingHorizontal: FC.cardPaddingHorizontal,
    borderRadius: FC.cardBorderRadius,
    backgroundColor: theme.colors.bg,
    borderWidth: FC.cardBorderWidth,
    borderColor: theme.colors.border,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  featureCardIcon: {
    width: FC.iconSize,
    height: FC.iconSize,
    borderRadius: FC.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  featureCardText: {
    flex: 1,
    gap: FC.textGap,
    minWidth: 0,
  },
  featureCardTitle: {
    fontSize: FC.titleFontSize,
    fontWeight: FC.titleFontWeight,
    color: theme.colors.ink,
    lineHeight: FC.titleLineHeight,
  },
  featureCardSubtitle: {
    fontSize: FC.subtitleFontSize,
    fontWeight: FC.subtitleFontWeight,
    color: theme.colors.action,
    lineHeight: FC.subtitleLineHeight,
  },
  featureCardChevron: {
    flexShrink: 0,
    opacity: FC.chevronOpacity,
  },
  detailSellerExtras: {
    gap: PRODUCT_DETAILS_GAP,
  },
  featureCards: {
    flexDirection: "column",
    gap: FC.gridGap,
    width: "100%",
    padding: FC.gridPadding,
    borderRadius: FC.gridBorderRadius,
    borderWidth: FC.gridBorderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  metaInfoChip: {
    flexShrink: 0,
    paddingHorizontal: BDETAIL.paddingHorizontal,
    paddingVertical: BDETAIL.paddingVertical,
    borderRadius: BDETAIL.borderRadius,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
  },
  metaInfoChipAbovePrice: {
    alignSelf: "flex-start",
  },
  metaInfoChipListingOrigin: {
    backgroundColor: theme.colors.infoSoft,
  },
  metaInfoChipListingOriginText: {
    color: theme.colors.info,
  },
  metaInfoChipOriginal: {
    backgroundColor: theme.colors.successSurface,
  },
  metaInfoChipOriginalText: {
    color: theme.colors.successText,
  },
  metaInfoChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaInfoChipText: {
    fontSize: BDETAIL.fontSize,
    lineHeight: BDETAIL.lineHeight,
    fontWeight: "800",
    color: theme.colors.text,
  },
  installmentTeaserCopy: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  installmentTeaserTitle: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: theme.colors.text,
  },
  installmentTeaserMonthly: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.action,
  },
  installmentTeaserGo: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  installmentTeaserGoText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  detailsSection: {
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingTop: 0,
    paddingBottom: 0,
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
    width: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    height: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minWidth: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    minHeight: PRODUCT_DETAIL_HERO_CHROME.actionSize,
    borderRadius: PRODUCT_DETAIL_HERO_CHROME.actionRadius,
    padding: PRODUCT_DETAIL_HERO_CHROME.actionPadding,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: resolveProductDetailHeroChromeBackground(theme.colors),
    zIndex: 5,
  },
  detailReportButtonDisabled: {
    opacity: 0.55,
  },
  heroActions: {
    position: "absolute",
    top: PRODUCT_DETAIL_HERO_CHROME.inset,
    right: PRODUCT_DETAIL_HERO_CHROME.inset,
    zIndex: 5,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: PRODUCT_DETAIL_HERO_CHROME.actionsGap,
  },
  contentSwitcherTabsScroll: {
    alignSelf: "stretch",
    maxWidth: "100%",
    flexGrow: 0,
  },
  contentSwitcher: {
    gap: CS.sectionGap,
    minWidth: 0,
  },
  contentSwitcherTabs: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: CS.tabsGap,
  },
  contentSwitcherTab: {
    flexShrink: 0,
    minHeight: CS.tabMinHeight,
    paddingVertical: CS.tabPaddingVertical,
    paddingHorizontal: CS.tabPaddingHorizontal,
    borderRadius: theme.radius.pill,
    borderWidth: CS.tabBorderWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  contentSwitcherTabActive: {
    borderColor: theme.colors.ink,
    backgroundColor: theme.colors.ink,
  },
  contentSwitcherTabText: {
    fontSize: CS.tabFontSize,
    lineHeight: CS.tabLineHeight,
    fontWeight: CS.tabFontWeight,
    color: theme.colors.textSecondary,
  },
  contentSwitcherTabTextActive: {
    color: theme.colors.onContrast,
    fontWeight: CS.tabFontWeight,
  },
  /** Паритет с web `product-details-content-switcher__panel`. */
  contentSwitcherPanel: {
    minWidth: 0,
    paddingVertical: CS.panelPaddingVertical,
    paddingHorizontal: CS.panelPaddingHorizontal,
    borderWidth: CS.panelBorderWidth,
    borderColor: theme.colors.border,
    borderRadius: CS.panelBorderRadius,
    backgroundColor: theme.colors.surfaceMuted,
  },
  descriptionText: {
    fontSize: 14.4,
    fontWeight: "500",
    lineHeight: 21.6,
    color: theme.colors.text,
  },
  purchaseDock: {
    position: "absolute",
    left: PRODUCT_DETAIL_PURCHASE_DOCK_INSET,
    right: PRODUCT_DETAIL_PURCHASE_DOCK_INSET,
    bottom: PRODUCT_DETAIL_PURCHASE_DOCK_BOTTOM_INSET,
    zIndex: 10,
    elevation: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  purchaseDockInner: {
    paddingTop: 8.8,
    paddingHorizontal: 12,
    paddingBottom: 10.4,
    backgroundColor: theme.colors.surface,
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

export const useProductDetailsFeatureCardStyles = createThemedStyles((theme) => ({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: FC.cardGap,
    width: "100%",
    minWidth: 0,
    alignSelf: "stretch",
    paddingVertical: FC.cardPaddingVertical,
    paddingHorizontal: FC.cardPaddingHorizontal,
    borderRadius: FC.cardBorderRadius,
    backgroundColor: theme.colors.bg,
    borderWidth: FC.cardBorderWidth,
    borderColor: theme.colors.border,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  cardPressed: {
    backgroundColor: theme.colors.actionSoft,
    borderColor: theme.colors.actionBorder,
  },
  cardDisabled: {
    opacity: FC.disabledOpacity,
  },
  iconWrap: {
    width: FC.iconSize,
    height: FC.iconSize,
    borderRadius: FC.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  iconColor: {
    color: theme.colors.action,
  },
  textWrap: {
    flex: 1,
    gap: FC.textGap,
    minWidth: 0,
  },
  title: {
    fontSize: FC.titleFontSize,
    fontWeight: FC.titleFontWeight,
    lineHeight: FC.titleLineHeight,
    color: theme.colors.ink,
  },
  titleDark: {
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: FC.subtitleFontSize,
    fontWeight: FC.subtitleFontWeight,
    lineHeight: FC.subtitleLineHeight,
    color: theme.colors.action,
  },
  chevronWrap: {
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronColor: {
    color: theme.colors.action,
  },
}));

export const useProductPickupDetailsPanelStyles = createThemedStyles((theme) => ({
  panel: {
    gap: PL.panelGap,
    minWidth: 0,
  },
  method: {
    flexDirection: "row",
    alignItems: "center",
    gap: PL.methodGap,
    width: "100%",
    paddingVertical: PL.methodPaddingVertical,
    paddingHorizontal: PL.methodPaddingHorizontal,
    borderRadius: PL.methodBorderRadius,
    borderWidth: PL.methodBorderWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  methodPressed: {
    backgroundColor: theme.colors.actionSoft,
    borderColor: theme.colors.actionBorder,
  },
  iconWrap: {
    width: PL.iconSize,
    height: PL.iconSize,
    borderRadius: PL.iconRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
    flexShrink: 0,
  },
  iconColor: {
    color: theme.colors.action,
  },
  textWrap: {
    flex: 1,
    gap: PL.textGap,
    minWidth: 0,
  },
  title: {
    fontSize: PL.titleFontSize,
    fontWeight: PL.titleFontWeight,
    lineHeight: PL.titleLineHeight,
    color: theme.colors.ink,
  },
  titleDark: {
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: PL.subtitleFontSize,
    fontWeight: PL.subtitleFontWeight,
    lineHeight: PL.subtitleLineHeight,
    color: theme.colors.action,
  },
  subtitleMuted: {
    color: theme.colors.textMuted,
  },
  action: {
    flexShrink: 0,
    maxWidth: PL.actionMaxWidth,
    paddingVertical: PL.actionPaddingVertical,
    paddingHorizontal: PL.actionPaddingHorizontal,
    borderRadius: PL.actionBorderRadius,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: PL.actionFontSize,
    fontWeight: PL.actionFontWeight,
    lineHeight: PL.actionLineHeight,
    color: theme.colors.action,
    textAlign: "center",
  },
}));

/** Паритет с web `ProductPriceOffer.css` + `product-details-modal__auction-section`. */
export const useProductPriceOfferStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
    letterSpacing: -0.4,
    color: theme.colors.ink,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: theme.colors.textSecondary,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 19,
    color: theme.colors.ink,
  },
  topList: {
    gap: 8,
  },
  topItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  topItemMine: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSoft,
  },
  topRank: {
    width: 22,
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.textMuted,
  },
  topRankMine: {
    color: theme.colors.action,
  },
  topBuyerPressable: {
    flexShrink: 1,
    minWidth: 0,
    flexGrow: 1,
  },
  topBuyerName: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.action,
  },
  topPrice: {
    marginLeft: "auto",
    flexShrink: 0,
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  topPriceMine: {
    color: theme.colors.action,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  actions: {
    gap: 8,
  },
  inlinePrimaryButton: {
    minHeight: 44,
    borderRadius: 12,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
  status: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: `${theme.colors.danger}1A`,
    color: theme.colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  inactiveHint: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted,
  },
}));

export const useProductDetailTabBarStyles = createThemedStyles((theme) => ({
  root: {
    alignSelf: "stretch",
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: PRODUCT_DETAIL_TAB_BAR_LAYOUT.rootMarginBottom,
  },
  rootWide: {
    marginBottom: PRODUCT_DETAIL_TAB_BAR_LAYOUT.wideRootMarginBottom,
  },
  scrollContent: {
    flexDirection: "row",
    alignItems: "stretch",
    flexGrow: 1,
    gap: PRODUCT_DETAIL_TAB_BAR_LAYOUT.tabGap,
    paddingHorizontal: DETAIL_SPEC_PADDING_H,
    paddingTop: PRODUCT_DETAIL_TAB_BAR_LAYOUT.containerPaddingTop,
    paddingBottom: 0,
  },
  scrollContentWide: {
    paddingHorizontal: 0,
  },
  tab: {
    flexShrink: 0,
    paddingVertical: PRODUCT_DETAIL_TAB_BAR_LAYOUT.tabPaddingVertical,
    paddingHorizontal: PRODUCT_DETAIL_TAB_BAR_LAYOUT.tabPaddingHorizontal,
    borderRadius: 0,
    borderWidth: 0,
    borderBottomWidth: PRODUCT_DETAIL_TAB_BAR_LAYOUT.underlineWidth,
    borderBottomColor: "transparent",
    backgroundColor: "transparent",
  },
  tabActive: {
    borderBottomColor: theme.colors.action,
    backgroundColor: "transparent",
  },
  tabPressed: {
    borderBottomColor: resolveProductDetailTabUnderlineHoverColor(theme.colors),
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: PRODUCT_DETAIL_TAB_BAR_LAYOUT.fontSize,
    lineHeight: PRODUCT_DETAIL_TAB_BAR_LAYOUT.lineHeight,
    fontWeight: PRODUCT_DETAIL_TAB_BAR_LAYOUT.fontWeight,
    letterSpacing: PRODUCT_DETAIL_TAB_BAR_LAYOUT.letterSpacing,
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: PRODUCT_DETAIL_TAB_BAR_LAYOUT.fontWeightActive,
  },
}));

export const useProductDetailPurchaseActionsStyles = createThemedStyles((theme) => ({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7.2,
  },
  dockRoot: {
    gap: 7.2,
  },
  inlineRoot: {
    width: "100%",
    minWidth: 0,
  },
  cartSlot: {
    width: "100%",
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
  installmentBuyerHintBlocked: {
    margin: 0,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    borderRadius: 10.4,
    backgroundColor: `${theme.colors.danger}33`,
    fontSize: 13.6,
    lineHeight: 20,
    fontWeight: "600",
    color: theme.colors.danger,
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
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    gap: theme.spacing[1],
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
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
  qaSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  qaHeadMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    flexShrink: 0,
  },
  qaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: theme.colors.actionSoft,
  },
  qaBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.action,
  },
  qaQuestion: {
    fontSize: 14.4,
    fontWeight: "500",
    color: theme.colors.text,
    lineHeight: 20,
  },
  qaAnswer: {
    gap: 2,
    paddingLeft: theme.spacing[3],
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.actionBorder,
  },
  qaAnswerHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
  },
  qaAnswerLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: theme.colors.action,
  },
  qaAction: {
    paddingVertical: 4,
  },
  qaActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  qaActionDangerText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.danger,
  },
  qaActionPrimaryText: {
    fontSize: 13,
    fontWeight: "700",
    color: theme.colors.action,
  },
  qaComposer: {
    gap: theme.spacing[2],
  },
  qaComposerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing[2],
    flexWrap: "wrap",
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
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.surfaceMuted,
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  planCardSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.surfaceMuted,
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
    backgroundColor: theme.colors.surfaceMuted,
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
    borderRadius: 20,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
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
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surfaceMuted,
    gap: 2,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  totalBoxLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.action,
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
    flexGrow: 1,
    backgroundColor: theme.colors.bg,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    backgroundColor: theme.colors.bg,
  },
  message: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: 16,
    gap: 10,
  },
  stickyFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    // Фон + бордер на внешнем (не-overflow) слое: RN скругляет их нативно по
    // borderRadius. На Android-планшетах borderWidth+overflow:hidden+borderRadius
    // на одном View ломает рендер — поэтому клип держим отдельно (внутренний View).
    borderWidth: 1,
    borderColor: `${theme.colors.ink}14`,
    backgroundColor: theme.colors.surfaceElevated,
  },
  stickyFooterInner: {
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  stickyFooterAccentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.action,
  },
  stickyFooterShadow: {
    shadowColor: theme.colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 14,
  },
  footerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  footerTotalBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  footerTotalLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: theme.colors.ink,
  },
  footerFullTotalHint: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  footerCheckoutButton: {
    marginTop: 4,
  },
  clearButton: {
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  clearButtonText: {
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: "600",
  },
  checkoutHint: {
    fontSize: 13,
    color: theme.colors.danger,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
}));

export const useCuratedProductCompactCardStyles = createThemedStyles((theme) => {
  const C = resolveCuratedCompactCardColors(theme.colors);
  return {
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
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
  };
});

export const useCuratedCategoryCompactCardStyles = createThemedStyles((theme) => {
  const C = resolveCuratedCompactCardColors(theme.colors);
  return {
    card: {
      borderWidth: 1,
      borderColor: C.border,
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: "transparent",
    },
    imageWrap: {
      aspectRatio: 2,
      backgroundColor: C.imageBg,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
    },
  };
});

export const useHomeCuratedListsStyles = createThemedStyles((theme) => ({
  section: {
    gap: CURATED_PRODUCT_LIST_HOME_SECTION_MARGIN_BOTTOM,
  },
  listGroup: {
    gap: 0,
  },
  listBlock: {
    marginBottom: 0,
    paddingHorizontal: CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_HORIZONTAL,
    paddingVertical: CURATED_PRODUCT_LIST_HOME_SECTION_PADDING_VERTICAL,
    backgroundColor: theme.colors.surface,
    borderWidth: 0,
    borderColor: "transparent",
  },
  title: {
    fontFamily: HOME_FEED_DISPLAY_TITLE.fontFamily,
    fontSize: HOME_FEED_DISPLAY_TITLE.fontSize,
    fontWeight: HOME_FEED_DISPLAY_TITLE.fontWeight,
    lineHeight: HOME_FEED_DISPLAY_TITLE.lineHeight,
    letterSpacing: HOME_FEED_DISPLAY_TITLE.letterSpacing,
    textTransform: HOME_FEED_DISPLAY_TITLE.textTransform,
    color: theme.colors.text,
    marginTop: HOME_FEED_DISPLAY_TITLE.marginTop,
    marginBottom: HOME_FEED_DISPLAY_TITLE.marginBottom,
    paddingLeft: HOME_FEED_DISPLAY_TITLE.paddingLeft,
    paddingRight: HOME_FEED_DISPLAY_TITLE.paddingRight,
  },
  row: {
    paddingTop: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_TOP,
    paddingBottom: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_BOTTOM,
    paddingHorizontal: CURATED_PRODUCT_LIST_HOME_SCROLL_PADDING_HORIZONTAL,
    gap: CURATED_PRODUCT_LIST_HOME_CARD_GAP,
  },
}));

export const useUserStoriesStripStyles = createThemedStyles((theme) => ({
  root: {
    marginBottom: USER_STORY_STRIP_LAYOUT.marginBottom,
    paddingTop: USER_STORY_STRIP_LAYOUT.paddingTop,
    paddingBottom: USER_STORY_STRIP_LAYOUT.paddingBottom,
  },
  scrollWrapper: {
    paddingHorizontal: USER_STORY_STRIP_LAYOUT.blockPaddingHorizontal,
    paddingVertical: USER_STORY_STRIP_LAYOUT.blockPaddingVertical,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontFamily: HOME_FEED_DISPLAY_TITLE.fontFamily,
    fontSize: HOME_FEED_DISPLAY_TITLE.fontSize,
    fontWeight: HOME_FEED_DISPLAY_TITLE.fontWeight,
    lineHeight: HOME_FEED_DISPLAY_TITLE.lineHeight,
    letterSpacing: HOME_FEED_DISPLAY_TITLE.letterSpacing,
    textTransform: HOME_FEED_DISPLAY_TITLE.textTransform,
    color: theme.colors.text,
    marginTop: HOME_FEED_DISPLAY_TITLE.marginTop,
    marginBottom: HOME_FEED_DISPLAY_TITLE.marginBottom,
    paddingLeft: HOME_FEED_DISPLAY_TITLE.paddingLeft,
    paddingRight: HOME_FEED_DISPLAY_TITLE.paddingRight,
  },
  scroll: {
    flexDirection: "row",
    flexGrow: 1,
    alignItems: "center",
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
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  ringViewed: {
    backgroundColor: theme.colors.textMuted,
  },
  ringAdd: {
    width: USER_STORY_STRIP_LAYOUT.ringSize,
    height: USER_STORY_STRIP_LAYOUT.ringSize,
    borderRadius: USER_STORY_STRIP_LAYOUT.ringSize / 2,
    padding: USER_STORY_STRIP_LAYOUT.ringPadding,
    backgroundColor: theme.colors.action,
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
    borderColor: theme.colors.surface,
  },
  avatarFallback: {
    width: USER_STORY_STRIP_INNER_SIZE,
    height: USER_STORY_STRIP_INNER_SIZE,
    borderRadius: USER_STORY_STRIP_INNER_SIZE / 2,
    borderWidth: USER_STORY_STRIP_LAYOUT.avatarBorderWidth,
    borderColor: theme.colors.surface,
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
    backgroundColor: theme.colors.link,
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
    color: theme.colors.textSecondary,
    maxWidth: USER_STORY_STRIP_LAYOUT.itemWidth,
    textAlign: "center",
  },
}));

export const useCatalogBrowserPageStyles = createThemedStyles((theme) => ({
  // Фон во всю ширину — под центрированным контентом на планшетах.
  scroll: {
    backgroundColor: theme.colors.bg,
  },
  // Центрируем контентную колонку; ширину ограничивает centeredContentStyle.
  scrollContent: {
    alignItems: "center",
    flexGrow: 1,
  },
  container: {
    width: "100%",
    padding: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    // Без gap: отступы секций = web `.catalog-feed-tiles` / `__categories`.
    backgroundColor: theme.colors.bg,
  },
}));

export const useCatalogSubcategoryPickerStyles = createThemedStyles((theme) => ({
  container: {
    padding: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingBottom: SCREEN_CONTENT_PADDING_BOTTOM,
    gap: 16,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 999,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.link,
  },
  title: {
    flex: 1,
    minWidth: 120,
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.danger,
  },
  loading: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
}));

export const useCatalogBrowserSectionStyles = createThemedStyles((theme) => ({
  sectionFeed: {
    marginTop: 0,
    marginBottom: CATALOG_BROWSER_LANDING_LAYOUT.feedMarginBottom,
    paddingTop: CATALOG_BROWSER_LANDING_LAYOUT.feedPaddingTop,
  },
  sectionCategories: {
    marginTop: CATALOG_BROWSER_LANDING_LAYOUT.categoriesMarginTop,
    marginBottom: 0,
    paddingTop: CATALOG_BROWSER_LANDING_LAYOUT.categoriesPaddingTop,
  },
  sectionTitle: {
    marginTop: CATALOG_BROWSER_LANDING_LAYOUT.titleMarginTop,
    marginBottom: CATALOG_BROWSER_LANDING_LAYOUT.titleMarginBottom,
    fontFamily: CATALOG_BROWSER_DISPLAY_TITLE.fontFamily,
    fontSize: CATALOG_BROWSER_DISPLAY_TITLE.fontSize,
    fontWeight: CATALOG_BROWSER_DISPLAY_TITLE.fontWeight,
    letterSpacing: CATALOG_BROWSER_DISPLAY_TITLE.letterSpacing,
    lineHeight: CATALOG_BROWSER_DISPLAY_TITLE.lineHeight,
    color: theme.colors.ink,
    paddingLeft: 12,
    borderLeftWidth: CATALOG_BROWSER_LANDING_LAYOUT.titleAccentWidth,
    borderLeftColor: theme.colors.action,
  },
  sectionTitleCategories: {
    // Web `.catalog-browser-landing__categories-title` clamp mid ≈ 18–20.
    fontSize: 20,
    lineHeight: 23,
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
    width: "100%",
    aspectRatio: 1,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
  },
  cardPending: {
    opacity: 0.55,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    top: -1,
    right: -1,
    bottom: -1,
    left: -1,
  },
  labelSlot: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    maxWidth: "78%",
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "600",
    textAlign: "left",
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
