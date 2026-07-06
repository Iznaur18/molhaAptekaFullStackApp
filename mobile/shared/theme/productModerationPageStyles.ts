import { StyleSheet } from "react-native";

import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

const DANGER_STRONG = "#b42318";
const NEUTRAL_GRAY_DEEP = "#4b5563";

export const useProductModerationPageStyles = createThemedStyles((theme) => ({
  container: {
    flex: 1,
    minHeight: 0,
    backgroundColor: theme.colors.bg,
  },
  list: {
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    paddingTop: 12,
  },
  header: {
    marginBottom: 4,
    alignSelf: "stretch",
  },
  state: {
    marginBottom: 16,
    fontSize: 15.2,
    lineHeight: 22,
    color: NEUTRAL_GRAY_DEEP,
  },
  stateError: {
    color: DANGER_STRONG,
  },
  empty: {
    fontSize: 15.2,
    lineHeight: 22,
    color: NEUTRAL_GRAY_DEEP,
    textAlign: "center",
    paddingVertical: 8,
  },
  idleShell: {
    flex: 1,
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
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
    paddingHorizontal: SCREEN_CONTENT_PADDING_HORIZONTAL,
    backgroundColor: theme.colors.bg,
  },
}));
