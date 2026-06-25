import { useMemo } from "react";

import { RAFFLE_FEATURED_LAYOUT } from "@/shared/theme/raffleFeaturedStyles";
import { useScreenLayout } from "@/shared/model/useScreenLayout";
import { HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET } from "@/shared/lib/homeCatalogHeaderLayout";

export type RaffleFeaturedSlideLayout = {
  slideWidth: number;
  snapInterval: number;
};

export const resolveRaffleFeaturedSlideWidth = (layoutWidth: number): number =>
  Math.max(0, layoutWidth - HOME_CATALOG_HEADER_SHELL_HORIZONTAL_INSET * 2);

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
