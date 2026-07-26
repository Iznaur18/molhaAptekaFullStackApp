import {
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
  resolveViewerRegionCode,
} from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * Регион зрителя: query.regionCode (сессия) → профиль → Москва.
 *
 * @param {{
 *   userId?: string | null;
 *   queryRegionCode?: string | null;
 * }} input
 */
export async function resolveViewerRegionCodeForRequest({
  userId,
  queryRegionCode,
} = {}) {
  const fromQuery = String(queryRegionCode ?? "").trim();
  if (isRuRegionCode(fromQuery)) {
    return fromQuery;
  }

  if (userId != null && String(userId).trim() !== "") {
    try {
      const user = await UserModel.findById(String(userId))
        .select("userRegionCode")
        .lean();
      const fromProfile = String(user?.userRegionCode ?? "").trim();
      if (isRuRegionCode(fromProfile)) {
        return fromProfile;
      }
    } catch {
      return DEFAULT_VIEWER_REGION_CODE;
    }
  }

  return resolveViewerRegionCode(null);
}

/**
 * @param {string} regionCode
 */
export function buildProductRegionMatch(regionCode) {
  const code = resolveViewerRegionCode(regionCode);
  return { productRegionCode: code };
}

/**
 * @param {string} regionCode
 * @param {string} [fieldName]
 */
export function buildEntityRegionMatch(regionCode, fieldName = "regionCode") {
  const code = resolveViewerRegionCode(regionCode);
  return { [fieldName]: code };
}
