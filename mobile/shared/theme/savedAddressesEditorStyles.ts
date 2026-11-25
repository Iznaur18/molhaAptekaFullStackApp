import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/**
 * Редактор книги адресов в профиле.
 * Геометрия снята с `client/.../UserSavedAddressesEditor.css`.
 */
export const useSavedAddressesEditorStyles = createThemedStyles((theme) => ({
  root: {
    gap: 10,
  },
  list: {
    gap: 10,
  },
  defaultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 14,
    marginTop: 2,
  },
  action: {
    paddingVertical: 4,
  },
  actionDisabled: {
    opacity: 0.55,
  },
  actionText: {
    fontSize: theme.typography.fontBase,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  editor: {
    gap: 10,
    padding: theme.spacing[3],
    borderRadius: theme.radius.input,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.actionBorder,
    backgroundColor: theme.colors.surfaceElevated,
  },
  editorActions: {
    flexDirection: "row",
    gap: 10,
  },
  error: {
    fontSize: theme.typography.fontSm,
    lineHeight: theme.typography.leadingSm,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
  },
  primaryButtonText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: theme.typography.fontMd,
    fontWeight: theme.typography.fontWeightSemibold,
  },
}));
