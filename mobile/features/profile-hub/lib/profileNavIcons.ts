import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ProfileSectionId } from "@izibuy/shared-lib";

type ProfileNavIconName = keyof typeof MaterialIcons.glyphMap;

const PROFILE_NAV_ICON_MAP: Partial<Record<ProfileSectionId | "logout", ProfileNavIconName>> = {
  overview: "dashboard",
  "my-products": "inventory-2",
  "my-sales": "store",
  "my-orders": "shopping-bag",
  auction: "gavel",
  "installment-payments": "credit-card",
  "installment-sales": "account-balance-wallet",
  subscriptions: "groups",
  wishlist: "favorite",
  "data-confirmation": "verified-user",
  premium: "workspace-premium",
  "loyalty-points": "auto-awesome",
  advertising: "campaign",
  "edit-profile": "edit",
  "create-raffle": "card-giftcard",
  "product-moderation": "fact-check",
  "intro-ad-moderation": "campaign",
  "seller-personal-category-moderation": "account-tree",
  "product-reports": "flag",
  "product-promotions": "trending-up",
  raffles: "confirmation-number",
  "data-confirmation-requests": "person-search",
  "installment-disputes": "report-problem",
  "admin-orders": "format-list-numbered",
  "search-synonyms-admin": "search",
  "category-tree-admin": "account-tree",
  "app-intro-admin": "movie",
  "site-header-banner-admin": "panorama",
  "product-manage-toggle-display-admin": "toggle-on",
  "popular-products-admin": "star",
  logout: "logout",
};

export const resolveProfileNavIconName = (
  sectionId: ProfileSectionId | "logout",
): ProfileNavIconName => PROFILE_NAV_ICON_MAP[sectionId] ?? "chevron-right";
