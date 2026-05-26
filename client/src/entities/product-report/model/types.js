/**
 * @typedef {object} ProductReportReporter
 * @property {string} _id
 * @property {string} [userName]
 */

/**
 * @typedef {object} ProductReportItem
 * @property {string} _id
 * @property {string} reportText
 * @property {string} createdAt
 * @property {ProductReportReporter} reporter
 */

/**
 * @typedef {object} ProductReportGroup
 * @property {import('../../product/model/types.js').ProductFromApi} product
 * @property {number} reportCount
 * @property {ProductReportItem[]} reports
 */

/**
 * @typedef {object} UserInAppNotification
 * @property {string} _id
 * @property {string} kind
 * @property {string} message
 * @property {string | null} productId
 * @property {string | null} [actorUserId]
 * @property {string} createdAt
 */

export {};
