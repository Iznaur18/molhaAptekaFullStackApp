import type { SiteHeaderBannerSlide } from "../model/types";

export const isPaidSiteHeaderBannerSlide = (slide: Pick<SiteHeaderBannerSlide, "id">): boolean =>
  slide.id.startsWith("paid:");
