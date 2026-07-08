import { StyleSheet } from "react-native";

import { ORDER_CARD_ITEM_THUMB_SIZE } from "@/entities/product/model/constants";
import { CART_LINE_IMAGE_SIZE } from "@/shared/config/cartConstants";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import { semanticColors } from "@/shared/theme/semanticColors";

export const useOrderCardStyles = createThemedStyles((theme) => ({
  card: {
    padding: 14,
    marginBottom: theme.spacing[3],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderLeftWidth: StyleSheet.hairlineWidth,
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
  chevronButton: {
    flexShrink: 0,
    padding: 2,
  },
  chevron: {
    width: 20,
    height: 20,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: "center",
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
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
  headerBadges: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  statusBadge: {
    fontSize: 12.8,
    fontWeight: "600",
    paddingHorizontal: 10.4,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  installmentBadge: {
    fontSize: 12.8,
    fontWeight: "600",
    paddingHorizontal: 10.4,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: semanticColors.actionSoft,
    color: theme.colors.actionHover,
  },
  auctionBadge: {
    fontSize: 12.8,
    fontWeight: "600",
    paddingHorizontal: 10.4,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: semanticColors.actionBorder,
    backgroundColor: semanticColors.infoSoft,
    color: theme.colors.link,
  },
  total: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  itemsList: {
    marginTop: theme.spacing[2],
    gap: 4,
  },
  itemBlock: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
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
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  itemTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing[2],
  },
  itemNamePressable: {
    flex: 1,
  },
  itemLine: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
  },
  itemNameLink: {
    fontSize: 14,
    color: theme.colors.link,
    fontWeight: "600",
  },
  itemQuantity: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  itemPrice: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: "600",
  },
  itemLoyalty: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.success,
  },
  itemStatus: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  itemTimestamp: {
    marginTop: 2,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  itemActions: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  itemActionsRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  actionButton: {
    paddingVertical: 5.1,
    paddingHorizontal: 11.5,
    borderRadius: 7.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  actionButtonCancel: {
    backgroundColor: theme.colors.danger,
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 13.1,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  actionButtonTextCancel: {
    color: theme.colors.onContrast,
  },
  itemError: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.danger,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  metaValue: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.text,
  },
  buyerLink: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.link,
    fontWeight: "600",
  },
  detailsFold: {
    marginTop: theme.spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing[2],
  },
  detailsFoldSummary: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.link,
  },
  detailsFoldBody: {
    marginTop: theme.spacing[2],
    gap: 4,
  },
  itemExtras: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
    gap: 4,
  },
  itemExtrasName: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.text,
  },
  footer: {
    marginTop: theme.spacing[3],
    paddingTop: theme.spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
}));

export const useCartLineItemStyles = createThemedStyles((theme) => ({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.onContrast,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
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
  },
  stockHint: {
    fontSize: 12,
    fontWeight: "500",
    color: semanticColors.warning,
  },
  name: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
    color: theme.colors.text,
  },
  nameLink: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
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
  removeIcon: {
    color: theme.colors.textMuted,
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
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    lineHeight: 22,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 22,
    textAlign: "center",
    color: theme.colors.text,
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
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
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  hint: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
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
    fontSize: 16,
    fontWeight: "600",
  },
  loyaltyFlash: {
    marginBottom: theme.spacing[3],
    padding: theme.spacing[3],
    borderRadius: 10,
    backgroundColor: theme.colors.actionSurface,
    color: theme.colors.success,
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
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
    fontSize: 16,
    fontWeight: "600",
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
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  remove: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: 20,
  },
  removeText: {
    fontSize: 24,
    color: theme.colors.textMuted,
    lineHeight: 24,
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
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: "center",
    padding: theme.spacing[2],
  },
}));

export const useRaffleProductsPageStyles = createThemedStyles((theme) => ({
  flex: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  list: {
    padding: 6,
    flexGrow: 1,
  },
  row: {
    justifyContent: "space-between",
  },
  empty: {
    padding: theme.spacing[6],
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  footer: {
    marginVertical: theme.spacing[4],
  },
}));
