type CatalogTier3BannerGateParams = {
  showHomeFeed: boolean;
  isMineMode?: boolean;
};

export const shouldShowCatalogTier3Banners = ({
  showHomeFeed,
  isMineMode = false,
}: CatalogTier3BannerGateParams): boolean => !isMineMode && showHomeFeed;
