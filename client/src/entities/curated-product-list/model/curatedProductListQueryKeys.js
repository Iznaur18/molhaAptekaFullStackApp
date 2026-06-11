export const curatedProductListQueryKeys = {
  all: ["curated-product-lists"],
  home: (allCities = false) => [...curatedProductListQueryKeys.all, "home", { allCities }],
  admin: () => [...curatedProductListQueryKeys.all, "admin"],
};
