export type ProductCategoryRootNode = {
  id: string;
  slug: string;
  labelRu: string;
  legacyProductCategory: string | null;
  isLeaf: boolean;
};

export type SellerPersonalCategoryCatalogTile = {
  _id: string;
  sellerId: string;
  labelRu: string;
  imageUrl?: string | null;
};
