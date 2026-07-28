import { resolveYandexMapsOpenCandidates, type YandexMapsPointInput } from "@izibuy/shared-lib";
import { Linking } from "react-native";

export const openYandexMapsRoute = async (point: YandexMapsPointInput): Promise<void> => {
  const candidates = resolveYandexMapsOpenCandidates(point);
  if (candidates.length === 0) {
    return;
  }

  for (const url of candidates) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // try next candidate
    }
  }

  const webUrl = candidates[candidates.length - 1];
  await Linking.openURL(webUrl);
};
