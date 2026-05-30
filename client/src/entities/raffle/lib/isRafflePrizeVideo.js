import {
  RAFFLE_PRIZE_MEDIA_TYPE_IMAGE,
  RAFFLE_PRIZE_MEDIA_TYPE_VIDEO,
} from "../model/raffleConstants.js";

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 */
export function isRafflePrizeVideo(raffle) {
  return raffle?.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
}

/**
 * @param {unknown} raw
 */
export function normalizeRafflePrizeMediaType(raw) {
  const value = String(raw ?? RAFFLE_PRIZE_MEDIA_TYPE_IMAGE).trim();
  if (value === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO) {
    return RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
  }
  return RAFFLE_PRIZE_MEDIA_TYPE_IMAGE;
}

export { RAFFLE_PRIZE_MEDIA_TYPE_IMAGE, RAFFLE_PRIZE_MEDIA_TYPE_VIDEO };
