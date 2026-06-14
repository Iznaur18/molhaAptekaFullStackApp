import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useStaffAdminStyles = createThemedStyles((theme) => ({
  list: {
    padding: theme.spacing[3],
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  root: {
    padding: theme.spacing[4],
    gap: theme.spacing[3],
    paddingBottom: theme.spacing[8],
  },
  header: {
    gap: 10,
    marginBottom: theme.spacing[2],
  },
  notice: {
    gap: 6,
    marginBottom: 4,
  },
  section: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: theme.spacing[2],
    color: theme.colors.text,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colors.text,
  },
  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    padding: 10,
    fontSize: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  toggleCreate: {
    alignSelf: "flex-start",
  },
  toggleCreateText: {
    color: theme.colors.action,
    fontWeight: "600",
  },
  panel: {
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  hint: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    padding: 10,
    fontSize: 14,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  row: {
    gap: 6,
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  path: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  token: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
  },
  badge: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  pickerChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 14,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 4,
    maxWidth: "100%",
  },
  pickerChipSelected: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.actionSurface,
  },
  pickerChipText: {
    fontSize: 11,
    color: theme.colors.text,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginTop: 4,
  },
  actionsStretch: {
    flexDirection: "row",
    gap: 10,
    marginTop: theme.spacing[2],
  },
  primaryButton: {
    backgroundColor: theme.colors.nearBlack,
    borderRadius: theme.radius.button,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonFlex: {
    flex: 1,
    backgroundColor: theme.colors.nearBlack,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  primaryButtonText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    alignItems: "center",
  },
  secondaryButtonFlex: {
    flex: 1,
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
    color: theme.colors.text,
  },
  ghostButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[2],
  },
  deleteButton: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.button,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  deleteButtonCompact: {
    backgroundColor: theme.colors.danger,
    borderRadius: theme.radius.button,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: theme.colors.onContrast,
    fontWeight: "600",
  },
  deleteTextSmall: {
    color: theme.colors.onContrast,
    fontWeight: "600",
    fontSize: 12,
  },
  orderButton: {
    backgroundColor: theme.colors.surfaceMuted,
    borderRadius: theme.radius.button,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: theme.colors.danger,
    fontSize: 13,
  },
  success: {
    color: theme.colors.success,
  },
  link: {
    color: theme.colors.link,
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: theme.colors.textMuted,
    padding: theme.spacing[6],
  },
  card: {
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceMuted,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  productId: {
    fontSize: 12,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing[2],
  },
  removeText: {
    color: theme.colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyList: {
    fontSize: 13,
    color: theme.colors.textMuted,
    fontStyle: "italic",
  },
}));
