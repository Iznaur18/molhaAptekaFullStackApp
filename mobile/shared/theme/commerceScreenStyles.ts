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
  status: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.surfaceMuted,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
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
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.radius.button,
    backgroundColor: theme.colors.nearBlack,
  },
  actionButtonCancel: {
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.onContrast,
  },
  actionButtonTextCancel: {
    color: theme.colors.danger,
  },
  itemError: {
    marginTop: 6,
    fontSize: 12,
    color: theme.colors.danger,
  },
}));

export const useCartLineItemStyles = createThemedStyles((theme) => ({
  row: {
    flexDirection: "row",
    paddingVertical: theme.spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing[3],
  },
  rowUpdating: {
    opacity: 0.7,
  },
  rowExcluded: {
    opacity: 0.65,
  },
  imageWrap: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.button,
    overflow: "hidden",
    backgroundColor: theme.colors.surfaceMuted,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
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
  stepper: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDisabled: {
    opacity: 0.4,
  },
  stepButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  quantity: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
    color: theme.colors.text,
  },
  actions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  remove: {
    fontSize: 18,
    color: theme.colors.textMuted,
    padding: 4,
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
