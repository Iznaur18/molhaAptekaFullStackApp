/**
 * @typedef {(
 *   | 'pending_staff'
 *   | 'active'
 *   | 'completed'
 *   | 'paused'
 *   | 'rejected'
 * )} RaffleStatus
 */

/**
 * @typedef {object} RaffleFromApi
 * @property {string} _id
 * @property {string} sellerId
 * @property {string} title
 * @property {string} description
 * @property {string} prizeImageUrl
 * @property {{ x?: number; y?: number }} [prizeImageFocus]
 * @property {number} targetSales
 * @property {number} salesProgress
 * @property {RaffleStatus} status
 * @property {string | null} instagramUrl
 * @property {string} [moderationComment]
 * @property {string | null} [approvedAt]
 * @property {string | null} [completedAt]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {{ _id: string; userName?: string | null } | null} [seller]
 */
