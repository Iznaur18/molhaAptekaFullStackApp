import type { RaffleFromApi } from "@/entities/raffle/model/types";
import { RAFFLE_FEATURED_BANNER_UI } from "@/shared/config";

export type FeaturedRaffleProgress = {
  isCompleted: boolean;
  progress: number;
  target: number;
  remaining: number;
  percent: number;
  label: string;
  participantsCount: number;
};

export const buildFeaturedRaffleProgress = (
  raffle: RaffleFromApi,
): FeaturedRaffleProgress => {
  const isCompleted = raffle.status === "completed";
  const progress = Number(raffle.salesProgress) || 0;
  const target = Number(raffle.targetSales) || 0;
  const participantsCount = Number(raffle.participantsCount) || 0;
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0;
  const remaining = Math.max(0, target - progress);
  const base = RAFFLE_FEATURED_BANNER_UI.PROGRESS(progress, target);
  const label =
    isCompleted || remaining <= 0
      ? base
      : `${base} ${RAFFLE_FEATURED_BANNER_UI.REMAINING(remaining)}`;

  return { isCompleted, progress, target, remaining, percent, label, participantsCount };
};
