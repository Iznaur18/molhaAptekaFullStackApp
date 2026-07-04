import {
  Platform,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from "react-native";

export const scrollTextInputIntoViewOnFocus = (
  event: NativeSyntheticEvent<TextInputFocusEventData>,
) => {
  if (Platform.OS !== "web") {
    return;
  }

  const target = event.nativeEvent.target as HTMLElement | null | undefined;
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
