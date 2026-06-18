import { useMemo } from "react";

import { RAFFLE_FEATURED_LAYOUT } from "@/shared/theme/raffleFeaturedStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { SCREEN_CONTENT_PADDING_HORIZONTAL } from "@/shared/theme/screenContentLayout";

export type RaffleFeaturedSlideLayout = {
  slideWidth: number;
  snapInterval: number;
};

export const resolveRaffleFeaturedSlideWidth = (layoutWidth: number): number =>
  Math.max(0, layoutWidth - SCREEN_CONTENT_PADDING_HORIZONTAL * 2);

export const resolveRaffleFeaturedSnapInterval = (slideWidth: number): number =>
  slideWidth + RAFFLE_FEATURED_LAYOUT.slideGap;

export const useRaffleFeaturedSlideLayout = (): RaffleFeaturedSlideLayout => {
  const { layoutWidth } = useScreenLayout();

  return useMemo(() => {
    const slideWidth = resolveRaffleFeaturedSlideWidth(layoutWidth);
    return {
      slideWidth,
      snapInterval: resolveRaffleFeaturedSnapInterval(slideWidth),
    };
  }, [layoutWidth]);
};
