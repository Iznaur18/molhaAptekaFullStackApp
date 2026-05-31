/** @typedef {import('../../product/model/types.js').ProductCategory} ProductCategory */

/**
 * @typedef {Object} ProductCategoryDisplayFromApi
 * @property {ProductCategory} categorySlug
 * @property {string | null} customLabel
 * @property {string | null} imageUrl
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {Object} ResolvedProductCategoryDisplay
 * @property {ProductCategory} categorySlug
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {boolean} isCustomLabel
 * @property {boolean} isCustomImage
 */
