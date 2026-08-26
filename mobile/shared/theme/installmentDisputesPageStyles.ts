import { StyleSheet } from "react-native";

import { MY_SALES_PAGE_LAYOUT as L } from "@/shared/lib/guestProfileLayout";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;

export const useInstallmentDisputesPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
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
    fontWeight: "600",
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
    lineHeight: 22,
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
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
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
    fontWeight: "600",
    color: theme.colors.text,
  },
  cardMeta: {
    fontSize: 13.6,
    lineHeight: 20,
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
    fontWeight: "600",
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
    fontSize: 15,
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
    fontSize: 15,
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
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  actionSecondaryText: {
    fontSize: 13.6,
    fontWeight: "500",
    color: theme.colors.text,
  },
}));
