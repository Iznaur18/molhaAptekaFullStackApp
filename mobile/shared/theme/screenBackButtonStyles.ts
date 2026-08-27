import { createThemedStyles } from "@/shared/theme/createThemedStyles";
import {
  SCREEN_BACK_BUTTON_EDGE,
  SCREEN_BACK_BUTTON_SIZE,
} from "@/shared/lib/screenBackButtonLayout";

export const useScreenBackButtonStyles = createThemedStyles((theme) => ({
  overlay: {
    position: "absolute",
    left: SCREEN_BACK_BUTTON_EDGE,
    zIndex: 20,
    elevation: 20,
  },
  button: {
    width: SCREEN_BACK_BUTTON_SIZE,
    height: SCREEN_BACK_BUTTON_SIZE,
    borderRadius: SCREEN_BACK_BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    shadowColor: theme.colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
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
