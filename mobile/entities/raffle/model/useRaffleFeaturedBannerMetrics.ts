import {
  resolveRaffleFeaturedBannerMetrics,
  type RaffleFeaturedBannerMetrics,
} from "@izibuy/shared-lib";
import { useMemo } from "react";

export const useRaffleFeaturedBannerMetrics = (
  cardWidth: number,
): RaffleFeaturedBannerMetrics =>
  useMemo(() => resolveRaffleFeaturedBannerMetrics(cardWidth), [cardWidth]);
