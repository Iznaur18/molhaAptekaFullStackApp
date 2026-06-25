import { formatRafflePrizeContentPosition } from "@/entities/raffle/lib/rafflePrizeImageFocus";
import { isRafflePrizeVideo } from "@/entities/raffle/lib/isRafflePrizeVideo";
import { resolveRafflePrizeImageUrl } from "@/entities/raffle/lib/resolveRafflePrizeImageUrl";
import { resolveRafflePrizeVideoUrl } from "@/entities/raffle/lib/resolveRafflePrizeVideoUrl";
import type { RaffleFromApi } from "@/entities/raffle/model/types";

export type RaffleFeaturedBannerBackdrop = {
  hasBackdrop: boolean;
  useVideoBackdrop: boolean;
  imageUrl: string | null;
  contentPosition: { top?: string; left?: string } | string;
};

export const getRaffleFeaturedBannerBackdrop = (
  raffle: RaffleFromApi | null | undefined,
): RaffleFeaturedBannerBackdrop => {
  const imageUrl = resolveRafflePrizeImageUrl(raffle);
  const contentPosition = formatRafflePrizeContentPosition(raffle);

  if (imageUrl) {
    return {
      hasBackdrop: true,
      useVideoBackdrop: false,
      imageUrl,
      contentPosition,
    };
  }

  const useVideoBackdrop =
    isRafflePrizeVideo(raffle) && Boolean(resolveRafflePrizeVideoUrl(raffle));

  return {
    hasBackdrop: useVideoBackdrop,
    useVideoBackdrop,
    imageUrl: null,
    contentPosition,
  };
};
