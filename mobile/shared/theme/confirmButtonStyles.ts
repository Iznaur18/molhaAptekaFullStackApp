import { Platform, StyleSheet } from "react-native";

import { CONFIRM_POPOVER_CHROME as C } from "@/shared/lib/confirmPopoverChrome";
import { createThemedStyles } from "@/shared/theme/createThemedStyles";

/** Паритет web `ConfirmButton.css` popover. */
export const useConfirmButtonStyles = createThemedStyles((theme) => ({
  root: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  portal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.scrim,
    // BlurView снизу; этот слой даёт rgb(0 0 0 / 58%) как web.
  },
  popover: {
    width: "100%",
    maxWidth: C.maxWidth,
    gap: C.gap,
    paddingVertical: C.paddingVertical,
    paddingHorizontal: C.paddingHorizontal,
    borderRadius: C.borderRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    ...(Platform.OS === "ios" ? { borderCurve: "continuous" as const } : null),
  },
  question: {
    fontSize: 15.2,
    fontWeight: theme.typography.fontWeightSemibold,
    lineHeight: 20.5,
    color: theme.colors.text,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 8,
    width: "100%",
  },
  noButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8.8,
    paddingHorizontal: 12,
    borderRadius: C.actionsRadius,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  noButtonText: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.textMuted,
  },
  yesButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 8.8,
    paddingHorizontal: 12,
    borderRadius: C.actionsRadius,
    borderWidth: 1,
    borderColor: `${theme.colors.danger}47`,
    backgroundColor: theme.colors.dangerSurface,
    alignItems: "center",
    justifyContent: "center",
  },
  yesButtonText: {
    fontSize: 14.4,
    fontWeight: theme.typography.fontWeightSemibold,
    color: theme.colors.danger,
  },
}));
