import { Platform, type AccessibilityRole } from "react-native";

type DialogAccessibilityProps = {
  accessibilityRole?: AccessibilityRole;
  accessibilityViewIsModal?: boolean;
};

/**
 * `accessibilityRole="dialog"` валиден на web/iOS, но RCTView на Android
 * падает: Invalid accessibility role value: dialog.
 */
export const resolveDialogAccessibilityProps = (): DialogAccessibilityProps => {
  if (Platform.OS === "android") {
    return { accessibilityViewIsModal: true };
  }
  // "dialog" валиден на web/iOS в рантайме, но отсутствует в RN-типе AccessibilityRole.
  return { accessibilityRole: "dialog" as AccessibilityRole };
};
