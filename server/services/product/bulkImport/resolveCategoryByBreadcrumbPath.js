import { createCategoryBreadcrumbResolver } from "./createCategoryBreadcrumbResolver.js";

/**
 * Резолвит лист дерева по пути из Excel (как на листе «Категории» шаблона).
 *
 * @param {string} rawPath
 * @param {Awaited<ReturnType<typeof createCategoryBreadcrumbResolver>> | undefined} [resolver]
 */
export async function resolveCategoryByBreadcrumbPath(rawPath, resolver) {
  const activeResolver = resolver ?? (await createCategoryBreadcrumbResolver());
  return activeResolver.resolve(rawPath);
}

export { parseCategoryBreadcrumbParts } from "./buildLeafCategoryBreadcrumbPath.js";
