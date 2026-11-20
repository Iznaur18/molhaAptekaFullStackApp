import { StyleSheet } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const useProductModerationPageStyles = createThemedStyles((theme, layout) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  list: {
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
  },
  listInAccountShell: {
    paddingHorizontal: 0,
  },
  header: {
    marginBottom: 4,
    alignSelf: "stretch",
  },
  state: {
    marginBottom: 16,
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  stateError: {
    color: theme.colors.danger,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingVertical: 8,
  },
  idleShell: {
    flex: 1,
    paddingHorizontal: layout.contentPaddingHorizontal,
    paddingTop: 12,
    backgroundColor: theme.colors.bg,
  },
  idleMessageWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: layout.contentPaddingHorizontal,
    backgroundColor: theme.colors.bg,
  },
}));
