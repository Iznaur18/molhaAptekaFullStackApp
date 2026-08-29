import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_BACK_BUTTON_LEFT_INSET,
  SCREEN_BACK_BUTTON_RADIUS,
  SCREEN_BACK_BUTTON_SIZE,
  SCREEN_BACK_BUTTON_TOP_INSET,
} from "@/shared/lib/screenBackButtonLayout";

/** Паритет `client/pages/auth/ui/AuthPage.css` → `.auth-page__back`. */
export const useScreenBackButtonStyles = createThemedStyles((theme) => ({
  overlay: {
    position: "absolute",
    zIndex: 10,
    elevation: 10,
  },
  button: {
    width: SCREEN_BACK_BUTTON_SIZE,
    height: SCREEN_BACK_BUTTON_SIZE,
    borderRadius: SCREEN_BACK_BUTTON_RADIUS,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonInline: {
    width: SCREEN_BACK_BUTTON_SIZE,
    height: SCREEN_BACK_BUTTON_SIZE,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    marginLeft: -6,
  },
}));

export const useScreenWithBackStyles = createThemedStyles((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  },
}));

export const SCREEN_BACK_BUTTON_LAYOUT = {
  size: SCREEN_BACK_BUTTON_SIZE,
  topInset: SCREEN_BACK_BUTTON_TOP_INSET,
  leftInset: SCREEN_BACK_BUTTON_LEFT_INSET,
  radius: SCREEN_BACK_BUTTON_RADIUS,
} as const;
