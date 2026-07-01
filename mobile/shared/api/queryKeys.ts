export const authMeQueryKeys = {
  all: ["auth", "me"] as const,
};

export const catalogQueryKeys = {
  all: ["catalog"] as const,
  list: (params: Record<string, unknown>) =>
    [...catalogQueryKeys.all, "list", params] as const,
  product: (productId: string) =>
    [...catalogQueryKeys.all, "product", productId] as const,
};

export const cartQueryKeys = {
  all: ["cart", "me"] as const,
};

export const addressQueryKeys = {
  all: ["address"] as const,
  suggestions: (query: string) => [...addressQueryKeys.all, "suggest", query] as const,
};

export const categoryDisplayQueryKeys = {
  all: ["category-displays"] as const,
  categories: () => [...categoryDisplayQueryKeys.all, "categories"] as const,
  feedTiles: () => [...categoryDisplayQueryKeys.all, "feed-tiles"] as const,
};

export const orderQueryKeys = {
  all: ["orders"] as const,
  my: () => [...orderQueryKeys.all, "my"] as const,
  sales: (params: Record<string, unknown> = {}) =>
    [...orderQueryKeys.all, "sales", params] as const,
  adminAll: (params: Record<string, unknown> = {}) =>
    [...orderQueryKeys.all, "admin", params] as const,
  myActionCount: () => [...orderQueryKeys.all, "action-count"] as const,
  salesActionCount: () => [...orderQueryKeys.all, "sales", "action-count"] as const,
};

export const myProductsQueryKeys = {
  all: ["my-products"] as const,
  list: (params: Record<string, unknown> = {}) =>
    [...myProductsQueryKeys.all, "list", params] as const,
  total: () => [...myProductsQueryKeys.all, "total"] as const,
};

export const introAdQueryKeys = {
  all: ["intro-ad"] as const,
  myCampaign: () => [...introAdQueryKeys.all, "me"] as const,
  moderationPending: (limit = 50) =>
    [...introAdQueryKeys.all, "moderation", "pending", limit] as const,
  moderationManaged: () => [...introAdQueryKeys.all, "moderation", "managed"] as const,
  moderationCount: () => [...introAdQueryKeys.all, "moderation", "count"] as const,
};

export const sellerPersonalCategoryQueryKeys = {
  all: ["seller-personal-category"] as const,
  myCampaign: () => [...sellerPersonalCategoryQueryKeys.all, "me"] as const,
  catalogTiles: () => [...sellerPersonalCategoryQueryKeys.all, "catalog-tiles"] as const,
  moderationPending: (limit = 50) =>
    [...sellerPersonalCategoryQueryKeys.all, "moderation", "pending", limit] as const,
  moderationCount: () =>
    [...sellerPersonalCategoryQueryKeys.all, "moderation", "count"] as const,
};

export const premiumQueryKeys = {
  all: ["premium"] as const,
  status: () => [...premiumQueryKeys.all, "status"] as const,
};

export const loyaltyPointsQueryKeys = {
  all: ["loyalty-points"] as const,
  status: () => [...loyaltyPointsQueryKeys.all, "status"] as const,
};

export const dataConfirmationQueryKeys = {
  all: ["data-confirmation"] as const,
  myStatus: () => [...dataConfirmationQueryKeys.all, "me"] as const,
};

export const priceOfferQueryKeys = {
  all: ["product-price-offers"] as const,
  top: (productId: string) => [...priceOfferQueryKeys.all, "top", productId] as const,
  my: (productId: string) => [...priceOfferQueryKeys.all, "me", productId] as const,
  incoming: () => [...priceOfferQueryKeys.all, "incoming"] as const,
  myBids: () => [...priceOfferQueryKeys.all, "my-bids"] as const,
};

export const curatedProductListQueryKeys = {
  all: ["curated-product-lists"] as const,
  home: (allCities = false) => [...curatedProductListQueryKeys.all, "home", { allCities }] as const,
};

export const raffleQueryKeys = {
  all: ["raffles"] as const,
  featured: () => [...raffleQueryKeys.all, "featured"] as const,
  my: () => [...raffleQueryKeys.all, "my"] as const,
  products: (raffleId: string) => [...raffleQueryKeys.all, "products", raffleId] as const,
  staffQueue: () => [...raffleQueryKeys.all, "staff", "queue"] as const,
  pendingCount: () => [...raffleQueryKeys.all, "staff", "pending-count"] as const,
};

export const productPromotionQueryKeys = {
  all: ["product-promotions"] as const,
  staffPending: () => [...productPromotionQueryKeys.all, "staff", "pending"] as const,
  pendingCount: () => [...productPromotionQueryKeys.all, "staff", "pending-count"] as const,
};

export const userStoriesQueryKeys = {
  all: ["user-stories"] as const,
  feed: () => [...userStoriesQueryKeys.all, "feed"] as const,
  author: (authorId: string) => [...userStoriesQueryKeys.all, "author", authorId] as const,
};

export const installmentQueryKeys = {
  all: ["installment"] as const,
  program: (productId: string) => [...installmentQueryKeys.all, "program", productId] as const,
  myContracts: (status: string) =>
    [...installmentQueryKeys.all, "contracts", "my", status] as const,
  mySales: (status: string) => [...installmentQueryKeys.all, "sales", status] as const,
  moderationPending: () => [...installmentQueryKeys.all, "moderation", "pending"] as const,
  moderationPendingCount: () =>
    [...installmentQueryKeys.all, "moderation", "pending-count"] as const,
  disputesPending: () => [...installmentQueryKeys.all, "disputes", "pending"] as const,
  disputesPendingCount: () =>
    [...installmentQueryKeys.all, "disputes", "pending-count"] as const,
  buyerActionCount: () => [...installmentQueryKeys.all, "buyer-action-count"] as const,
  sellerActionCount: () => [...installmentQueryKeys.all, "seller-action-count"] as const,
};

export const categoryTreeQueryKeys = {
  all: ["category-tree"] as const,
  children: (categoryId: string) =>
    [...categoryTreeQueryKeys.all, "children", categoryId] as const,
  breadcrumb: (categoryId: string) =>
    [...categoryTreeQueryKeys.all, "breadcrumb", categoryId] as const,
};

export const productReportQueryKeys = {
  all: ["product-report"] as const,
  myStatus: (productId: string) =>
    [...productReportQueryKeys.all, "me", productId] as const,
  pending: () => [...productReportQueryKeys.all, "pending"] as const,
  pendingCount: () => [...productReportQueryKeys.all, "pending-count"] as const,
};

export const moderationQueryKeys = {
  all: ["product-moderation"] as const,
  pending: (params: { limit?: number } = {}) =>
    [...moderationQueryKeys.all, "pending", params] as const,
  pendingCount: () => [...moderationQueryKeys.all, "pending-count"] as const,
};

export const staffBadgeQueryKeys = {
  all: ["staff-badges"] as const,
};

export const dataConfirmationStaffQueryKeys = {
  all: ["data-confirmation-staff"] as const,
  pending: () => [...dataConfirmationStaffQueryKeys.all, "pending"] as const,
  pendingCount: () => [...dataConfirmationStaffQueryKeys.all, "pending-count"] as const,
};

export const searchSynonymAdminQueryKeys = {
  all: ["search-synonym", "admin"] as const,
};

export const categoryAdminQueryKeys = {
  all: ["category-admin"] as const,
};

export const curatedProductListAdminQueryKeys = {
  all: ["curated-product-lists", "admin"] as const,
};

export const appIntroSettingsQueryKeys = {
  all: ["app-intro-settings"] as const,
};

export const userStoryReportQueryKeys = {
  all: ["user-story-reports"] as const,
  pending: () => [...userStoryReportQueryKeys.all, "pending"] as const,
  pendingCount: () => [...userStoryReportQueryKeys.all, "pending-count"] as const,
};
