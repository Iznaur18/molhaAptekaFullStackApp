import { Linking } from "react-native";

export async function openProductInstagramPost(postUrl: string) {
  const url = String(postUrl ?? "").trim();
  if (!url) {
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch {
    // ignore — нет fallback UI на карточке
  }
}
