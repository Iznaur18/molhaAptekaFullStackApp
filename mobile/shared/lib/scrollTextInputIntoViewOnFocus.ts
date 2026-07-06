import { Platform, type FocusEvent as RNFocusEvent } from "react-native";

export const scrollTextInputIntoViewOnFocus = (event: RNFocusEvent) => {
  if (Platform.OS !== "web") {
    return;
  }

  const target = event.nativeEvent.target as unknown as HTMLElement | null | undefined;
  if (!target?.scrollIntoView) {
    return;
  }

  requestAnimationFrame(() => {
    target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  });
};

export const textInputFocusScrollProps =
  Platform.OS === "web"
    ? ({ onFocus: scrollTextInputIntoViewOnFocus } as const)
    : ({} as const);
