/**
 * @typedef {Object} CuratedCategoryListItemFromApi
 * @property {"tree" | "personal" | "user"} kind
 * @property {string} refId
 * @property {string} itemKey
 * @property {string | null} [label]
 */

/**
 * @typedef {Object} CuratedCategoryListFromApi
 * @property {string} _id
 * @property {string} title
 * @property {string} regionCode
 * @property {CuratedCategoryListItemFromApi[]} items
 * @property {number} sortOrder
 * @property {string | null} [createdAt]
 * @property {string | null} [updatedAt]
 */

/**
 * @typedef {Object} HomeCuratedCategoryFromApi
 * @property {"tree" | "personal" | "user"} kind
 * @property {string} refId
 * @property {string} itemKey
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {string | null} [categorySlug]
 * @property {string | null} [sellerId]
 * @property {string | null} [sellerFullName]
 * @property {number | null} [sellerRatingAverage]
 * @property {number} [sellerRatingVotes]
 * @property {string | null} [sellerBusinessHoursLabel]
 */

/**
 * @typedef {CuratedCategoryListFromApi & { categories: HomeCuratedCategoryFromApi[] }} HomeCuratedCategoryListFromApi
 */

/**
 * @typedef {Object} CuratedCategoryListItemPreviewFromApi
 * @property {"tree" | "personal" | "user"} kind
 * @property {string} refId
 * @property {string} label
 * @property {string | null} imageUrl
 * @property {string | null} categorySlug
 * @property {string | null} regionCode
 * @property {string | null} regionLabel
 * @property {boolean} catalogVisible
 */

export {};
