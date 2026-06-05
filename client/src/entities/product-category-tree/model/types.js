/**
 * @typedef {Object} ProductCategoryNode
 * @property {string} id
 * @property {string} slug
 * @property {string} labelRu
 * @property {string | null} parentId
 * @property {number} depth
 * @property {string[]} pathSlugs
 * @property {string[]} pathLabelRu
 * @property {boolean} isLeaf
 * @property {string | null} [legacyProductCategory]
 * @property {string[]} searchKeywords
 */

/**
 * @typedef {Object} ProductCategoryBreadcrumbItem
 * @property {string} slug
 * @property {string} labelRu
 */

/**
 * @typedef {Object} ProductCategoryBreadcrumb
 * @property {string} categoryId
 * @property {string} slug
 * @property {string} labelRu
 * @property {ProductCategoryBreadcrumbItem[]} items
 */

export {};
