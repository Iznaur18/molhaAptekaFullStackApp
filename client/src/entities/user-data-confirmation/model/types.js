/**
 * @typedef {object} PassportSnapshot
 * @property {string} lastName
 * @property {string} firstName
 * @property {string} [middleName]
 * @property {string} birthDate
 * @property {string} series
 * @property {string} number
 * @property {string} issuedBy
 * @property {string} issuedAt
 * @property {string} departmentCode
 */

/**
 * @typedef {object} DataConfirmationRequest
 * @property {string} _id
 * @property {string} userId
 * @property {PassportSnapshot} passport
 * @property {'pending' | 'approved' | 'rejected'} status
 * @property {string} [staffNote]
 * @property {string} [createdAt]
 * @property {import('../../user/model/types.js').UserSearchListItem | null} [user]
 */

/**
 * @typedef {object} MyDataConfirmationStatus
 * @property {boolean} isUserDataConfirmed
 * @property {DataConfirmationRequest | null} request
 */

export {};
