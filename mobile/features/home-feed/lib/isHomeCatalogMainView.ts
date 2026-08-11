type HomeCatalogMainViewParams = {
  search: string;
  selectedRootSlug: string | null;
  selectedSubcategoryId: string | null;
  sellerPersonalCategoryId: string | null;
  sort?: string;
  followingOnly: boolean;
  auctionOnly: boolean;
  installmentOnly: boolean;
  saleOnly: boolean;
  rentalOnly: boolean;
  affiliateOnly: boolean;
  wholesaleOnly: boolean;
  originalOnly: boolean;
  near?: boolean;
};

export const isHomeCatalogMainView = ({
  search,
  selectedRootSlug,
  selectedSubcategoryId,
  sellerPersonalCategoryId,
  sort,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  rentalOnly,
  affiliateOnly,
  wholesaleOnly,
  originalOnly,
  near = false,
}: HomeCatalogMainViewParams) =>
  !search &&
  !selectedRootSlug &&
  !selectedSubcategoryId &&
  !sellerPersonalCategoryId &&
  !sort &&
  !followingOnly &&
  !auctionOnly &&
  !installmentOnly &&
  !saleOnly &&
  !rentalOnly &&
  !affiliateOnly &&
  !wholesaleOnly &&
  !originalOnly &&
  !near;
