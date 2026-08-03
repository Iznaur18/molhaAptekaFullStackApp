/**
 * @typedef {Object} ProductQuestionAuthor
 * @property {string | null} _id
 * @property {string} userName
 */

/**
 * @typedef {Object} ProductQuestionAnswerFromApi
 * @property {string} text
 * @property {string | null} answeredAt
 */

/**
 * @typedef {Object} ProductQuestionFromApi
 * @property {string} _id
 * @property {string} productId
 * @property {string} text
 * @property {'pending' | 'answered' | 'hidden'} status
 * @property {ProductQuestionAnswerFromApi | null} answer
 * @property {ProductQuestionAuthor} author
 * @property {boolean} isMine
 * @property {boolean} canDelete
 * @property {string} createdAt
 * @property {string | null} answeredAt
 */

/**
 * @typedef {Object} ProductQuestionPagination
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} totalPages
 */

/**
 * @typedef {Object} ProductQuestionSummary
 * @property {boolean} qaEnabled
 * @property {boolean} isSeller
 * @property {number} publicCount
 * @property {number} pendingCount
 * @property {number} activeCount
 * @property {number} remaining
 * @property {number} limit
 * @property {boolean} canAsk
 */

export {};
