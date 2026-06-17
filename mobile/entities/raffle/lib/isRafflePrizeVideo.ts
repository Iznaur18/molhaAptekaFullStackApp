import type { RaffleFromApi } from "@/entities/raffle/model/types";

import { RAFFLE_PRIZE_MEDIA_TYPE_VIDEO } from "./raffleConstants";

export const isRafflePrizeVideo = (raffle: RaffleFromApi | null | undefined): boolean =>
  raffle?.prizeMediaType === RAFFLE_PRIZE_MEDIA_TYPE_VIDEO;
