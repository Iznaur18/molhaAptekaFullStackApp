type SellerCatalogItem = {
  viewable?: boolean;
  product?: Record<string, unknown> & { _id: string } | null;
};

export const mapSellerCatalogItemsToProducts = (
  items: SellerCatalogItem[],
): Array<Record<string, unknown> & { _id: string }> => {
  return items
    .filter((item) => item.viewable && item.product != null)
    .map((item) => item.product as Record<string, unknown> & { _id: string });
};
