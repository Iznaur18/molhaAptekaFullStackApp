import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 * @returns {string}
 */
export function resolveRafflePrizeImageUrl(raffle) {
  return resolveImageUrlForDisplay(raffle?.prizeImageUrl ?? "");
}
