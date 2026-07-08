export const STAFF_SECTION_IDS = [
  "admin-orders",
  "search-synonyms-admin",
  "category-tree-admin",
  "app-intro-admin",
  "site-header-banner-admin",
  "popular-products-admin",
  "product-moderation",
  "intro-ad-moderation",
  "seller-personal-category-moderation",
  "product-reports",
  "product-promotions",
  "staff-raffles",
  "data-confirmation-requests",
  "installment-moderation",
  "installment-disputes",
] as const;

export type StaffSectionId = (typeof STAFF_SECTION_IDS)[number];

type StaffAccessRule = {
  requireAdmin: boolean;
  requireModerator: boolean;
};

const STAFF_ACCESS: Record<StaffSectionId, StaffAccessRule> = {
  "admin-orders": { requireAdmin: true, requireModerator: false },
  "search-synonyms-admin": { requireAdmin: true, requireModerator: false },
  "category-tree-admin": { requireAdmin: true, requireModerator: false },
  "app-intro-admin": { requireAdmin: true, requireModerator: false },
  "site-header-banner-admin": { requireAdmin: false, requireModerator: true },
  "popular-products-admin": { requireAdmin: true, requireModerator: false },
  "product-moderation": { requireAdmin: false, requireModerator: true },
  "intro-ad-moderation": { requireAdmin: false, requireModerator: true },
  "seller-personal-category-moderation": { requireAdmin: false, requireModerator: true },
  "product-reports": { requireAdmin: false, requireModerator: true },
  "product-promotions": { requireAdmin: false, requireModerator: true },
  "staff-raffles": { requireAdmin: false, requireModerator: true },
  "data-confirmation-requests": { requireAdmin: false, requireModerator: true },
  "installment-moderation": { requireAdmin: false, requireModerator: true },
  "installment-disputes": { requireAdmin: false, requireModerator: true },
};

export const isStaffSectionId = (sectionId: string): sectionId is StaffSectionId =>
  (STAFF_SECTION_IDS as readonly string[]).includes(sectionId);

export const isStaffSectionAllowed = (
  sectionId: StaffSectionId,
  access: { isAdmin: boolean; canModerate: boolean },
): boolean => {
  const rule = STAFF_ACCESS[sectionId];
  return (
    (rule.requireAdmin ? access.isAdmin : true) &&
    (rule.requireModerator ? access.canModerate : true)
  );
};
