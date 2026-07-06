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
  updatedAt?: string | Date | null;
};

export type SiteHeaderBannerSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  linkPath: string | null;
  backgroundColor: string | null;
};
