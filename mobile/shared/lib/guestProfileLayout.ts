/**
 * Паритет client `GuestProfilePanel.css` + `AuthHeroBanner.css`.
 */
export const GUEST_PROFILE_LAYOUT = {
  columnMaxWidth: 420,
  heroRadius: 32,
  bodyGap: 16,
  bodyMarginY: 36,
  bodyPadX: 16,
  titleFontSize: 24,
  subtitleFontSize: 16,
  legalFontSize: 14,
  legalPaddingY: 8,
} as const;

/**
 * Паритет client `MyProfilePage.css` / `myProfileMobileNavConstants.js`.
 * ≤900 — drawer/sheet; >900 — постоянный sidebar.
 * ≤640 — phone toggle + sheet справа.
 */
export const MY_PROFILE_DRAWER_LAYOUT_MAX_PX = 900;
export const MY_PROFILE_PHONE_LAYOUT_MAX_PX = 640;
/** 16.25rem */
export const MY_PROFILE_SIDEBAR_WIDTH = 260;
/** `.my-profile-page__layout { gap: 1rem }` */
export const MY_PROFILE_LAYOUT_GAP = 16;
/**
 * web `--my-profile-section-gap` — overview `__main` / `__body` / `user-profile-info`.
 * Live DOM ≤640: 6px.
 */
export const MY_PROFILE_SECTION_GAP = 6;
/**
 * web my-products / catalog sections `gap: 0.75rem` (не section-gap overview).
 */
export const MY_PROFILE_MAIN_GAP = 12;
/**
 * wide (>667) shell gutter = `--iz-space-4`.
 * Phone ≤640 — `SCREEN_CONTENT_INLINE_PADDING_PHONE` (8) через `useScreenLayout`.
 */
export const MY_PROFILE_SHELL_PAD_X = 16;

/** Sidebar + gap — вычитаем из layoutWidth при расчёте сетки в hub main (>900). */
export const resolveProfileHubMainReservedWidth = (isDrawerLayout: boolean): number =>
  isDrawerLayout ? 0 : MY_PROFILE_SIDEBAR_WIDTH + MY_PROFILE_LAYOUT_GAP;

/**
 * Паритет client `MyProfilePage.css` overview ≤640 (live DOM).
 * Spacing между banner / quick / info / sections = `--my-profile-section-gap` (6).
 */
export const PROFILE_OVERVIEW_LAYOUT = {
  /** web `--iz-space-1` */
  shareRowGap: 4,
  /**
   * web `.my-profile-page__body .user-details-modal__banner { margin-bottom: 0 }`
   * + body `gap: 6` — отступ даёт parent gap, не margin.
   */
  shareRowMarginTop: 0,
  /** web `height: 2.125rem` */
  notificationsBtnHeight: 34,
  /** web storefront `gap: 0.4rem` */
  storefrontBtnGap: 6.4,
  /** web `.my-profile-page__body > .user-profile-info { margin-top: 0 }` */
  infoMarginTop: 0,
  /** web body > info `gap: var(--my-profile-section-gap)` */
  infoSectionsGap: MY_PROFILE_SECTION_GAP,
  /** web `--user-profile-section-radius: 24px` */
  infoSectionRadius: 24,
  footerGap: 12,
  footerMarginTop: 8,
  /** web phone ≤640 `.my-profile-page__mobile-nav-toggle { border-radius: 20px }` */
  sectionToggleRadius: 20,
  /** web `--my-profile-surface-radius` (641–900 toggle) */
  sectionToggleRadiusTablet: 24,
  sectionTogglePaddingY: 12,
  sectionTogglePaddingX: 14,
  sectionToggleBorderWidth: 2,
  sectionToggleIconSize: 36,
  sectionToggleIconRadius: 10,
  mainGap: MY_PROFILE_SECTION_GAP,
  scrollPaddingTop: 0,
} as const;

/** Паритет `.my-profile-page__sidebar` / `__sidebar-head` / `__nav`. */
export const MY_PROFILE_SIDEBAR_LAYOUT = {
  /** `border-radius: 0.9rem` */
  radius: 14,
  headPaddingTop: 16,
  headPaddingX: 16,
  headPaddingBottom: 11,
  /** `.my-profile-page__nav { padding: 0.65rem 0.5rem }` */
  navPaddingY: 10,
  navPaddingX: 8,
  /** `.my-profile-page__nav { gap: 0.35rem }` — только между группами, не head↔nav */
  navGap: 6,
  /** `.nav-group + .nav-group { margin-top: 0.35rem }` */
  groupMarginTop: 6,
  /** `.nav-group + .nav-group { padding-top: 0.5rem }` */
  groupPaddingTop: 8,
  groupLabelMarginBottom: 6,
  groupLabelPaddingX: 9,
  itemGap: 2,
  itemPaddingY: 8,
  itemPaddingX: 10,
  itemRadius: 10,
  /** Web `.my-profile-page__title { font-size: 1.12rem }` → 17.92 */
  titleFontSize: 17.92,
} as const;

/** Паритет `MyProductsShelvesPanel.css` + `__main { gap: 0.75rem }` stack. */
export const MY_PRODUCTS_PAGE_LAYOUT = {
  /** `.my-profile-page__main { gap: 0.75rem }` between shelves / toolbar / list */
  stackGap: MY_PROFILE_MAIN_GAP,
  /** `.my-products-catalog-section__list { gap: 0.75rem }` (my-products override) */
  listGap: MY_PROFILE_MAIN_GAP,
  /** `.my-products-shelves { padding: 0.85rem 0.9rem }` */
  shelvesPaddingY: 14,
  shelvesPaddingX: 14,
  /** `border-radius: 1rem` */
  shelvesRadius: 16,
  /** `.my-products-shelves__toggle { gap: 0.75rem }` */
  shelvesToggleGap: 12,
} as const;

/** Паритет `MySalesPage.css` — `.my-sales-page { gap: 0.85rem }`, list gap 4px. */
export const MY_SALES_PAGE_LAYOUT = {
  stackGap: 13.6,
  listGap: 4,
  toolbarPadding: 12,
  toolbarRadius: 16,
  toolbarGap: 8,
} as const;

/** Паритет `MyOrdersPage.css` — `.my-orders-page { gap: 0.85rem }`, list gap 4px. */
export const MY_ORDERS_PAGE_LAYOUT = {
  stackGap: 13.6,
  listGap: 4,
  toolbarPadding: 12,
  toolbarRadius: 16,
  toolbarGap: 8,
} as const;

/** Паритет `AuctionPage.css` — `.auction-page { gap: 0.85rem }`, list gap 4px. */
export const AUCTION_PAGE_LAYOUT = {
  stackGap: 13.6,
  listGap: 4,
  toolbarPadding: 12,
  toolbarRadius: 16,
  toolbarGap: 8,
} as const;

/** Паритет `InstallmentPageLayout.css` — `.installment-page { gap: 0.85rem }`. */
export const INSTALLMENT_PAGE_LAYOUT = {
  stackGap: 13.6,
  listGap: 4,
  toolbarPadding: 12,
  toolbarRadius: 16,
  toolbarGap: 8,
} as const;

/** Паритет `SubscriptionsPage.css` / `WishlistPage.css` hero list tabs. */
export const SUBSCRIPTIONS_PAGE_LAYOUT = {
  headerGap: 14,
  headerMarginBottom: 10,
  listGap: 4,
} as const;

export const WISHLIST_PAGE_LAYOUT = {
  headerGap: 14,
  headerMarginBottom: 10,
  listGap: 4,
} as const;

/** Паритет account stack tabs: `.premium-page`, `.data-confirmation-page` — `gap: 0.875rem`. */
export const PROFILE_ACCOUNT_STACK_PAGE_LAYOUT = {
  stackGap: 14,
} as const;

/** Admin hub panels inside `.my-profile-page__main` — без page gutter на desktop. */
export const ADMIN_PANEL_PAGE_LAYOUT = {
  stackGap: MY_PROFILE_MAIN_GAP,
  listGap: 8,
} as const;

/** Паритет `AdminOrdersPage.css` — `.admin-orders-page { gap: 0.65rem }`. */
export const ADMIN_ORDERS_PAGE_LAYOUT = {
  stackGap: 10.4,
  listGap: 4,
  toolbarPadding: 10.4,
  toolbarPaddingHorizontal: 12,
  toolbarRadius: 10.4,
  toolbarGap: 8,
} as const;
