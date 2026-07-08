import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const TOOLBAR_PADDING_VERTICAL = 10.4;
const TOOLBAR_PADDING_HORIZONTAL = 12;
const TOOLBAR_RADIUS = 10.4;
const TOOLBAR_GAP = 8;

export const useInstallmentModerationPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  scroll: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
    gap: 12,
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
  programsCount: {
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
  sellerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 2,
  },
  sellerLabel: {
    fontSize: 13.6,
    color: theme.colors.textSecondary,
  },
  sellerLink: {
    fontSize: 13.6,
    fontWeight: "600",
    color: theme.colors.action,
    textDecorationLine: "underline",
  },
  plans: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  planPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: `${theme.colors.action}14`,
  },
  planPillText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.action,
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
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  actionApprove: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.success,
  },
  actionReject: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
  },
  actionDisabled: {
    opacity: 0.6,
  },
  actionApproveText: {
    fontSize: 13.6,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  actionRejectText: {
    fontSize: 13.6,
    fontWeight: "500",
    color: theme.colors.danger,
  },
}));
