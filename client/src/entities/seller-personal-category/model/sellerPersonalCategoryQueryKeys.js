export const sellerPersonalCategoryQueryKeys = {
  all: ["seller-personal-category"],
  myCampaign: () => [...sellerPersonalCategoryQueryKeys.all, "my-campaign"],
  catalogTiles: () => [...sellerPersonalCategoryQueryKeys.all, "catalog-tiles"],
  moderationPending: () => [...sellerPersonalCategoryQueryKeys.all, "moderation", "pending"],
  moderationCount: () => [
    ...sellerPersonalCategoryQueryKeys.all,
    "moderation",
    "count",
  ],
};
