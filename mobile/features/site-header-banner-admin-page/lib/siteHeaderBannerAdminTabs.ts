export const SITE_HEADER_BANNER_ADMIN_TAB_SLIDES = "slides" as const;
export const SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS = "buttons" as const;
export const SITE_HEADER_BANNER_ADMIN_TAB_GUEST = "guest" as const;

export type SiteHeaderBannerAdminTabId =
  | typeof SITE_HEADER_BANNER_ADMIN_TAB_SLIDES
  | typeof SITE_HEADER_BANNER_ADMIN_TAB_BUTTONS
  | typeof SITE_HEADER_BANNER_ADMIN_TAB_GUEST;
