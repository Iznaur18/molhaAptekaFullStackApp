import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Секция выигранных аукционных лотов в корзине. */
export const useCartAuctionStyles = createThemedStyles((theme) => ({
  section: {
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    borderColor: theme.colors.warning,
    backgroundColor: theme.colors.warningSurface,
  },
  sectionTitle: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightBold,
    color: theme.colors.ink,
  },
  sectionHint: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textSecondary,
  },
  row: {
    gap: 10,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  head: {
    flexDirection: "row",
    gap: 10,
  },
  main: {
    flex: 1,
    gap: 3,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: theme.colors.warning,
    color: theme.colors.onContrast,
    fontSize: 10,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
  },
  title: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.ink,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  priceLabel: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: theme.typography.fontLg,
    fontWeight: "800",
    color: theme.colors.ink,
  },
  meta: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  checkoutButton: {
    flex: 1,
  },
  removeButton: {
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    borderColor: theme.colors.border,
  },
  removeButtonText: {
    fontSize: theme.typography.fontSm,
    color: theme.colors.danger,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.danger,
  },
}));
