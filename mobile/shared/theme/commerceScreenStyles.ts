import { izTypography } from "@izibuy/design-tokens";
import { Platform, StyleSheet } from "react-native";

import { ORDER_CARD_ITEM_THUMB_SIZE } from "@/entities/product/model/constants";
import { RAFFLE_PRODUCTS_PAGE_LAYOUT as L } from "@/entities/raffle/lib/raffleProductsPageLayout";
import {
  CART_LINE_CARD_BORDER_RADIUS,
  CART_LINE_IMAGE_SIZE,
} from "@/shared/config/cartConstants";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

const ORDER_CARD_RADIUS = 20;
const ORDER_CARD_HEADER_BADGE_FONT_SIZE = 10.24;
const ORDER_CARD_HEADER_BADGE_PADDING_H = 8.32;
const ORDER_CARD_HEADER_BADGE_PADDING_V = 3.2;
const ORDER_CARD_HEADER_BADGE_GAP = 4.8;

const orderCardHeaderBadgeBase = {
  fontSize: ORDER_CARD_HEADER_BADGE_FONT_SIZE,
  fontWeight: izTypography.fontWeightSemibold,
  paddingHorizontal: ORDER_CARD_HEADER_BADGE_PADDING_H,
  paddingVertical: ORDER_CARD_HEADER_BADGE_PADDING_V,
  borderRadius: 999,
  overflow: "hidden" as const,
};

export const useOrderCardStyles = createThemedStyles((theme) => ({
  card: {
    padding: 16,
    marginBottom: theme.spacing[3],
    gap: 10.4,
    borderRadius: ORDER_CARD_RADIUS,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  /** web `.order-card--compact` live: pad 14 gap 8 r20. */
  cardCompact: {
    padding: 14,
    gap: 8,
  },
  cardAttention: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.warning,
  },
  headerMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    minWidth: 0,
  },
  collapsedPreview: {
    fontSize: 13.1,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing[2],
    gap: theme.spacing[2],
  },
  /** web `.order-card--compact .order-card__header` gap 0.5rem, no bottom border. */
  headerCompact: {
    marginBottom: 0,
    gap: 8,
    alignItems: "flex-start",
  },
  headerBadges: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: ORDER_CARD_HEADER_BADGE_GAP,
  },
  statusBadge: {
    ...orderCardHeaderBadgeBase,
  },
  installmentBadge: {
    ...orderCardHeaderBadgeBase,
    backgroundColor: semanticColors.actionSoft,
    color: theme.colors.actionHover,
  },
  auctionBadge: {
    ...orderCardHeaderBadgeBase,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.actionBorder,
    backgroundColor: semanticColors.infoSoft,
    color: theme.colors.link,
  },
  total: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  /** web `.order-card--compact .order-card__total` → 1rem. */
  totalCompact: {
    fontSize: 16,
  },
  /** web `.order-card__header-totals`. */
  headerTotals: {
    flexDirection: "row",
    flexShrink: 0,
    alignItems: "baseline",
    gap: 5.6,
  },
  /** web `.order-card__quantity` / compact 0.9rem. */
  headerQuantity: {
    color: theme.colors.textSecondary,
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  /** web `.order-card__order-number`. */
  orderNumber: {
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    letterSpacing: 0.02 * 12.8,
    color: theme.colors.textMuted,
  },
  /**
   * web `.order-card__shipment-row`: method + actions над позициями.
   * pad 0.65/0.75rem, r16, border.
   */
  shipmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 8,
    paddingVertical: 10.4,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 16,
    /* web `--iz-color-bg-subtle` fallback → transparent поверх surface карточки */
    backgroundColor: "transparent",
    overflow: "visible",
  },
  shipmentMethod: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9.6,
    minWidth: 0,
  },
  shipmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: semanticColors.actionSoft,
  },
  shipmentMethodCopy: {
    flexDirection: "column",
    gap: 1,
    minWidth: 0,
  },
  shipmentMethodCaption: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textMuted,
  },
  shipmentMethodValue: {
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  shipmentActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    marginLeft: "auto",
  },
  meta: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  itemsList: {
    marginTop: 4,
    gap: 4,
  },
  itemBlock: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemBlockCompact: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemThumb: {
    width: ORDER_CARD_ITEM_THUMB_SIZE,
    height: ORDER_CARD_ITEM_THUMB_SIZE,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemThumbPressable: {
    width: ORDER_CARD_ITEM_THUMB_SIZE,
    height: ORDER_CARD_ITEM_THUMB_SIZE,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemThumbImage: {
    width: "100%",
    height: "100%",
  },
  itemBody: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  itemMain: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  itemTitleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  itemNamePressable: {
    flex: 1,
    minWidth: 0,
  },
  itemLine: {
    flex: 1,
    fontSize: theme.typography.fontBase,
    color: theme.colors.text,
  },
  itemNameLink: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  itemQuantity: {
    fontSize: theme.typography.fontBase,
    color: theme.colors.textMuted,
  },
  itemPrice: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  /** web `.order-card__item-price-block` */
  itemPriceBlock: {
    gap: 1,
  },
  /** web `.order-card--compact .order-card__item-price` */
  itemPriceCompact: {
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  /** web `.order-card__item-price-unit` */
  itemPriceUnit: {
    fontSize: 12,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textSecondary,
  },
  itemLoyalty: {
    marginTop: 4,
    fontSize: theme.typography.fontXs,
    color: theme.colors.success,
  },
  itemAffiliate: {
    marginTop: 4,
    fontSize: theme.typography.fontXs,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  itemStatus: {
    marginTop: 4,
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  // Отменённая позиция остаётся в списке как история заказа, но читаться как
  // «это вам везут» она не должна.
  itemBlockCancelled: {
    backgroundColor: theme.colors.surfaceMuted,
  },
  itemTextCancelled: {
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
  },
  itemCancelledBadge: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    fontSize: theme.typography.font2xs,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.textSecondary,
  },
  itemTimestamp: {
    marginTop: 2,
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
  },
  itemActions: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  itemActionsRow: {
    marginTop: 1.6,
    paddingTop: 5.6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4.8,
  },
  /** Compact item action: web pad 0.28/0.65rem. */
  actionButtonCompact: {
    paddingVertical: 4.48,
    paddingHorizontal: 10.4,
  },
  actionButton: {
    paddingVertical: 5.1,
    paddingHorizontal: 11.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  actionButtonCancel: {
    backgroundColor: theme.colors.danger,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  actionDisabled: {
    opacity: theme.interaction.disabledOpacity,
  },
  actionButtonText: {
    fontSize: 13.1,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.onContrast,
  },
  actionButtonTextCancel: {
    color: theme.colors.onContrast,
  },
  itemError: {
    marginTop: 6,
    fontSize: theme.typography.fontXs,
    color: theme.colors.danger,
  },
  // Web: `.order-card__awaiting-prepayment`.
  awaitingPrepayment: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: 12,
    backgroundColor: theme.colors.warningSurface,
    gap: 6,
  },
  awaitingPrepaymentTitle: {
    fontSize: 13.6,
    lineHeight: theme.typography.leadingBase,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.warningText,
  },
  awaitingPrepaymentHint: {
    fontSize: 13.6,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.warningText,
  },
  // Web: `.order-card__prepayment-due`.
  prepaymentDue: {
    fontSize: 13.6,
    lineHeight: theme.typography.leadingBase,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.warningText,
  },
  // Web: `.order-card__pay-now`.
  payNowButton: {
    alignSelf: "stretch",
    minHeight: 46,
    marginTop: 6,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.action,
    alignItems: "center",
    justifyContent: "center",
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  payNowButtonText: {
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.onContrast,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  /**
   * web `.order-card--compact .order-card__details-fold-body .order-card__meta`
   * — column gap 0.35rem; rows column gap 0.1rem, без «:».
   */
  metaFold: {
    gap: 5.6,
  },
  metaRowFold: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 1.6,
    marginBottom: 0,
    width: "100%",
  },
  metaLabel: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.textMuted,
  },
  metaValue: {
    flex: 1,
    fontSize: theme.typography.fontSm,
    color: theme.colors.text,
  },
  metaValueFold: {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: "stretch",
    fontSize: 15.2,
  },
  buyerLink: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  buyerLinkFold: {
    fontSize: 15.2,
  },
  counterpartyValue: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 2,
  },
  counterpartyValueFold: {
    flexGrow: 0,
    flexShrink: 1,
    alignSelf: "stretch",
  },
  counterpartyList: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  counterpartyListItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  counterpartyPhone: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.link,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  counterpartyPhoneText: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  /** web `.order-card__details-fold` — muted surface box r14. */
  detailsFold: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
    overflow: "hidden",
  },
  /** web `.order-card__details-fold-summary` */
  detailsFoldSummaryPressable: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
    paddingVertical: 4.48,
    paddingHorizontal: 8.8,
  },
  detailsFoldChevron: {
    marginRight: 6.4,
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 19.2,
    color: theme.colors.textMuted,
  },
  detailsFoldSummaryLabel: {
    fontSize: 12.8,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 19.2,
    color: theme.colors.textSecondary,
  },
  detailsFoldBody: {
    gap: 7.2,
    paddingHorizontal: 8.8,
    paddingBottom: 8.8,
  },
  itemExtras: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    gap: 4,
  },
  itemExtrasName: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  footer: {
    marginTop: theme.spacing[3],
    paddingTop: theme.spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
}));

/** Паритет `BuyerPassportSharePanel.css`. */
export const useBuyerPassportSharePanelStyles = createThemedStyles((theme) => ({
  panel: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    gap: 8,
  },
  title: {
    marginBottom: 0,
    fontSize: 14,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 12,
    rowGap: 8,
  },
  field: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 160,
    minWidth: 160,
    maxWidth: "100%",
    gap: 2,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  value: {
    fontSize: 14,
    color: theme.colors.text,
  },
  selfieSection: {
    marginTop: 12,
    gap: 8,
  },
  selfieTitle: {
    fontSize: 13,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  selfieLink: {
    alignSelf: "flex-start",
    gap: 5.6,
  },
  selfieLinkText: {
    fontSize: 13,
    color: theme.colors.link,
  },
  selfieImage: {
    width: 192,
    maxWidth: "100%",
    height: 192,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  selfieMissing: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
}));

export const useCartSelectAllRowStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 12,
    marginBottom: 8,
    /** Ставит чекбокс в одну колонку с чекбоксами карточек ниже. */
    paddingRight: 12,
  },
  count: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.textMuted,
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
}));

export const useCartLineItemStyles = createThemedStyles((theme) => ({
  /** web `.cart-fulfillment .cart-line { margin-bottom: 0 }` + list gap 6. */
  rowOuter: {
    marginHorizontal: 12,
    marginBottom: 0,
  },
  /** web `.cart-line__card` — radius 14, без squircle. */
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: CART_LINE_CARD_BORDER_RADIUS,
    overflow: "hidden",
  },
  rowUpdating: {
    opacity: 0.7,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  imageWrap: {
    width: CART_LINE_IMAGE_SIZE,
    height: CART_LINE_IMAGE_SIZE,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    /** Место под чекбокс выбора в правом верхнем углу карточки. */
    paddingRight: 28,
  },
  unitPriceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 8,
  },
  unitPrice: {
    /** Web cart line current ≈ 1.0625rem (17) / 700 */
    fontSize: theme.typography.fontXl,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.text,
  },
  unitPriceOld: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightMedium,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.textMuted,
    textDecorationLine: "line-through",
  },
  selectCheckbox: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  stockHint: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightMedium,
    color: semanticColors.warning,
  },
  wholesaleBadge: {
    fontSize: theme.typography.fontXs,
    fontWeight: theme.typography.fontWeightBold,
    lineHeight: 14,
    color: theme.colors.action,
  },
  name: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.text,
  },
  nameLink: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.text,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 12,
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperWrap: {
    flex: 1,
    alignItems: "center",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceMuted,
  },
  stepButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: {
    opacity: 0.35,
  },
  stepButtonText: {
    fontSize: theme.typography.font2xl,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
    lineHeight: theme.typography.leadingLg,
  },
  quantity: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    minWidth: 22,
    textAlign: "center",
    color: theme.colors.text,
  },
  lineTotal: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
    minWidth: 72,
    textAlign: "right",
  },
}));

export const useOrdersScreenStyles = createThemedStyles((theme) => ({
  list: {
    padding: theme.spacing[4],
    flexGrow: 1,
  },
  toolbarHead: {
    marginBottom: theme.spacing[2],
  },
  countLabel: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  filters: {
    gap: theme.spacing[2],
    paddingBottom: theme.spacing[3],
  },
  filterChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.pill,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: 14,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.nearBlack,
    borderColor: theme.colors.nearBlack,
  },
  filterChipText: {
    fontSize: theme.typography.fontSm,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  filterChipTextActive: {
    color: theme.colors.onContrast,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing[6],
  },
  message: {
    fontSize: theme.typography.fontLg,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  hint: {
    fontSize: theme.typography.fontMd,
    textAlign: "center",
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  button: {
    backgroundColor: theme.colors.nearBlack,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing[6],
  },
  buttonText: {
    color: theme.colors.onContrast,
    fontSize: theme.typography.fontLg,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  loyaltyFlash: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[3],
    borderRadius: 10,
    backgroundColor: theme.colors.actionSurface,
    color: theme.colors.success,
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    textAlign: "center",
  },
}));

export const useSimpleProductListStyles = createThemedStyles((theme) => ({
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
  list: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.sm,
    overflow: "hidden",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    padding: theme.spacing[3],
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.surfaceMuted,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  price: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.text,
  },
  remove: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 20,
  },
  removeText: {
    fontSize: theme.typography.font5xl,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.leadingXl,
  },
}));

export const useCachedProductImageStyles = createThemedStyles((theme) => ({
  image: {
    width: "100%",
    height: "100%",
  },
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceMuted,
  },
  fallbackText: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textMuted,
    textAlign: "center",
    padding: theme.spacing[2],
  },
}));

export const useRaffleProductsPageStyles = createThemedStyles((theme, layout) => ({
  flex: {
    flex: 1,
    // Custom: page canvas = web `--iz-page-bg-custom`, не `colors.bg` (#DEDEDE).
    backgroundColor: layout.pageBackground,
  },
  list: {
    flexGrow: 1,
  },
  listContent: {
    paddingTop: 8,
  },
  summaryLayout: {
    gap: 0,
  },
  summaryLayoutWide: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: L.summaryLayoutWideGap,
  },
  productsBlock: {
    marginTop: L.productsBlockMarginTop,
  },
  hero: {
    position: "relative",
    flex: 1,
    minWidth: 0,
  },
  summarySide: {
    minWidth: 0,
  },
  summarySideWide: {
    flex: 1,
    gap: 0,
  },
  headerCard: {
    gap: 6,
    marginBottom: L.headerMarginBottom,
    padding: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: `${theme.colors.action}47`,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
  },
  headerCardWide: {
    marginTop: L.summarySideHeaderMarginTopWide,
    marginBottom: 0,
    paddingVertical: L.headerPaddingWideVertical,
    paddingHorizontal: L.headerPaddingWideHorizontal,
  },
  media: {
    position: "relative",
    width: "100%",
    marginBottom: L.mediaMarginBottom,
    overflow: "hidden",
    borderRadius: L.mediaRadius,
    backgroundColor: theme.colors.surfaceMuted,
  },
  mediaWide: {
    marginBottom: L.mediaMarginBottomWide,
  },
  mediaForeground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 6,
    opacity: 0.01,
    ...(Platform.OS === "web"
      ? ({
          // Оверлей ловит ГОРИЗОНТАЛЬНЫЙ свайп между розыгрышами, а `pan-y`
          // отдаёт браузеру только вертикаль — горизонтальные жесты до списка
          // не доходили, и карусель не листалась. Нужны обе оси: вертикаль
          // уходит на прокрутку страницы, горизонталь — в карусель.
          // Так же сделано в вебе у галереи товара (touch-action: pan-x pan-y).
          touchAction: "pan-x pan-y",
        } as const)
      : null),
  },
  swipeSoundToggle: {
    zIndex: 7,
  },
  swipeDots: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    zIndex: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: "center",
  },
  swipeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  swipeDotActive: {
    backgroundColor: "#fff",
  },
  copy: {
    gap: 6,
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 11.5,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 1.4,
    lineHeight: 14,
    textTransform: "uppercase",
    color: theme.colors.action,
  },
  title: {
    fontSize: theme.typography.font3xl,
    fontWeight: "800",
    letterSpacing: -0.4,
    lineHeight: theme.typography.leadingXl,
    color: theme.colors.text,
  },
  description: {
    marginBottom: L.descriptionMarginBottom,
    paddingHorizontal: 2.4,
    fontSize: theme.typography.fontMd,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.text,
    opacity: 0.9,
  },
  descriptionDesktop: {
    marginTop: L.descriptionDesktopMarginTop,
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  manageDesktop: {
    marginBottom: L.manageDesktopMarginBottom,
  },
  progress: {
    gap: 10,
    marginBottom: L.progressMarginBottom,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
  },
  progressWide: {
    gap: L.progressGapWide,
    marginBottom: 0,
    paddingVertical: L.progressPaddingWideVertical,
    paddingHorizontal: L.progressPaddingWideHorizontal,
  },
  progressBar: {
    width: "100%",
    height: 9,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: theme.colors.actionBorder,
  },
  progressBarCompleted: {
    backgroundColor: theme.colors.successSurface,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: theme.colors.action,
  },
  progressFillCompleted: {
    backgroundColor: theme.colors.success,
  },
  stats: {
    flexDirection: "row",
    gap: 7,
  },
  statsWide: {
    gap: L.statsGapWide,
  },
  stat: {
    flex: 1,
    gap: 2,
    minWidth: 0,
    paddingVertical: 9,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
  },
  statWide: {
    paddingVertical: L.statPaddingWideVertical,
    paddingHorizontal: L.statPaddingWideHorizontal,
  },
  statAccent: {
    borderColor: `${theme.colors.action}59`,
    backgroundColor: theme.colors.actionSoft,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
    textAlign: "center",
  },
  statValue: {
    fontSize: theme.typography.fontMd,
    fontWeight: "800",
    lineHeight: theme.typography.leadingSm,
    color: theme.colors.text,
    textAlign: "center",
  },
  statValueAccent: {
    color: theme.colors.action,
  },
  empty: {
    padding: theme.spacing[6],
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.typography.fontMd,
    color: theme.colors.textMuted,
  },
  footer: {
    marginVertical: theme.spacing[4],
  },
}));
