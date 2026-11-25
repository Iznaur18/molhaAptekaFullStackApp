import { Platform, StyleSheet } from "react-native";

import { SELLER_PRODUCTS_PAGE_LAYOUT as L } from "@/features/seller-products-page/lib/sellerProductsPageLayout";
import { MY_PRODUCTS_PAGE_LAYOUT } from "@/shared/lib/guestProfileLayout";
import { MEDIA_OVERLAY_SCRIM } from "@/shared/theme/catalogProductStyles";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useAppIntroSplashStyles = createThemedStyles((theme, layout) => ({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.ink,
  },
  video: {
    flex: 1,
    width: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[2],
  },
  fallbackTitle: {
    color: theme.colors.onContrast,
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  fallbackHint: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontLg,
    textAlign: "center",
  },
  controls: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: theme.spacing[8],
    alignItems: "center",
    gap: theme.spacing[3],
  },
  controlText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    textAlign: "center",
    textShadowColor: MEDIA_OVERLAY_SCRIM,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  adBadge: {
    position: "absolute",
    top: 52,
    left: theme.spacing[4],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: MEDIA_OVERLAY_SCRIM,
  },
  adBadgeText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
  },
}));

export const useSellerFormStyles = createThemedStyles((theme, layout) => ({
  label: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  mediaChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    backgroundColor: theme.colors.surface,
  },
  mediaChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  mediaChipText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  mediaChipTextActive: {
    color: theme.colors.onContrast,
  },
  submit: {
    marginTop: theme.spacing[4],
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: theme.colors.nearBlack,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  submitDisabled: {
    opacity: theme.interaction.disabledOpacity,
  },
  submitText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  success: {
    color: theme.colors.success,
    fontSize: theme.typography.fontBase,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontSm,
  },
  container: {
    padding: theme.spacing[4],
    gap: 10,
    paddingBottom: theme.spacing[8],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textMuted,
  },
  textarea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  mediaTypeRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontLg,
  },
}));

export const useAuctionPageStyles = createThemedStyles((theme, layout) => ({
  list: {
    padding: theme.spacing[4],
    flexGrow: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.fontXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: theme.spacing[3],
    padding: theme.spacing[3],
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.button,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  rowMain: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  rowMeta: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  rowPrice: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  accepted: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.success,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: theme.colors.nearBlack,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontSm,
  },
  rejectButton: {
    borderRadius: theme.radius.button,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.surface,
  },
  rejectButtonText: {
    color: theme.colors.danger,
    fontWeight: theme.typography.fontWeightSemibold,
    fontSize: theme.typography.fontSm,
  },
  bidRow: {
    padding: theme.spacing[3],
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing[2],
    gap: 4,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontXs,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: theme.typography.fontMd,
    textAlign: "center",
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.nearBlack,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
}));

export const useProductEditorScreenStyles = createThemedStyles((theme, layout) => ({
  editorScreen: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    flex: 1,
    backgroundColor: layout.pageBackground,
  },
  container: {
    padding: 20,
    paddingBottom: 20,
  },
  content: {
    gap: 16,
  },
  zoneBlock: {
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderColor: theme.colors.border,
  },
  zoneMain: {
    backgroundColor: theme.colors.surface,
  },
  zoneInventory: {
    backgroundColor: theme.colors.surface,
  },
  zoneMedia: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  contentWithFooterPad: {
    paddingBottom: 168,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  textArea: {
    minHeight: 128,
    textAlignVertical: "top",
    lineHeight: theme.typography.leadingLg,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surfaceMuted,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  imageUrl: {
    fontSize: theme.typography.fontXs,
    lineHeight: theme.typography.leading2xs,
    color: theme.colors.textMuted,
  },
  feedbackBox: {
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 9,
    paddingHorizontal: 11,
  },
  errorBox: {
    borderColor: `${theme.colors.danger}59`,
    backgroundColor: `${theme.colors.danger}12`,
  },
  successBox: {
    borderColor: `${theme.colors.success}40`,
    backgroundColor: `${theme.colors.success}14`,
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
  },
  success: {
    color: theme.colors.success,
    fontSize: theme.typography.fontBase,
    lineHeight: theme.typography.leadingBase,
  },
  hint: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textSecondary,
  },
  returnChoiceRow: {
    flexDirection: "row",
    gap: 10,
  },
  returnChoiceChip: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  returnChoiceChipText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
  },
  returnTermBlock: {
    gap: 12,
    marginTop: 4,
  },
  priceGrid: {
    flexDirection: "row",
    gap: 12,
  },
  priceCol: {
    flex: 1,
  },
  priceInput: {
    fontVariant: ["tabular-nums"],
  },
  discountPreview: {
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  discountPreviewText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  charRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    width: "100%",
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  charInput: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontBase,
  },
  charInputValue: {
    flexGrow: 1.5,
  },
  charRemoveBtn: {
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  charRemoveText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
  },
  charAddButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  charAddButtonText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 4,
    gap: 10,
  },
  footerDock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: theme.colors.danger,
  },
  submitButton: {
    flex: 1.4,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: theme.colors.action,
    borderColor: theme.colors.action,
    shadowColor: theme.colors.action,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 6,
  },
  submitText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.fontMd,
  },
  deleteButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  deleteText: {
    color: theme.colors.danger,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  cancelButtonText: {
    color: theme.colors.onContrast,
    fontWeight: theme.typography.fontWeightBold,
    fontSize: theme.typography.fontMd,
  },
  buttonPressed: {
    opacity: theme.interaction.pressedOpacity,
  },
  disabled: {
    opacity: theme.interaction.disabledOpacity,
  },
}));

export const useMyProductsPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  listFlex: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    flexGrow: 1,
  },
  /** Desktop hub: shell уже даёт pad; gutter 0 как web `--my-profile-shell-content-gutter: 0`. */
  listInAccountShell: {
    paddingHorizontal: 0,
  },
  /** web `__main { gap: 0.75rem }` — shelves / toolbar / notices; list gap отдельно. */
  header: {
    gap: MY_PRODUCTS_PAGE_LAYOUT.stackGap,
    paddingTop: 0,
    paddingBottom: 0,
  },
  headerActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  createButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.action,
  },
  createButtonDisabled: {
    opacity: 0.55,
  },
  createButtonText: {
    color: theme.colors.onContrast,
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  banner: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 13.5,
    lineHeight: 19,
  },
  noticeBanner: {
    backgroundColor: theme.colors.actionSurface,
    color: theme.colors.infoNavy,
  },
  errorBanner: {
    backgroundColor: `${theme.colors.danger}14`,
    color: theme.colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[4],
  },
  hint: {
    fontSize: theme.typography.fontMd,
    textAlign: "center",
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
}));

export const useSellerProductsPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    backgroundColor: layout.pageBackground,
    width: "100%",
    minWidth: 0,
    overflow: "hidden",
  },
  listFlex: {
    flex: 1,
    width: "100%",
    minWidth: 0,
  },
  list: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 0,
    flexGrow: 1,
    width: "100%",
    alignSelf: "stretch",
    minWidth: 0,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    minHeight: L.navMinHeight,
    marginTop: -L.screenPaddingTop,
    marginBottom: 0,
  },
  navBack: {
    width: L.navBackSize,
    height: L.navBackSize,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  navBackPressed: {
    backgroundColor: theme.colors.actionSurface,
  },
  navTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: L.navTitleFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: L.navTitleLineHeight,
    color: theme.colors.text,
  },
  header: {
    gap: L.screenGap,
    paddingTop: L.screenPaddingTop,
  },
  sellerMetaZone: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: L.metaZoneGap,
    paddingHorizontal: L.metaZonePaddingHorizontal,
  },
  sellerMetaNameHost: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  sellerMetaName: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sellerMetaNamePressed: {
    opacity: 0.88,
  },
  sellerMetaActions: {
    flexDirection: "row",
    flexShrink: 0,
    alignItems: "center",
    gap: L.metaActionsGap,
  },
  sellerName: {
    fontSize: L.sellerNameFontSize,
    fontWeight: L.sellerNameFontWeight,
    lineHeight: L.sellerNameLineHeight,
    color: theme.colors.text,
  },
  hint: {
    textAlign: "center",
    marginTop: theme.spacing[6],
    fontSize: theme.typography.fontMd,
    color: theme.colors.textMuted,
  },
  shelvesRow: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: L.shelfRowGap,
    paddingTop: L.shelfRowPaddingTop,
    paddingBottom: L.shelfRowPaddingBottom,
  },
  /** web `.seller-products-page__shelves--nested` */
  shelvesRowNested: {
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.border,
  },
  shelfChip: {
    flexShrink: 0,
    paddingVertical: L.shelfChipPaddingVertical,
    paddingHorizontal: L.shelfChipPaddingHorizontal,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: "transparent",
  },
  shelfChipActive: {
    backgroundColor: theme.colors.action,
  },
  shelfChipText: {
    fontSize: L.shelfChipFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
  },
  shelfChipTextActive: {
    color: theme.colors.onContrast,
  },
  footerLoader: {
    marginVertical: theme.spacing[4],
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
    gap: theme.spacing[3],
    backgroundColor: layout.pageBackground,
  },
  button: {
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: 20,
    backgroundColor: theme.colors.action,
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
}));

export const useSellerProfileQuickStatsStyles = createThemedStyles((theme, layout) => ({
  root: {
    width: "100%",
  },
  gridRow: {
    flexDirection: "row",
    gap: L.statsGridGap,
  },
  gridCompact: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: L.statsGridGap,
  },
  itemCompactHalf: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "48%",
    maxWidth: "48%",
  },
  itemCompactFull: {
    width: "100%",
    flexBasis: "100%",
    maxWidth: "100%",
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 0,
    paddingVertical: L.statsItemPaddingVertical,
    paddingHorizontal: L.statsItemPaddingHorizontal,
    borderRadius: L.statsItemBorderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    /* Паритет web PR #87: белые блоки, как `.seller-profile-quick-stats__item`. */
    backgroundColor: theme.colors.surface,
  },
  itemFollowers: {
    flex: L.statsColumnFlexFollowers,
  },
  itemRating: {
    flex: L.statsColumnFlexRating,
  },
  itemPhone: {
    flex: L.statsColumnFlexPhone,
  },
  body: {
    gap: 2,
    minWidth: 0,
    width: "100%",
    alignItems: "center",
  },
  value: {
    fontSize: L.statsValueFontSize,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.ink,
    textAlign: "center",
  },
  valuePhone: {
    fontSize: L.statsPhoneValueFontSize,
    letterSpacing: -0.16,
  },
  label: {
    fontSize: L.statsLabelFontSize,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: 13,
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  link: {
    color: theme.colors.ink,
  },
  reveal: {
    padding: 0,
  },
  revealText: {
    fontSize: L.statsPhoneValueFontSize,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: theme.typography.leading2xs,
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  revealError: {
    marginTop: 4,
    fontSize: L.statsLabelFontSize,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.danger,
    textAlign: "center",
  },
}));

export const useInstallmentProgramModalStyles = createThemedStyles((theme, layout) => ({
  embeddedRoot: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    elevation: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  card: {
    flex: 1,
    flexDirection: "column",
    height: "100%",
    backgroundColor: theme.colors.surface,
    overflow: "hidden",
  },
  header: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.font2xl,
    lineHeight: theme.typography.leadingXl,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: theme.typography.font5xl,
    lineHeight: theme.typography.leadingXl,
    color: theme.colors.textMuted,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bodyScroll: {
    flex: 1,
    minHeight: 0,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  error: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.danger,
  },
  success: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.success,
  },
  info: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textSecondary,
  },
  retailPrice: {
    color: theme.colors.action,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  planCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceElevated,
    overflow: "hidden",
  },
  planCardLast: {
    marginBottom: 0,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.actionHover,
    backgroundColor: theme.colors.action,
  },
  planTitle: {
    flex: 1,
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
    color: theme.colors.onContrast,
  },
  planRemoveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  planRemove: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  planBody: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 8,
    backgroundColor: theme.colors.surfaceElevated,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 10 : 8,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  rowFields: {
    flexDirection: "row",
    gap: 10,
  },
  rowField: {
    flex: 1,
    gap: 6,
  },
  planTotalBlock: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  planTotalMeta: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textSecondary,
  },
  planTotalMain: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  firstPaymentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  firstPaymentLabel: {
    flex: 1,
    fontSize: theme.typography.fontSm,
    color: theme.colors.text,
  },
  addPlanButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  addPlanButtonText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.link,
  },
  maxPlansHint: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  footer: {
    flexShrink: 0,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
  saveButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: theme.colors.action,
  },
  saveButtonText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
  },
  buttonDisabled: {
    opacity: theme.interaction.disabledOpacity,
  },
}));
