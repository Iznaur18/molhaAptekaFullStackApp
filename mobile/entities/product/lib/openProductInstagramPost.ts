import { Linking } from "react-native";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";

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
  } catch (error) {
    // ignore — нет fallback UI на карточке
    reportClientIssue("openProductInstagramPost", error);
  }
}
