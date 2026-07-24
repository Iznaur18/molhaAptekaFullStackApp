export const siteHeaderBannerQueryKeys = {
  all: ["site-header-banner"],
  slides: () => [...siteHeaderBannerQueryKeys.all, "slides"],
  settings: () => [...siteHeaderBannerQueryKeys.all, "settings"],
  guestProfileLoginMenuBannerImageUrl: () => [
    ...siteHeaderBannerQueryKeys.all,
    "guest-profile-login-menu-banner",
  ],
};
