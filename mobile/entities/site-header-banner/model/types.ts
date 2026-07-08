export type SiteHeaderBannerItem = {
  id: string;
  enabled: boolean;
  imageUrl: string | null;
  imageAlt: string;
  linkPath: string | null;
  backgroundColor: string | null;
};

export type SiteHeaderBannerSettings = {
  enabled: boolean;
  items: SiteHeaderBannerItem[];
  guestProfileLoginMenuBannerImageUrl?: string | null;
  updatedAt?: string | Date | null;
};

export type SiteHeaderBannerSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  linkPath: string | null;
  backgroundColor: string | null;
};
