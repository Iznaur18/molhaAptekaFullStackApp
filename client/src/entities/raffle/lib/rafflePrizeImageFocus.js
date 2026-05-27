import {
  DEFAULT_USER_AVATAR_FOCUS,
  formatProfileImageObjectPosition,
  normalizeProfileImageFocus,
} from "../../user/lib/profileImageFocus.js";

/** @typedef {{ x: number; y: number }} RafflePrizeImageFocus */

export const DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS = DEFAULT_USER_AVATAR_FOCUS;

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 * @returns {RafflePrizeImageFocus}
 */
export function getRafflePrizeImageFocus(raffle) {
  return normalizeProfileImageFocus(
    raffle?.prizeImageFocus,
    DEFAULT_RAFFLE_PRIZE_IMAGE_FOCUS,
  );
}

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 * @returns {string}
 */
export function formatRafflePrizeImageObjectPosition(raffle) {
  return formatProfileImageObjectPosition(getRafflePrizeImageFocus(raffle));
}
