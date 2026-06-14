import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  getUserBackgroundPresetById,
  parseUserBackgroundPresetId,
} from "@/entities/user/model/userBackgroundPresets";
import { isDisplayableMediaUrl, resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export type UserProfileBackground =
  | { kind: "preset"; color: string }
  | { kind: "image"; url: string };

export const resolveUserProfileBackgroundFromUser = (
  user: unknown,
): UserProfileBackground => {
  if (!user || typeof user !== "object") {
    const preset = getUserBackgroundPresetById(DEFAULT_USER_BACKGROUND_PRESET_ID);
    return { kind: "preset", color: preset?.hex ?? "#DBDBDB" };
  }

  const stored = (user as { userBackgroundUrl?: string }).userBackgroundUrl;
  const presetId = parseUserBackgroundPresetId(stored);
  if (presetId) {
    const preset = getUserBackgroundPresetById(presetId);
    return { kind: "preset", color: preset?.hex ?? "#DBDBDB" };
  }

  const imageUrl = String(stored ?? "").trim();
  if (imageUrl && isDisplayableMediaUrl(imageUrl)) {
    return { kind: "image", url: resolveUploadedMediaUrl(imageUrl) };
  }

  const preset = getUserBackgroundPresetById(DEFAULT_USER_BACKGROUND_PRESET_ID);
  return { kind: "preset", color: preset?.hex ?? "#DBDBDB" };
};
