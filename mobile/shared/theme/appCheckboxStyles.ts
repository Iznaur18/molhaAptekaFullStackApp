import { Platform } from "react-native";

import { createThemedStyles } from "@/shared/theme/createThemedStyles";

export const APP_CHECKBOX_SIZE = 24;

export const useAppCheckboxStyles = createThemedStyles((theme) => ({
  box: {
    width: APP_CHECKBOX_SIZE,
    height: APP_CHECKBOX_SIZE,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  boxChecked: {
    borderColor: theme.colors.action,
    backgroundColor: theme.colors.action,
  },
  boxDisabled: {
    opacity: 0.4,
  },
}));
