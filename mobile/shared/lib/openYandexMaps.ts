import {
  resolveYandexMapsOpenCandidates,
  type YandexMapsPointInput,
} from "@izibuy/shared-lib";
import { Linking } from "react-native";
import { reportClientIssue } from "@/shared/lib/reportClientIssue";

export const openYandexMapsRoute = async (
  point: YandexMapsPointInput,
): Promise<void> => {
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
    } catch (error) {
      // try next candidate
      reportClientIssue("openYandexMaps", error);
    }
  }

  const webUrl = candidates[candidates.length - 1];
  await Linking.openURL(webUrl);
};
