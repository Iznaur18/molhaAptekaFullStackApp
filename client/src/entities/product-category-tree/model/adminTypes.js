/**
 * @typedef {Object} ProductCategoryAdminRow
 * @property {string} _id
 * @property {string} slug
 * @property {string} labelRu
 * @property {string | null} parentId
 * @property {number} depth
 * @property {string[]} pathSlugs
 * @property {string[]} pathLabelRu
 * @property {string[]} searchKeywords
 * @property {boolean} isLeaf
 * @property {string | null} [legacyProductCategory]
 * @property {number} sortOrder
 */

/**
 * @typedef {Object} ProductCategoryAdminWritePayload
 * @property {string} slug
 * @property {string} labelRu
 * @property {string | null} [parentId]
 * @property {boolean} [isLeaf]
 * @property {string | null} [legacyProductCategory]
 * @property {string[]} [searchKeywords]
 * @property {number} [sortOrder]
 */

export {};
