import {
  DEFAULT_VIEWER_REGION_CODE,
  isRuRegionCode,
  resolveViewerRegionCode,
} from "@molha/api-contract";

import { UserModel } from "../../models/index.js";

/**
 * Дефолтный приоритет регионов каталога (после выбранного зрителем).
 * @type {readonly string[]}
 */
export const CATALOG_DEFAULT_REGION_PRIORITY_CODES = Object.freeze([
  "RU-MOW",
  "RU-SPE",
  "RU-KDA",
]);

/** Прочие валидные регионы — после топа, равны между собой. */
export const CATALOG_REGION_SORT_OTHER = 1000;

/** Пустой / отсутствующий productRegionCode — в конец. */
export const CATALOG_REGION_SORT_EMPTY = 9999;

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
 * Порядок приоритета: выбранный регион → MOW → SPE → KDA (без дублей).
 *
 * @param {string | null | undefined} viewerRegionCode
 * @returns {string[]}
 */
export function buildCatalogRegionPriorityCodes(viewerRegionCode) {
  const viewer = resolveViewerRegionCode(viewerRegionCode);
  const rest = CATALOG_DEFAULT_REGION_PRIORITY_CODES.filter((code) => code !== viewer);
  return [viewer, ...rest];
}

/**
 * `$addFields._regionSortPriority` для сортировки каталога (меньше = выше).
 *
 * @param {string | null | undefined} viewerRegionCode
 */
export function buildCatalogRegionSortPriorityStage(viewerRegionCode) {
  const ordered = buildCatalogRegionPriorityCodes(viewerRegionCode);
  return {
    $addFields: {
      _regionSortPriority: {
        $switch: {
          branches: [
            ...ordered.map((code, index) => ({
              case: { $eq: ["$productRegionCode", code] },
              then: index,
            })),
            {
              case: {
                $eq: [{ $ifNull: ["$productRegionCode", ""] }, ""],
              },
              then: CATALOG_REGION_SORT_EMPTY,
            },
          ],
          default: CATALOG_REGION_SORT_OTHER,
        },
      },
    },
  };
}

/**
 * Вставляет region-priority stage и ключ `_regionSortPriority` первым в каждый `$sort`.
 *
 * @param {Record<string, unknown> | Record<string, unknown>[]} sortStages
 * @param {string | null | undefined} viewerRegionCode
 * @returns {Record<string, unknown>[]}
 */
export function withCatalogRegionPrioritySort(sortStages, viewerRegionCode) {
  const list = Array.isArray(sortStages) ? sortStages : [sortStages];
  if (viewerRegionCode == null || String(viewerRegionCode).trim() === "") {
    return list;
  }

  const regionStage = buildCatalogRegionSortPriorityStage(viewerRegionCode);
  return [
    regionStage,
    ...list.map((stage) => {
      if (stage && typeof stage === "object" && stage.$sort) {
        return {
          $sort: {
            _regionSortPriority: 1,
            ...stage.$sort,
          },
        };
      }
      return stage;
    }),
  ];
}

/**
 * Точный match по региону (curated / entity ads — не публичный каталог).
 *
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
