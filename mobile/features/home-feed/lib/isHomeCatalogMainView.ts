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
  buyNFreeOnly: boolean;
  originalOnly: boolean;
  flashSaleOnly?: boolean;
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
  buyNFreeOnly,
  originalOnly,
  flashSaleOnly = false,
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
  !buyNFreeOnly &&
  !originalOnly &&
  !flashSaleOnly &&
  !near;
