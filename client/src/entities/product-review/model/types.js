/**
 * @typedef {object} ProductReviewAuthor
 * @property {string} _id
 * @property {string} userName
 * @property {boolean} isUserDataConfirmed
 * @property {boolean} [isPremiumUser]
 */

/**
 * @typedef {object} ProductReviewFromApi
 * @property {string} _id
 * @property {string} productId
 * @property {number} rating
 * @property {string} text
 * @property {'published' | 'hidden'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {boolean} canEdit
 * @property {ProductReviewAuthor | null} author
 */

/**
 * @typedef {object} ProductReviewSummary
 * @property {number} averageRating
 * @property {number} reviewCount
 * @property {boolean} canReview
 * @property {ProductReviewFromApi | null} myReview
 */

/**
 * @typedef {object} ProductReviewPagination
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */

export {};
