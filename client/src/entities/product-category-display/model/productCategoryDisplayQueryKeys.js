export const productCategoryDisplayQueryKeys = {
  all: ["product-category-display"],
  categories: () => [...productCategoryDisplayQueryKeys.all, "categories"],
  feedTiles: () => [...productCategoryDisplayQueryKeys.all, "feed-tiles"],
};
