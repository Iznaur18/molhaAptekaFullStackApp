import {
  resolveRaffleFeaturedBannerMetrics,
  type RaffleFeaturedBannerMetrics,
} from "@izibuy/shared-lib";
import { useMemo } from "react";

type RaffleFeaturedBannerMetricsOptions = { hasManage?: boolean };

export const useRaffleFeaturedBannerMetrics = (
  cardWidth: number,
  options: RaffleFeaturedBannerMetricsOptions = {},
): RaffleFeaturedBannerMetrics =>
  useMemo(
    () => resolveRaffleFeaturedBannerMetrics(cardWidth, undefined, options),
    [cardWidth, options.hasManage],
  );
