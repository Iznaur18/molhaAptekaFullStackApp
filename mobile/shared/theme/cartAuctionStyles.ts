import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Секция выигранных аукционных лотов в корзине — паритет web `CartAuctionSection.css`. */
export const useCartAuctionStyles = createThemedStyles((theme) => ({
  section: {
    gap: 10.4,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13.12,
    fontWeight: theme.typography.fontWeightBold,
    letterSpacing: 0.48,
    textTransform: "uppercase",
    color: theme.colors.textMuted,
  },
  sectionHint: {
    fontSize: 12.8,
    lineHeight: 17.6,
    color: theme.colors.textSecondary,
  },
  row: {
    gap: 10.4,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    borderColor: "rgba(217, 119, 6, 0.45)",
    backgroundColor: theme.colors.surface,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10.4,
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 3.2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2.4,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.warningText,
    fontSize: 11.52,
    fontWeight: theme.typography.fontWeightBold,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 14.72,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 19.2,
    color: theme.colors.ink,
  },
  meta: {
    fontSize: 12.8,
    lineHeight: 17.2,
    color: theme.colors.textMuted,
  },
  priceBox: {
    flexShrink: 0,
    alignItems: "flex-end",
    gap: 0.8,
    paddingLeft: 4,
  },
  price: {
    fontSize: 18.4,
    fontWeight: "800",
    lineHeight: 21.2,
    color: theme.colors.ink,
    fontVariant: ["tabular-nums"],
  },
  priceCaption: {
    fontSize: 11.52,
    color: theme.colors.textMuted,
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
  },
  checkoutButton: {
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.nearBlack,
  },
  removeButton: {
    flexShrink: 0,
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 6.4,
    borderRadius: 10,
  },
  removeButtonText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  error: {
    fontSize: theme.typography.fontXs,
    color: theme.colors.danger,
  },
}));
