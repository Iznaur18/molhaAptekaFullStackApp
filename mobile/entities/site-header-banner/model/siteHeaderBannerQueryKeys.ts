export const siteHeaderBannerQueryKeys = {
  all: ["site-header-banner"] as const,
  slides: () => [...siteHeaderBannerQueryKeys.all, "slides"] as const,
  settings: () => [...siteHeaderBannerQueryKeys.all, "settings"] as const,
  guestProfileLoginMenuBannerImageUrl: () =>
    [...siteHeaderBannerQueryKeys.all, "guest-profile-login-menu-banner-image-url"] as const,
};
