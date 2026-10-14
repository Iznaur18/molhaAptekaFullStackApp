import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useCartFulfillmentSectionStyles = createThemedStyles((theme) => ({
  section: {
    marginBottom: 16,
  },
  header: {
    gap: 6,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.7,
    lineHeight: 26,
    color: theme.colors.ink,
    paddingLeft: 12,
    borderLeftWidth: 3.5,
    borderLeftColor: theme.colors.action,
  },
  hint: {
    alignSelf: "flex-start",
    marginLeft: 12,
    paddingVertical: 3.5,
    paddingHorizontal: 10,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.1,
    lineHeight: 14,
    color: theme.colors.textSecondary,
    backgroundColor: `${theme.colors.ink}0F`,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${theme.colors.ink}14`,
    overflow: "hidden",
  },
  // Web: `.cart-seller-row__note` — предупреждение о разных службах.
  note: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: 10,
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 17.5,
    overflow: "hidden",
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
  deliveryFeeValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: theme.colors.success,
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

/** Паритет с web `CartSellerList.css`: продавцы блоками (аватар + ник). */
/**
 * Паритет web `CartSellerList.css` `@media (max-width: 480px)`: на узком экране
 * кнопка с суммой уходит под имя продавца на всю ширину — иначе имя режется
 * до трёх-четырёх букв.
 */
export const CART_SELLER_ROW_STACK_MAX_WIDTH = 480;

export const useCartSellerListStyles = createThemedStyles((theme) => ({
  list: {
    gap: 8,
    marginHorizontal: 12,
    marginBottom: 16,
  },
  row: {
    gap: 10,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    padding: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  body: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  meta: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  topStacked: {
    flexWrap: "wrap",
  },
  checkout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.colors.accent,
  },
  checkoutStacked: {
    width: "100%",
  },
  checkoutPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.onContrast,
    fontVariant: ["tabular-nums"],
  },
  checkoutLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  checkoutLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.onContrast,
  },
  thumbs: {
    borderWidth: 1,
    borderColor: `${theme.colors.ink}1A`,
    borderRadius: 12,
    backgroundColor: `${theme.colors.ink}06`,
  },
  thumbsContent: {
    gap: 8,
    padding: 8,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: "hidden",
  },
  note: {
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: theme.colors.warning,
    borderRadius: 10,
    backgroundColor: theme.colors.warningSurface,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 17.5,
    overflow: "hidden",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginHorizontal: 12,
    marginBottom: 10,
    paddingVertical: 6,
    paddingRight: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
}));
