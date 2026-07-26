import {
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
  listRuRegions,
  resolveViewerRegionCode,
} from "@molha/api-contract";

export const VIEWER_REGION_SESSION_STORAGE_KEY = "molha.viewerRegionCode";

/**
 * @returns {readonly import('@molha/api-contract').RuRegion[] | ReturnType<typeof listRuRegions>}
 */
export function getRuRegionOptions() {
  return listRuRegions();
}

/**
 * @param {string | null | undefined} code
 */
export function readSessionViewerRegionCode() {
  try {
    if (typeof sessionStorage === "undefined") {
      return null;
    }
    const raw = sessionStorage.getItem(VIEWER_REGION_SESSION_STORAGE_KEY);
    return isRuRegionCode(raw) ? String(raw).trim() : null;
  } catch {
    return null;
  }
}

/**
 * @param {string | null | undefined} code
 */
export function writeSessionViewerRegionCode(code) {
  try {
    if (typeof sessionStorage === "undefined") {
      return;
    }
    if (!isRuRegionCode(code)) {
      sessionStorage.removeItem(VIEWER_REGION_SESSION_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(VIEWER_REGION_SESSION_STORAGE_KEY, String(code).trim());
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Сессия → профиль → Москва.
 *
 * @param {string | null | undefined} [profileRegionCode]
 */
export function resolveClientViewerRegionCode(profileRegionCode) {
  const fromSession = readSessionViewerRegionCode();
  if (fromSession) {
    return fromSession;
  }
  return resolveViewerRegionCode(profileRegionCode ?? DEFAULT_VIEWER_REGION_CODE);
}
