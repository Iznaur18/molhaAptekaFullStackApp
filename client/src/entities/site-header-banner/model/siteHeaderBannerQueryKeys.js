export const siteHeaderBannerQueryKeys = {
  all: ["site-header-banner"],
  slides: (regionCode = "") => [
    ...siteHeaderBannerQueryKeys.all,
    "slides",
    { regionCode },
  ],
  settings: () => [...siteHeaderBannerQueryKeys.all, "settings"],
  guestProfileLoginMenuBannerImageUrl: () => [
    ...siteHeaderBannerQueryKeys.all,
    "guest-profile-login-menu-banner",
  ],
};
