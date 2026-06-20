import { formatRafflePrizeImageObjectPosition } from "./rafflePrizeImageFocus.js";
import { isRafflePrizeVideo } from "./isRafflePrizeVideo.js";
import { resolveRafflePrizeImageUrl } from "./resolveRafflePrizeImageUrl.js";
import { resolveRafflePrizeVideoUrl } from "./resolveRafflePrizeVideoUrl.js";

/**
 * @param {import('../model/types.js').RaffleFromApi | null | undefined} raffle
 */
export function getRaffleFeaturedBannerBackdrop(raffle) {
  const imageUrl = resolveRafflePrizeImageUrl(raffle);

  if (imageUrl) {
    return {
      hasBackdrop: true,
      useVideoBackdrop: false,
      style: {
        "--raffle-featured-banner-backdrop-image": `url("${imageUrl}")`,
        "--raffle-featured-banner-backdrop-position":
          formatRafflePrizeImageObjectPosition(raffle),
      },
    };
  }

  const useVideoBackdrop =
    isRafflePrizeVideo(raffle) && Boolean(resolveRafflePrizeVideoUrl(raffle));

  return {
    hasBackdrop: useVideoBackdrop,
    useVideoBackdrop,
    style: undefined,
  };
}
