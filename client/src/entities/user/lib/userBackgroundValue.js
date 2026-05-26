import { USER_PROFILE_COPY } from "../../../shared/config/appUiCopy.js";
import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  getUserBackgroundPresetById,
  isUserBackgroundPresetId,
  parseUserBackgroundPresetId,
  USER_BACKGROUND_PRESETS,
} from "../model/userBackgroundPresets.js";

/**
 * @param {unknown} value
 */
export function isHttpBackgroundImageUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * @param {string | null | undefined} stored
 * @returns {{ presetId: string; imageUrl: string }}
 */
export function parseUserBackgroundFormFields(stored) {
  const presetFromStored = parseUserBackgroundPresetId(stored);
  if (presetFromStored) {
    return {
      presetId: presetFromStored,
      imageUrl: "",
    };
  }
  if (isHttpBackgroundImageUrl(stored)) {
    return {
      presetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
      imageUrl: String(stored).trim(),
    };
  }
  return {
    presetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
    imageUrl: "",
  };
}

/**
 * @param {{ kind: 'preset'; presetId: string } | { kind: 'image'; imageUrl: string }} input
 */
export function resolveUserProfileBackground(input) {
  if (input.kind === "image") {
    const url = input.imageUrl.trim();
    if (isHttpBackgroundImageUrl(url)) {
      return { kind: "image", url };
    }
  }
  const preset =
    getUserBackgroundPresetById(input.presetId) ??
    getUserBackgroundPresetById(DEFAULT_USER_BACKGROUND_PRESET_ID);
  return { kind: "preset", color: preset?.hex ?? "#DBDBDB" };
}

/**
 * @param {import('../model/types.js').UserPublicProfile | null | undefined} user
 */
export function resolveUserProfileBackgroundFromUser(user) {
  if (!user) {
    return resolveUserProfileBackground({
      kind: "preset",
      presetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
    });
  }
  const stored = user.userBackgroundUrl;
  const presetId = parseUserBackgroundPresetId(stored);
  if (presetId) {
    return resolveUserProfileBackground({ kind: "preset", presetId });
  }
  if (isHttpBackgroundImageUrl(stored)) {
    return resolveUserProfileBackground({
      kind: "image",
      imageUrl: String(stored).trim(),
    });
  }
  return resolveUserProfileBackground({
    kind: "preset",
    presetId: DEFAULT_USER_BACKGROUND_PRESET_ID,
  });
}

/**
 * @param {'preset' | 'image' | 'admin'} mode
 * @param {{ presetId: string; imageUrl: string }} form
 */
export function serializeUserBackgroundForForm(mode, form) {
  if (mode === "admin") {
    const imageUrl = String(form.imageUrl ?? "").trim();
    if (imageUrl !== "") {
      if (!isHttpBackgroundImageUrl(imageUrl)) {
        throw new Error("Некорректный URL фона");
      }
      return imageUrl;
    }
    const presetId = String(form.presetId ?? "").trim();
    if (isUserBackgroundPresetId(presetId)) {
      return formatUserBackgroundPresetValue(presetId);
    }
    return getDefaultUserBackgroundStoredValue();
  }

  if (mode === "image") {
    const imageUrl = String(form.imageUrl ?? "").trim();
    if (!isHttpBackgroundImageUrl(imageUrl)) {
      throw new Error("Некорректный URL фона");
    }
    return imageUrl;
  }

  const presetId = String(form.presetId ?? "").trim();
  if (!isUserBackgroundPresetId(presetId)) {
    throw new Error("Выберите цвет фона");
  }
  return formatUserBackgroundPresetValue(presetId);
}

/**
 * @param {string} [stored]
 */
export function formatUserBackgroundForDisplay(stored) {
  const presetId = parseUserBackgroundPresetId(stored);
  if (presetId) {
    return getUserBackgroundPresetById(presetId)?.labelRu ?? presetId;
  }
  if (isHttpBackgroundImageUrl(stored)) {
    return USER_PROFILE_COPY.BACKGROUND_CUSTOM_IMAGE;
  }
  return "—";
}

export { USER_BACKGROUND_PRESETS };
