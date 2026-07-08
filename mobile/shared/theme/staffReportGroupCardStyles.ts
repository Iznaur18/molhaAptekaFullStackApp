import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useStaffReportGroupCardStyles = createThemedStyles((theme) => ({
  card: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  count: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.danger,
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  link: {
    fontSize: 14,
    color: theme.colors.link,
    textDecorationLine: "underline",
  },
  reports: {
    gap: 6,
  },
  report: {
    gap: 4,
    padding: 8,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
  },
  reportMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  reportText: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  staffLabel: {
    gap: 4,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  staffInput: {
    minHeight: 56,
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
  error: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.danger,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
  },
  actionButtonDanger: {
    borderColor: theme.colors.danger,
  },
  actionButtonDisabled: {
    opacity: 0.65,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colors.text,
  },
  actionButtonTextDanger: {
    color: theme.colors.danger,
  },
  media: {
    width: "100%",
    maxWidth: 280,
    height: 180,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceMuted,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textSecondary,
  },
}));
