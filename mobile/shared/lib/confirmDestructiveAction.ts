import { Alert, Platform } from "react-native";

type ConfirmDestructiveActionParams = {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

/** RN `Alert.alert` на web — no-op; на web используем `window.confirm`. */
export const confirmDestructiveAction = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmDestructiveActionParams): void => {
  if (Platform.OS === "web") {
    const prompt = [title, message].filter(Boolean).join("\n\n");
    if (typeof window !== "undefined" && window.confirm(prompt)) {
      onConfirm();
    }
    return;
  }

  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    {
      text: confirmLabel,
      style: "destructive",
      onPress: onConfirm,
    },
  ]);
};
