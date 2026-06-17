import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export const resolveRafflePrizeVideoUrl = (raffle: RaffleFromApi | null | undefined): string =>
  resolveUploadedMediaUrl(raffle?.prizeVideoUrl ?? "");
