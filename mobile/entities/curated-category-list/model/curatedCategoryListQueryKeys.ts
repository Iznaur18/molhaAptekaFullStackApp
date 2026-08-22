export const curatedCategoryListQueryKeys = {
  all: ["curated-category-lists"] as const,
  home: (regionCode = "") =>
    [...curatedCategoryListQueryKeys.all, "home", { regionCode }] as const,
  admin: () => [...curatedCategoryListQueryKeys.all, "admin"] as const,
  itemPreview: (kind: string, refId: string) =>
    [...curatedCategoryListQueryKeys.all, "item-preview", { kind, refId }] as const,
};
