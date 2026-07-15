import { useEffect, useState } from "react";
import { Platform } from "react-native";

/** Bottom inset covered by the soft keyboard on RN-web (visualViewport). */
export const useVisualViewportKeyboardBottomInset = (): number => {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      return undefined;
    }

    const visualViewport = window.visualViewport;
    if (!visualViewport) {
      return undefined;
    }

    const updateInset = () => {
      const covered = Math.max(
        0,
        Math.round(window.innerHeight - visualViewport.height - visualViewport.offsetTop),
      );
      setBottomInset(covered);
    };

    updateInset();
    visualViewport.addEventListener("resize", updateInset);
    visualViewport.addEventListener("scroll", updateInset);
    window.addEventListener("resize", updateInset);

    return () => {
      visualViewport.removeEventListener("resize", updateInset);
      visualViewport.removeEventListener("scroll", updateInset);
      window.removeEventListener("resize", updateInset);
    };
  }, []);

  return bottomInset;
};
