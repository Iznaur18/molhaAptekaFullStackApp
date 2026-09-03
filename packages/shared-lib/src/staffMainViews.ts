export const STAFF_SECTION_IDS = [
  "admin-orders",
  "admin-analytics",
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
  "courier-moderation",
  "safe-deal-moderation",
  "installment-disputes",
  "shipment-disputes",
  "shipping-carriers",
] as const;

export type StaffSectionId = (typeof STAFF_SECTION_IDS)[number];

type StaffAccessRule = {
  requireAdmin: boolean;
  requireModerator: boolean;
};

const STAFF_ACCESS: Record<StaffSectionId, StaffAccessRule> = {
  "admin-orders": { requireAdmin: true, requireModerator: false },
  "admin-analytics": { requireAdmin: true, requireModerator: false },
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
  // Модерация курьеров — как модерация товаров: админ и модератор.
  "courier-moderation": { requireAdmin: false, requireModerator: true },
  // Сверка ИНН с ЕГРЮЛ — та же работа, что и модерация курьеров.
  "safe-deal-moderation": { requireAdmin: false, requireModerator: true },
  "installment-disputes": { requireAdmin: false, requireModerator: true },
  // Споры по доставке разбирают те же, кто модерирует курьеров.
  "shipment-disputes": { requireAdmin: false, requireModerator: true },
  // Включение служб — решение о платформе целиком, не модераторское.
  "shipping-carriers": { requireAdmin: true, requireModerator: false },
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
