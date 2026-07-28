import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
  resolveViewerRegionCode,
} from "@molha/api-contract";

export const VIEWER_REGION_STORAGE_KEY = "molha.viewerRegionCode";

const USE_WEB_STORAGE = Platform.OS === "web";

const webStorage = (): Storage | null => {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

/**
 * Сессионный регион просмотра.
 * Web: sessionStorage. Native: SecureStore.
 */
export async function readSessionViewerRegionCode(): Promise<string | null> {
  try {
    const raw = USE_WEB_STORAGE
      ? webStorage()?.getItem(VIEWER_REGION_STORAGE_KEY)
      : await SecureStore.getItemAsync(VIEWER_REGION_STORAGE_KEY);
    return isRuRegionCode(raw) ? String(raw).trim() : null;
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} code
 */
export async function writeSessionViewerRegionCode(
  code: string | null | undefined,
): Promise<void> {
  try {
    if (!isRuRegionCode(code)) {
      if (USE_WEB_STORAGE) {
        webStorage()?.removeItem(VIEWER_REGION_STORAGE_KEY);
      } else {
        await SecureStore.deleteItemAsync(VIEWER_REGION_STORAGE_KEY);
      }
      return;
    }
    const next = String(code).trim();
    if (USE_WEB_STORAGE) {
      webStorage()?.setItem(VIEWER_REGION_STORAGE_KEY, next);
    } else {
      await SecureStore.setItemAsync(VIEWER_REGION_STORAGE_KEY, next);
    }
  } catch {
    // storage недоступен / quota
  }
}

/**
 * Сессия → профиль → Москва.
 */
export function resolveClientViewerRegionCode(
  profileRegionCode?: string | null,
  sessionRegionCode?: string | null,
): string {
  if (sessionRegionCode && isRuRegionCode(sessionRegionCode)) {
    return sessionRegionCode;
  }
  return resolveViewerRegionCode(profileRegionCode ?? DEFAULT_VIEWER_REGION_CODE);
}
