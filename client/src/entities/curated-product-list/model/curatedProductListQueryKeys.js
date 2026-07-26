export const curatedProductListQueryKeys = {
  all: ["curated-product-lists"],
  home: (regionCode = "") => [...curatedProductListQueryKeys.all, "home", { regionCode }],
  admin: () => [...curatedProductListQueryKeys.all, "admin"],
};
