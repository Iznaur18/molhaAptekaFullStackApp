import {
  DEFAULT_USER_BACKGROUND_PRESET_ID,
  formatUserBackgroundPresetValue,
  getDefaultUserBackgroundStoredValue,
  getUserBackgroundPresetById,
  isUserBackgroundPresetId,
  parseUserBackgroundPresetId,
} from "../constants/userBackgroundPresets.js";
import { normalizeStoredUploadUrl } from "./buildPublicUploadUrl.js";
import { isStoredBackgroundImageUrl } from "./isStoredBackgroundImageUrl.js";

/**
 * @param {unknown} value
 */
export function isHttpBackgroundImageUrl(value) {
  return isStoredBackgroundImageUrl(value);
}

/**
 * @param {unknown} stored
 * @param {{ isPremiumUser?: boolean; isAdminEditor?: boolean }} ctx
 * @returns {string}
 */
export function normalizeUserBackgroundForSave(stored, ctx) {
  const raw = stored == null ? "" : String(stored).trim();
  const { isPremiumUser = false, isAdminEditor = false } = ctx;

  if (raw === "") {
    if (isPremiumUser && !isAdminEditor) {
      throw new Error("Укажите URL фона");
    }
    return getDefaultUserBackgroundStoredValue();
  }

  const presetId = parseUserBackgroundPresetId(raw);
  if (presetId) {
    return formatUserBackgroundPresetValue(presetId);
  }

  if (!isStoredBackgroundImageUrl(raw)) {
    throw new Error("URL фона: http(s):// или /uploads/...");
  }

  if (!isPremiumUser && !isAdminEditor) {
    throw new Error("Обычным пользователям доступны только цветовые пресеты фона");
  }

  return normalizeStoredUploadUrl(raw);
}

/**
 * Админ: URL в приоритете, иначе пресет.
 *
 * @param {{ presetId?: string; imageUrl?: string }} input
 */
export function resolveAdminUserBackgroundForSave(input) {
  const imageUrl = String(input.imageUrl ?? "").trim();
  if (imageUrl !== "") {
    if (!isStoredBackgroundImageUrl(imageUrl)) {
      throw new Error("URL фона: http(s):// или /uploads/...");
    }
    return normalizeStoredUploadUrl(imageUrl);
  }

  const presetId = String(input.presetId ?? "").trim();
  if (isUserBackgroundPresetId(presetId)) {
    return formatUserBackgroundPresetValue(presetId);
  }

  return getDefaultUserBackgroundStoredValue();
}

/**
 * @param {boolean} wasPremium
 * @param {boolean} nextPremium
 * @param {string} [currentStored]
 */
export function backgroundValueAfterPremiumChange(
  wasPremium,
  nextPremium,
  currentStored,
) {
  if (wasPremium && !nextPremium) {
    return getDefaultUserBackgroundStoredValue();
  }
  if (typeof currentStored === "string" && currentStored.trim() !== "") {
    return currentStored.trim();
  }
  return getDefaultUserBackgroundStoredValue();
}

/**
 * @param {string} [stored]
 */
export function presetLabelForStoredBackground(stored) {
  const id = parseUserBackgroundPresetId(stored);
  if (!id) {
    return null;
  }
  return getUserBackgroundPresetById(id)?.labelRu ?? id;
}

export { DEFAULT_USER_BACKGROUND_PRESET_ID };
