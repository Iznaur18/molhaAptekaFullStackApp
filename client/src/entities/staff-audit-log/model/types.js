/**
 * @typedef {object} StaffAuditActor
 * @property {string} userName
 * @property {string} email
 */

/**
 * @typedef {object} StaffAuditLogEntry
 * @property {string} _id
 * @property {string} actorUserId
 * @property {StaffAuditActor | null} actor
 * @property {string} actorRole
 * @property {string} method
 * @property {string} action
 * @property {string} path
 * @property {Record<string, unknown>} params
 * @property {unknown} requestBody
 * @property {number} statusCode
 * @property {string | null} requestId
 * @property {string | null} createdAt
 */

/**
 * @typedef {object} StaffAuditLogPage
 * @property {StaffAuditLogEntry[]} items
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 */

/**
 * @typedef {object} StaffAuditLogFilters
 * @property {number} [page]
 * @property {string} [actorUserId]
 * @property {string} [action]
 * @property {string} [from]
 * @property {string} [to]
 */

export {};
