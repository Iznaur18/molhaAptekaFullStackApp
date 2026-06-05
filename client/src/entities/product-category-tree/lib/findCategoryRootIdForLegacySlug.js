/**
 * @param {import('../model/types.js').ProductCategoryNode[]} roots
 * @param {string} legacySlug
 * @returns {string | null}
 */
export function findCategoryRootIdForLegacySlug(roots, legacySlug) {
  const normalized = String(legacySlug ?? "").trim();
  if (!normalized) {
    return null;
  }

  const match = roots.find(
    (root) => root.legacyProductCategory === normalized || root.slug === normalized,
  );

  return match?.id ?? null;
}
