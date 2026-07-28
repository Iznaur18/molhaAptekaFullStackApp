/**
 * @typedef {import('../../product/model/types.js').ProductFromApi} ProductFromApi
 */

/**
 * @typedef {Object} CuratedProductListFromApi
 * @property {string} _id
 * @property {string} title
 * @property {string} regionCode
 * @property {string[]} productIds
 * @property {number} sortOrder
 * @property {string | null} [createdAt]
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {CuratedProductListFromApi & { products: ProductFromApi[] }} HomeCuratedProductListFromApi
 */

export {};
