import {
  PROFILE_SECTION_ADMIN_ORDERS,
  PROFILE_SECTION_APP_INTRO_ADMIN,
  PROFILE_SECTION_CATEGORY_TREE_ADMIN,
  PROFILE_SECTION_DATA_CONFIRMATION_REQUESTS,
  PROFILE_SECTION_INSTALLMENT_DISPUTES,
  PROFILE_SECTION_INSTALLMENT_MODERATION,
  PROFILE_SECTION_INTRO_AD_MODERATION,
  PROFILE_SECTION_POPULAR_PRODUCTS_ADMIN,
  PROFILE_SECTION_PRODUCT_MODERATION,
  PROFILE_SECTION_PRODUCT_PROMOTIONS,
  PROFILE_SECTION_PRODUCT_REPORTS,
  PROFILE_SECTION_RAFFLES,
  PROFILE_SECTION_SEARCH_SYNONYMS_ADMIN,
  PROFILE_SECTION_SELLER_PERSONAL_CATEGORY_MODERATION,
  PROFILE_STAFF_SECTION_ORDER,
  type ProfileSectionId,
} from "./profileSections.js";

/**
 * Web SPA paths for staff profile sections (G.1).
 * Must stay in sync with `client/src/shared/lib/homeMainViewPaths.js`.
 *
 * Sections in PROFILE_STAFF_IN_APP_SECTION_IDS open in mobile hub (`/hub/<section>`).
 * Remaining entries in PROFILE_SECTION_WEB_PATH are web-only fallbacks (browser).
 */
export const PROFILE_STAFF_IN_APP_SECTION_IDS = [
  ...PROFILE_STAFF_SECTION_ORDER,
] as const;

export type ProfileStaffInAppSectionId =
  (typeof PROFILE_STAFF_IN_APP_SECTION_IDS)[number];

export const isProfileStaffInAppSection = (
  sectionId: ProfileSectionId,
): sectionId is ProfileStaffInAppSectionId =>
  (PROFILE_STAFF_IN_APP_SECTION_IDS as readonly string[]).includes(sectionId);

export const PROFILE_SECTION_WEB_PATH = {
  [PROFILE_SECTION_PRODUCT_MODERATION]: "/moderation-products",
  [PROFILE_SECTION_INTRO_AD_MODERATION]: "/moderation-intro-ad",
  [PROFILE_SECTION_SELLER_PERSONAL_CATEGORY_MODERATION]: "/moderation-seller-categories",
  [PROFILE_SECTION_PRODUCT_REPORTS]: "/product-reports",
  [PROFILE_SECTION_PRODUCT_PROMOTIONS]: "/product-promotions",
  [PROFILE_SECTION_RAFFLES]: "/staff-raffles",
  [PROFILE_SECTION_DATA_CONFIRMATION_REQUESTS]: "/data-confirmation-requests",
  [PROFILE_SECTION_INSTALLMENT_MODERATION]: "/installment-moderation",
  [PROFILE_SECTION_INSTALLMENT_DISPUTES]: "/installment-disputes",
  [PROFILE_SECTION_ADMIN_ORDERS]: "/admin-orders",
  [PROFILE_SECTION_SEARCH_SYNONYMS_ADMIN]: "/search-synonyms-admin",
  [PROFILE_SECTION_CATEGORY_TREE_ADMIN]: "/category-tree-admin",
  [PROFILE_SECTION_APP_INTRO_ADMIN]: "/app-intro-admin",
  [PROFILE_SECTION_POPULAR_PRODUCTS_ADMIN]: "/profile/popular-products-admin",
} as const satisfies Partial<Record<ProfileSectionId, string>>;

export type ProfileStaffWebOnlySectionId = keyof typeof PROFILE_SECTION_WEB_PATH;

export const isProfileStaffWebOnlySection = (
  sectionId: ProfileSectionId,
): sectionId is ProfileStaffWebOnlySectionId =>
  sectionId in PROFILE_SECTION_WEB_PATH && !isProfileStaffInAppSection(sectionId);

export const PROFILE_STAFF_WEB_ONLY_SECTION_IDS = PROFILE_STAFF_SECTION_ORDER.filter(
  (sectionId): sectionId is ProfileStaffWebOnlySectionId =>
    isProfileStaffWebOnlySection(sectionId),
);

export const resolveProfileStaffWebPath = (
  sectionId: ProfileStaffWebOnlySectionId,
): string => PROFILE_SECTION_WEB_PATH[sectionId];
