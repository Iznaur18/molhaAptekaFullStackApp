/** @typedef {import('../../product/model/types.js').ProductCategory} ProductCategory */

/**
 * @typedef {Object} ProductCategoryDisplayFromApi
 * @property {ProductCategory | string | null} [categorySlug]
 * @property {string | null} [categoryId]
 * @property {string | null} customLabel
 * @property {string | null} imageUrl
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {Object} ResolvedProductCategoryDisplay
 * @property {string | null} categoryId
 * @property {string} categorySlug
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {boolean} isCustomLabel
 * @property {boolean} isCustomImage
 */

/**
 * @typedef {Object} ProductCatalogFeedTileDisplayFromApi
 * @property {string} tileKey
 * @property {string | null} customLabel
 * @property {string | null} imageUrl
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {Object} ResolvedCatalogFeedTileDisplay
 * @property {string} tileKey
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {boolean} isCustomLabel
 * @property {boolean} isCustomImage
 */
