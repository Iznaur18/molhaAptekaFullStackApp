import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { resolveUploadedMediaUrl } from "@/shared/lib/resolveMediaUrl";

export const resolveRafflePrizeImageUrl = (raffle: RaffleFromApi | null | undefined): string =>
  resolveUploadedMediaUrl(raffle?.prizeImageUrl ?? "");
