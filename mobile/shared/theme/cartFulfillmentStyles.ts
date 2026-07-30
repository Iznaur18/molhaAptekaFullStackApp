import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCartFulfillmentSectionStyles = createThemedStyles((theme) => ({
  section: {
    marginBottom: 16,
  },
  header: {
    gap: 2,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  dock: {
    gap: 10,
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderColor: `${theme.colors.ink}14`,
    backgroundColor: theme.colors.surfaceElevated,
  },
  dockTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  totalBlock: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    width: "100%",
    minHeight: 20,
  },
  totalLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: theme.colors.textMuted,
  },
  payableLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "700",
    color: theme.colors.ink,
  },
  discountLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: theme.colors.textMuted,
  },
  discountValue: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "600",
    color: theme.colors.danger,
    textAlign: "right",
  },
  listPrice: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: theme.colors.text,
    textAlign: "right",
  },
  totalValue: {
    flexShrink: 0,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: theme.colors.ink,
    textAlign: "right",
  },
  itemsCount: {
    flexShrink: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: theme.colors.textSecondary,
  },
  checkoutHint: {
    fontSize: 13,
    color: theme.colors.danger,
    textAlign: "center",
  },
  checkoutButton: {
    marginTop: 4,
  },
  checkoutLegal: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
    color: theme.colors.textMuted,
  },
  checkoutLegalLink: {
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
}));
