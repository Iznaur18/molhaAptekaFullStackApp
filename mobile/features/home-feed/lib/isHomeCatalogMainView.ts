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
}: HomeCatalogMainViewParams) =>
  !search &&
  !selectedRootSlug &&
  !selectedSubcategoryId &&
  !sellerPersonalCategoryId &&
  !sort &&
  !followingOnly &&
  !auctionOnly &&
  !installmentOnly &&
  !saleOnly;
