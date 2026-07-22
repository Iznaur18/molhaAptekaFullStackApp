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
 * @property {'image' | 'video'} [prizeMediaType]
 * @property {string} [prizeVideoUrl]
 * @property {{ x?: number; y?: number }} [prizeImageFocus]
 * @property {number} targetSales
 * @property {number} salesProgress
 * @property {number} [participantsCount]
 * @property {RaffleStatus} status
 * @property {string | null} instagramUrl
 * @property {string} [moderationComment]
 * @property {string | null} [approvedAt]
 * @property {string | null} [completedAt]
 * @property {{ _id: string; userName?: string | null; userAvatarUrl?: string | null } | null} [winner]
 * @property {string | null} [winnerSelectedAt]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {{ _id: string; userName?: string | null } | null} [seller]
 */
