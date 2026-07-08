/**
 * @param {{ id: string }} slide
 */
export const isPaidSiteHeaderBannerSlide = (slide) => slide.id.startsWith("paid:");
