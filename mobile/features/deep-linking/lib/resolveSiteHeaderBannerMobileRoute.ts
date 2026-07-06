const normalizePath = (rawPath: string): string => {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return "/";
  }
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
};

const HUB_SECTION_PATHS: Record<string, string> = {
  "/me": "/(tabs)/profile",
  "/my-profile": "/(tabs)/profile",
  "/my-products": "/hub/my-products",
  "/my-sales": "/hub/my-sales",
  "/my-orders": "/hub/my-orders",
  "/subscriptions": "/hub/subscriptions",
  "/wishlist": "/hub/wishlist",
  "/premium": "/hub/premium",
  "/loyalty-points": "/hub/loyalty-points",
  "/profile/advertising": "/hub/advertising",
  "/advertising": "/hub/advertising",
  "/basket": "/(tabs)/cart",
  "/cart": "/(tabs)/cart",
  "/auction": "/hub/auction",
  "/installment-payments": "/hub/installment-payments",
  "/installment-sales": "/hub/installment-sales",
  "/notifications": "/notifications",
  "/catalog": "/catalog-browser",
  "/catalog-browser": "/catalog-browser",
  "/users": "/users",
  "/user-list": "/users",
  "/login": "/(auth)/login",
};

export const resolveSiteHeaderBannerMobileRoute = (linkPath: string): string | null => {
  const normalized = normalizePath(linkPath.split("?")[0]?.split("#")[0] ?? linkPath);

  if (normalized === "/" || normalized === "/(tabs)") {
    return "/(tabs)";
  }

  const hubMatch = normalized.match(/^\/hub\/([^/?#]+)$/i);
  if (hubMatch?.[1]) {
    return `/hub/${decodeURIComponent(hubMatch[1])}`;
  }

  const productMatch = normalized.match(/^\/product\/([^/?#]+)$/i);
  if (productMatch?.[1]) {
    return `/product/${decodeURIComponent(productMatch[1])}`;
  }

  const userMatch = normalized.match(/^\/user\/([^/?#]+)$/i);
  if (userMatch?.[1]) {
    return `/user/${decodeURIComponent(userMatch[1])}`;
  }

  const raffleMatch = normalized.match(/^\/raffle\/([^/?#]+)$/i);
  if (raffleMatch?.[1]) {
    return `/raffle/${decodeURIComponent(raffleMatch[1])}`;
  }

  const sellerMatch = normalized.match(/^\/seller\/([^/?#]+)$/i);
  if (sellerMatch?.[1]) {
    return `/seller/${decodeURIComponent(sellerMatch[1])}`;
  }

  const staffHubMatch = normalized.match(
    /^\/(moderation-products|moderation-intro-ad|moderation-seller-categories|product-reports|product-promotions|staff-raffles|data-confirmation-requests|installment-moderation|installment-disputes|admin-orders|search-synonyms-admin|category-tree-admin|app-intro-admin|site-header-banner-admin|product-manage-toggle-display-admin|profile\/popular-products-admin)$/i,
  );
  if (staffHubMatch?.[1]) {
    const staffPathMap: Record<string, string> = {
      "moderation-products": "/hub/product-moderation",
      "moderation-intro-ad": "/hub/intro-ad-moderation",
      "moderation-seller-categories": "/hub/seller-personal-category-moderation",
      "product-reports": "/hub/product-reports",
      "product-promotions": "/hub/product-promotions",
      "staff-raffles": "/hub/raffles",
      "data-confirmation-requests": "/hub/data-confirmation-requests",
      "installment-moderation": "/hub/installment-moderation",
      "installment-disputes": "/hub/installment-disputes",
      "admin-orders": "/hub/admin-orders",
      "search-synonyms-admin": "/hub/search-synonyms-admin",
      "category-tree-admin": "/hub/category-tree-admin",
      "app-intro-admin": "/hub/app-intro-admin",
      "site-header-banner-admin": "/hub/site-header-banner-admin",
      "product-manage-toggle-display-admin": "/hub/product-manage-toggle-display-admin",
      "profile/popular-products-admin": "/hub/popular-products-admin",
    };
    return staffPathMap[staffHubMatch[1].toLowerCase()] ?? null;
  }

  return HUB_SECTION_PATHS[normalized.toLowerCase()] ?? HUB_SECTION_PATHS[normalized] ?? null;
};
