import { SITE_RAFFLES_COMPLETED_VITRINE_TTL_MS } from "../../constants/raffleConstants.js";

/**
 * @param {Date} [now]
 * @returns {Date}
 */
export const getCompletedRaffleExpiryCutoff = (now = new Date()) =>
  new Date(now.getTime() - SITE_RAFFLES_COMPLETED_VITRINE_TTL_MS);
