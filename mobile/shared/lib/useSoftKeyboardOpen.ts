import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

import { useVisualViewportKeyboardBottomInset } from "@/shared/lib/useVisualViewportKeyboardBottomInset";

/**
 * Soft keyboard open — паритет web `:root.app-soft-keyboard-open`
 * (`enableSoftKeyboardOpenClass.js` → прячет `.mobile-bottom-nav`).
 */
export const useSoftKeyboardOpen = (): boolean => {
  const [nativeOpen, setNativeOpen] = useState(false);
  const webViewportInset = useVisualViewportKeyboardBottomInset();

  useEffect(() => {
    if (Platform.OS === "web") {
      return undefined;
    }

    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => setNativeOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setNativeOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  if (Platform.OS === "web") {
    return webViewportInset > 0;
  }

  return nativeOpen;
};
