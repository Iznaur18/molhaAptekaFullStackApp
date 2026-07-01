import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const DANGER_STRONG = "#b42318";
const SUCCESS_STRONG = "#047857";

export const useProductModerationDetailsFooterStyles = createThemedStyles((theme) => ({
  root: {
    gap: 12,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: DANGER_STRONG,
  },
  rejectLabel: {
    gap: 5.6,
    fontSize: 14,
    color: theme.colors.textSecondary,
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
  approveButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: SUCCESS_STRONG,
    backgroundColor: SUCCESS_STRONG,
  },
  rejectButton: {
    paddingVertical: 7.2,
    paddingHorizontal: 13.6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DANGER_STRONG,
    backgroundColor: theme.colors.surface,
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
    color: DANGER_STRONG,
  },
}));
