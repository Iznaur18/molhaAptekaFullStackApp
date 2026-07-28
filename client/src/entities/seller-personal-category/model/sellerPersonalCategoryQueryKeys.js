export const sellerPersonalCategoryQueryKeys = {
  all: ["seller-personal-category"],
  myCampaign: () => [...sellerPersonalCategoryQueryKeys.all, "my-campaign"],
  catalogTiles: (regionCode = "") => [
    ...sellerPersonalCategoryQueryKeys.all,
    "catalog-tiles",
    { regionCode },
  ],
  moderationPending: () => [...sellerPersonalCategoryQueryKeys.all, "moderation", "pending"],
  moderationManaged: () => [...sellerPersonalCategoryQueryKeys.all, "moderation", "managed"],
  moderationCount: () => [
    ...sellerPersonalCategoryQueryKeys.all,
    "moderation",
    "count",
  ],
};
