import { isDisplayableMediaUrl } from "@/shared/lib/resolveMediaUrl";
import { normalizeUploadUrlForStorage } from "@/shared/lib";

import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  getUserBackgroundPresetById,
  isUserBackgroundPresetId,
  parseUserBackgroundPresetId,
} from "../model/userBackgroundPresets";

export type BackgroundFormFields = {
  presetId: string;
  imageUrl: string;
};

export const parseUserBackgroundFormFields = (
  stored: string | null | undefined,
): BackgroundFormFields => {
  const presetFromStored = parseUserBackgroundPresetId(stored);
  if (presetFromStored) {
    return { presetId: presetFromStored, imageUrl: "" };
  }
  if (isDisplayableMediaUrl(stored)) {
    return { presetId: DEFAULT_USER_BACKGROUND_PRESET_ID, imageUrl: String(stored).trim() };
  }
  return { presetId: DEFAULT_USER_BACKGROUND_PRESET_ID, imageUrl: "" };
};

export type BackgroundMode = "preset" | "image";

export const resolveBackgroundModeFromUser = (
  stored: string | null | undefined,
): BackgroundMode => {
  if (parseUserBackgroundPresetId(stored)) {
    return "preset";
  }
  if (isDisplayableMediaUrl(stored)) {
    return "image";
  }
  return "preset";
};

export const serializeUserBackground = (
  mode: BackgroundMode,
  form: BackgroundFormFields,
): string => {
  if (mode === "image") {
    const imageUrl = normalizeUploadUrlForStorage(form.imageUrl.trim());
    if (!imageUrl) {
      throw new Error("Выберите изображение для фона");
    }
    return imageUrl;
  }
  const presetId = form.presetId.trim();
  if (!isUserBackgroundPresetId(presetId)) {
    return getDefaultUserBackgroundStoredValue();
  }
  return formatUserBackgroundPresetValue(presetId);
};

export const resolveBackgroundForPreview = (
  mode: BackgroundMode,
  form: BackgroundFormFields,
): { kind: "preset"; color: string } | { kind: "image"; imageUrl: string } => {
  if (mode === "image" && form.imageUrl) {
    return { kind: "image", imageUrl: form.imageUrl };
  }
  const preset =
    getUserBackgroundPresetById(form.presetId) ??
    getUserBackgroundPresetById(DEFAULT_USER_BACKGROUND_PRESET_ID);
  return { kind: "preset", color: preset?.hex ?? "#DBDBDB" };
};
