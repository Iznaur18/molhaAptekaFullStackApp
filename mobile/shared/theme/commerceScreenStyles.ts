import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useOrderCardStyles = createThemedStyles((theme) => ({
  card: {
    padding: 14,
    marginBottom: theme.spacing[3],
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
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
    backgroundColor: "rgba(59, 130, 246, 0.12)",
    color: "#1d4ed8",
  },
  auctionBadge: {
    fontSize: 12.8,
    fontWeight: "600",
    paddingHorizontal: 10.4,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(59, 130, 246, 0.4)",
    backgroundColor: "#e0f2fe",
    color: "#2563eb",
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
  itemsHeading: {
    marginTop: theme.spacing[2],
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  itemBlock: {
    marginTop: theme.spacing[2],
    paddingTop: theme.spacing[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
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
    marginTop: 4,
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
  actionButton: {
    paddingVertical: 5.1,
    paddingHorizontal: 11.5,
    borderRadius: 7.2,
    borderWidth: 1,
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  actionButtonCancel: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "#b42318",
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
    color: "#b42318",
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
}));

export const useCartLineItemStyles = createThemedStyles((theme) => ({
  card: {
    flexDirection: "column",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    gap: 10,
  },
  cardUpdating: {
    opacity: 0.7,
  },
  cardExcluded: {
    opacity: 0.65,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  imageWrap: {
    width: 52,
    height: 52,
    borderRadius: 6,
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
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  nameLink: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.link,
  },
  unitPrice: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  excluded: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.danger,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    paddingRight: 10,
  },
  removeIcon: {
    fontSize: 18,
    color: theme.colors.textMuted,
  },
  controlDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
    marginRight: 10,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 6,
  },
  stepButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.action,
    lineHeight: 22,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
    color: theme.colors.text,
  },
  totalWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  totalDivider: {
    width: 1,
    height: 28,
    backgroundColor: theme.colors.border,
    marginRight: 10,
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
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
