import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useUsersSearchInputStyles = createThemedStyles((theme) => ({
  root: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  field: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.button,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 10,
    paddingRight: 72,
    fontSize: theme.typography.fontLg,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.text,
  },
  clearButton: {
    position: "absolute",
    right: 36,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  clearText: {
    fontSize: theme.typography.font3xl,
    lineHeight: theme.typography.leadingLg,
    color: theme.colors.textMuted,
  },
  spinner: {
    position: "absolute",
    right: 10,
    width: 20,
    height: 20,
  },
}));
