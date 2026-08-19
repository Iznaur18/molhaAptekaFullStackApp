export const curatedCategoryListQueryKeys = {
  all: ["curated-category-lists"],
  home: (regionCode = "") => [...curatedCategoryListQueryKeys.all, "home", { regionCode }],
  admin: () => [...curatedCategoryListQueryKeys.all, "admin"],
  itemPreview: (kind, refId) => [
    ...curatedCategoryListQueryKeys.all,
    "item-preview",
    { kind, refId },
  ],
};
