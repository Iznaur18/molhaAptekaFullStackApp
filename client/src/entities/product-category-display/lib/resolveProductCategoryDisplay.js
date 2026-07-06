import {
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL_RU,
} from "../../product/model/productConstants.js";

/** SVG data-uri — нейтральная иконка категории до кастома admin. */
export const PRODUCT_CATEGORY_DISPLAY_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' fill='none'%3E%3Crect width='64' height='64' rx='12' fill='%23eef2ff'/%3E%3Cpath d='M20 42V26l12-8 12 8v16' stroke='%236366f1' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

/**
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {Map<string, import('./types.js').ProductCategoryDisplayFromApi>}
 */
export function mapCategoryDisplaysBySlug(displays) {
  return new Map(
    displays
      .filter(
        (row) => typeof row.categorySlug === "string" && row.categorySlug.trim().length > 0,
      )
      .map((row) => [row.categorySlug, row]),
  );
}

/**
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {Map<string, import('./types.js').ProductCategoryDisplayFromApi>}
 */
export function mapCategoryDisplaysById(displays) {
  /** @type {Map<string, import('./types.js').ProductCategoryDisplayFromApi>} */
  const map = new Map();

  for (const row of displays) {
    if (typeof row.categoryId === "string" && row.categoryId.trim()) {
      map.set(row.categoryId.trim(), row);
    }
  }

  return map;
}

/**
 * @param {string} categorySlug
 * @param {Map<string, import('./types.js').ProductCategoryDisplayFromApi>} overridesBySlug
 * @param {Map<string, import('./types.js').ProductCategoryDisplayFromApi>} overridesById
 * @param {string | null} categoryId
 * @param {string} fallbackLabel
 */
function resolveCatalogCategoryDisplayFields(
  categorySlug,
  overridesBySlug,
  overridesById,
  categoryId,
  fallbackLabel,
  legacySlug = null,
) {
  const overrideById = categoryId ? overridesById.get(categoryId) : undefined;
  const overrideBySlug =
    overridesBySlug.get(categorySlug) ??
    (legacySlug && legacySlug !== categorySlug
      ? overridesBySlug.get(legacySlug)
      : undefined);
  const override = overrideById ?? overrideBySlug;
  const customLabel =
    typeof override?.customLabel === "string" && override.customLabel.trim()
      ? override.customLabel.trim()
      : null;
  const customImage =
    typeof override?.imageUrl === "string" && override.imageUrl.trim()
      ? override.imageUrl.trim()
      : null;

  return {
    label: customLabel ?? fallbackLabel,
    imageUrl: customImage,
    isCustomLabel: customLabel != null,
    isCustomImage: customImage != null,
  };
}

/**
 * @param {import('../../product/model/types.js').ProductCategory} categorySlug
 * @param {Map<import('../../product/model/types.js').ProductCategory, import('./types.js').ProductCategoryDisplayFromApi>} [overridesBySlug]
 */
export function resolveProductCategoryDisplay(categorySlug, overridesBySlug) {
  const fields = resolveCatalogCategoryDisplayFields(
    categorySlug,
    overridesBySlug ?? new Map(),
    new Map(),
    null,
    PRODUCT_CATEGORY_LABEL_RU[categorySlug] ?? categorySlug,
  );

  return {
    categorySlug,
    displaySlug: categorySlug,
    ...fields,
  };
}

/**
 * @param {import('../../product-category-tree/model/types.js').ProductCategoryNode[]} roots
 * @param {string} legacySlug
 */
function findRootForLegacySlug(roots, legacySlug) {
  return (
    roots.find(
      (root) => root.legacyProductCategory === legacySlug || root.slug === legacySlug,
    ) ?? null
  );
}

/**
 * Базовый список PRODUCT_CATEGORIES + новые корневые из БД, которых нет в legacy.
 *
 * @param {import('../../product-category-tree/model/types.js').ProductCategoryNode[]} roots
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {import('./types.js').ResolvedProductCategoryDisplay[]}
 */
export function buildResolvedProductCategoryDisplaysFromRoots(roots, displays) {
  const overridesBySlug = mapCategoryDisplaysBySlug(displays);
  const overridesById = mapCategoryDisplaysById(displays);
  const matchedRootIds = new Set();
  /** @type {import('./types.js').ResolvedProductCategoryDisplay[]} */
  const items = [];

  for (const legacySlug of PRODUCT_CATEGORIES) {
    const root = findRootForLegacySlug(roots, legacySlug);
    if (root) {
      matchedRootIds.add(root.id);
    }

    const displaySlug = root?.slug ?? legacySlug;
    const fields = resolveCatalogCategoryDisplayFields(
      displaySlug,
      overridesBySlug,
      overridesById,
      root?.id ?? null,
      root?.labelRu ?? PRODUCT_CATEGORY_LABEL_RU[legacySlug] ?? legacySlug,
      legacySlug,
    );

    items.push({
      categoryId: root?.id ?? null,
      categorySlug: legacySlug,
      displaySlug,
      ...fields,
    });
  }

  for (const root of roots) {
    if (matchedRootIds.has(root.id)) {
      continue;
    }

    const fields = resolveCatalogCategoryDisplayFields(
      root.slug,
      overridesBySlug,
      overridesById,
      root.id,
      root.labelRu ?? root.slug,
    );

    items.push({
      categoryId: root.id,
      categorySlug: root.slug,
      displaySlug: root.slug,
      ...fields,
    });
  }

  return items;
}

/**
 * @param {import('./types.js').ProductCategoryDisplayFromApi[]} displays
 * @returns {import('./types.js').ResolvedProductCategoryDisplay[]}
 */
export function buildResolvedProductCategoryDisplays(displays) {
  return buildResolvedProductCategoryDisplaysFromRoots([], displays);
}
