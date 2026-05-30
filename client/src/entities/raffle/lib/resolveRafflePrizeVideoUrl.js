import { resolveImageUrlForDisplay } from "../../../shared/lib/resolveUploadedImageUrl.js";

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 */
export function resolveRafflePrizeVideoUrl(raffle) {
  return resolveImageUrlForDisplay(raffle?.prizeVideoUrl ?? "");
}
