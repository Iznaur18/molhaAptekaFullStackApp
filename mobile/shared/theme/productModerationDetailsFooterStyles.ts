import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useProductModerationDetailsFooterStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
  },
  rootCompact: {
    gap: 8,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.danger,
  },
  rejectLabel: {
    gap: 5.6,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  rejectInputCompact: {
    minHeight: 40,
    paddingVertical: 6,
    fontSize: 14,
  },
  rejectInput: {
    minHeight: 72,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionsCompact: {
    flexWrap: "nowrap",
    gap: 8,
  },
  approveButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.successText,
    backgroundColor: theme.colors.successText,
  },
  rejectButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
  },
  approveButtonCompact: {
    flex: 1,
    alignItems: "center",
  },
  rejectButtonCompact: {
    flex: 1,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  approveText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.onContrast,
  },
  rejectText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.danger,
  },
  deleteButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
  },
  deleteButtonCompact: {
    flex: 1,
    alignItems: "center",
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.danger,
  },
  openSalesHint: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.textSecondary,
  },
  deleteConfirm: {
    gap: 8,
  },
  deleteConfirmQuestion: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.text,
  },
}));
