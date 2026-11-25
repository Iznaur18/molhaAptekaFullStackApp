import { StyleSheet } from "react-native";

import { MY_SALES_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;

export const useInstallmentDisputesPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: layout.pageBackground,
  },
  scroll: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    gap: L.stackGap,
  },
  scrollInAccountShell: {
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  header: {
    gap: 13.6,
  },
  toolbar: {
    gap: TOOLBAR_GAP,
    paddingVertical: TOOLBAR_PADDING_VERTICAL,
    paddingHorizontal: TOOLBAR_PADDING_HORIZONTAL,
    borderRadius: TOOLBAR_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(79, 70, 229, 0.28)",
    backgroundColor: theme.colors.actionSoft,
  },
  toolbarHead: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
  },
  toolbarHeading: {
    flex: 1,
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  disputesCount: {
    fontSize: 13.6,
    color: theme.colors.textMuted,
  },
  list: {
    gap: 12,
  },
  state: {
    fontSize: 15.2,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textSecondary,
  },
  stateError: {
    color: theme.colors.danger,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: layout.pageBackground,
  },
  card: {
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${theme.colors.action}33`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.action,
    backgroundColor: theme.colors.surface,
  },
  cardTitle: {
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.text,
  },
  cardMeta: {
    fontSize: 13.6,
    lineHeight: theme.typography.leadingBase,
    color: theme.colors.textSecondary,
  },
  partyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
  },
  partyLabel: {
    fontSize: 13.6,
    color: theme.colors.textSecondary,
  },
  partyLink: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  fieldLabel: {
    gap: 4,
    fontSize: 13.6,
    color: theme.colors.textSecondary,
  },
  textarea: {
    minHeight: 44,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
    textAlignVertical: "top",
  },
  amountInput: {
    minHeight: 40,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: theme.typography.fontMd,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceMuted,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  actionPrimary: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.action,
  },
  actionSecondary: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  actionCancel: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.danger,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionPrimaryText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.onContrast,
  },
  actionSecondaryText: {
    fontSize: 13.6,
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.text,
  },
}));
