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
    fontSize: 14,
    fontWeight: "600",
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
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.button,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
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
    fontSize: 15,
    fontWeight: "600",
  },
}));
