import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import {
  PROFILE_ACCOUNT_SECTION_ORDER,
  PROFILE_MANAGEMENT_SECTION_ORDER,
  PROFILE_STAFF_SECTION_ORDER,
  PROFILE_TRADE_SECTION_ORDER,
} from "@izibuy/shared-lib";
import { enrichProfileNavItem } from "./profileNavItemMeta.js";
import { PROFILE_TAB_OVERVIEW } from "../../../widgets/app-shell/lib/profileTabs.js";

/** @typedef {import("../ui/ProfileSidebar.jsx").ProfileNavGroup} ProfileNavGroup */

/**
 * @param {object} params
 * @returns {ProfileNavGroup[]}
 */
export function buildProfileNavGroups({
  canUseCreateRaffle,
  canUseMyProducts,
  canUseMySales,
  canUseMyOrders,
  canUseAuction,
  canUseInstallmentPayments,
  canUseInstallmentSales,
  canUseProductModeration,
  canUseProductReports,
  canUseProductPromotions,
  canUseRaffles,
  canUseDataConfirmationQueue,
  canUseInstallmentModeration,
  canUseInstallmentDisputes,
  canUseAdminOrders,
  canUseSearchSynonymsAdmin,
  canUseCategoryTreeAdmin,
  canUseAppIntroAdmin,
  canUseSiteHeaderBannerAdmin,
  canUseProductManageToggleDisplayAdmin,
  canUsePopularProductsAdmin,
  canUseSubscriptions,
  canUseWishlist,
  canUseDataConfirmation,
  isUserDataConfirmed,
  canUsePremium,
  canUseLoyaltyPoints,
  canUseAdvertising,
  canUseEditProfile,
  showEditOnBanner,
  pendingMySalesActionCount,
  pendingMyOrdersActionCount,
  pendingIncomingPriceOffersCount,
  pendingInstallmentBuyerActionCount,
  pendingInstallmentSellerActionCount,
  pendingModerationCount,
  pendingIntroAdModerationCount,
  pendingSellerPersonalCategoryModerationCount,
  pendingProductReportsCount,
  pendingProductPromotionsCount,
  pendingRafflesCount,
  pendingDataConfirmationCount,
  pendingInstallmentModerationCount,
  pendingInstallmentDisputesCount,
  onTabChange,
  onCreateRaffleClick,
  onMyProductsClick,
  onMySalesClick,
  onMyOrdersClick,
  onAuctionClick,
  onInstallmentPaymentsClick,
  onInstallmentSalesClick,
  onProductModerationClick,
  onIntroAdModerationClick,
  onSellerPersonalCategoryModerationClick,
  onProductReportsClick,
  onProductPromotionsClick,
  onRafflesClick,
  onDataConfirmationQueueClick,
  onInstallmentModerationClick,
  onInstallmentDisputesClick,
  onAdminOrdersClick,
  onSearchSynonymsAdminClick,
  onCategoryTreeAdminClick,
  onAppIntroAdminClick,
  onSiteHeaderBannerAdminClick,
  onProductManageToggleDisplayAdminClick,
  onPopularProductsAdminClick,
  onSubscriptionsClick,
  onWishlistClick,
  onDataConfirmationClick,
  onPremiumClick,
  onLoyaltyPointsClick,
  onAdvertisingClick,
  onEditProfileClick,
}) {
  /** @param {string} tab @param {() => void} [action] */
  const selectTab = (tab, action) => {
    onTabChange?.(tab);
    action?.();
  };

  /**
   * @param {Array<{ tab: string }>} items
   * @param {readonly string[]} order
   */
  const orderNavItems = (items, order) => {
    const indexByTab = new Map(order.map((tab, index) => [tab, index]));
    return [...items].sort((left, right) => {
      const leftIndex = indexByTab.get(left.tab) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = indexByTab.get(right.tab) ?? Number.MAX_SAFE_INTEGER;
      return leftIndex - rightIndex;
    });
  };

  /** @type {ProfileNavGroup[]} */
  const groups = [
    {
      id: "overview",
      items: [
        {
          tab: PROFILE_TAB_OVERVIEW,
          label: MY_PROFILE_PAGE_UI.TAB_OVERVIEW,
          onClick: () => selectTab(PROFILE_TAB_OVERVIEW),
        },
      ],
    },
    {
      id: "trade",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_TRADE,
      items: orderNavItems([
        {
          tab: "my-products",
          label: MY_PROFILE_PAGE_UI.TAB_MY_PRODUCTS,
          disabled: !canUseMyProducts,
          onClick: () => selectTab("my-products", onMyProductsClick),
        },
        {
          tab: "my-sales",
          label: MY_PROFILE_PAGE_UI.TAB_MY_SALES,
          badgeCount: pendingMySalesActionCount,
          disabled: !canUseMySales,
          onClick: () => selectTab("my-sales", onMySalesClick),
        },
        {
          tab: "my-orders",
          label: MY_PROFILE_PAGE_UI.TAB_MY_ORDERS,
          badgeCount: pendingMyOrdersActionCount,
          disabled: !canUseMyOrders,
          onClick: () => selectTab("my-orders", onMyOrdersClick),
        },
        ...(canUseAuction
          ? [
              {
                tab: "auction",
                label: MY_PROFILE_PAGE_UI.TAB_AUCTION,
                badgeCount: pendingIncomingPriceOffersCount,
                onClick: () => selectTab("auction", onAuctionClick),
              },
            ]
          : []),
        ...(canUseInstallmentPayments
          ? [
              {
                tab: "installment-payments",
                label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_PAYMENTS,
                badgeCount: pendingInstallmentBuyerActionCount,
                onClick: () =>
                  selectTab("installment-payments", onInstallmentPaymentsClick),
              },
            ]
          : []),
        ...(canUseInstallmentSales
          ? [
              {
                tab: "installment-sales",
                label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_SALES,
                badgeCount: pendingInstallmentSellerActionCount,
                onClick: () => selectTab("installment-sales", onInstallmentSalesClick),
              },
            ]
          : []),
      ], PROFILE_TRADE_SECTION_ORDER),
    },
    {
      id: "account",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_ACCOUNT,
      items: orderNavItems([
        {
          tab: "subscriptions",
          label: MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS,
          disabled: !canUseSubscriptions,
          onClick: () => selectTab("subscriptions", onSubscriptionsClick),
        },
        {
          tab: "wishlist",
          label: MY_PROFILE_PAGE_UI.TAB_WISHLIST,
          disabled: !canUseWishlist,
          onClick: () => selectTab("wishlist", onWishlistClick),
        },
        ...(canUseDataConfirmation
          ? [
              {
                tab: "data-confirmation",
                label: MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION,
                showAlert: !isUserDataConfirmed,
                onClick: () => selectTab("data-confirmation", onDataConfirmationClick),
              },
            ]
          : []),
        ...(canUsePremium
          ? [
              {
                tab: "premium",
                label: MY_PROFILE_PAGE_UI.TAB_PREMIUM,
                onClick: () => selectTab("premium", onPremiumClick),
              },
            ]
          : []),
        ...(canUseLoyaltyPoints
          ? [
              {
                tab: "loyalty-points",
                label: MY_PROFILE_PAGE_UI.TAB_LOYALTY_POINTS,
                onClick: () => selectTab("loyalty-points", onLoyaltyPointsClick),
              },
            ]
          : []),
        ...(canUseAdvertising
          ? [
              {
                tab: "advertising",
                label: MY_PROFILE_PAGE_UI.TAB_ADVERTISING,
                onClick: () => selectTab("advertising", onAdvertisingClick),
              },
            ]
          : []),
        ...(canUseEditProfile && !showEditOnBanner
          ? [
              {
                tab: "edit-profile",
                label: MY_PROFILE_PAGE_UI.EDIT_PROFILE,
                onClick: () => onEditProfileClick?.(),
              },
            ]
          : []),
      ], PROFILE_ACCOUNT_SECTION_ORDER),
    },
  ];

  const staffItems = [
    ...(canUseCreateRaffle
      ? [
          {
            tab: "create-raffle",
            label: MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE,
            variant: "cta",
            onClick: () => onCreateRaffleClick?.(),
          },
        ]
      : []),
    ...(canUseProductModeration
      ? [
          {
            tab: "product-moderation",
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_MODERATION,
            badgeCount: pendingModerationCount,
            onClick: () => selectTab("product-moderation", onProductModerationClick),
          },
          {
            tab: "intro-ad-moderation",
            label: MY_PROFILE_PAGE_UI.TAB_INTRO_AD_MODERATION,
            badgeCount: pendingIntroAdModerationCount,
            onClick: () => selectTab("intro-ad-moderation", onIntroAdModerationClick),
          },
        ]
      : []),
    ...(canUseProductReports
      ? [
          {
            tab: "product-reports",
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_REPORTS,
            badgeCount: pendingProductReportsCount,
            onClick: () => selectTab("product-reports", onProductReportsClick),
          },
        ]
      : []),
    ...(canUseProductPromotions
      ? [
          {
            tab: "product-promotions",
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_PROMOTIONS,
            badgeCount: pendingProductPromotionsCount,
            onClick: () => selectTab("product-promotions", onProductPromotionsClick),
          },
        ]
      : []),
    ...(canUseRaffles
      ? [
          {
            tab: "raffles",
            label: MY_PROFILE_PAGE_UI.TAB_RAFFLES,
            badgeCount: pendingRafflesCount,
            onClick: () => selectTab("raffles", onRafflesClick),
          },
        ]
      : []),
    ...(canUseDataConfirmationQueue
      ? [
          {
            tab: "data-confirmation-requests",
            label: MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION,
            badgeCount: pendingDataConfirmationCount,
            onClick: () =>
              selectTab("data-confirmation-requests", onDataConfirmationQueueClick),
          },
        ]
      : []),
    ...(canUseInstallmentModeration
      ? [
          {
            tab: "installment-moderation",
            label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_MODERATION,
            badgeCount: pendingInstallmentModerationCount,
            onClick: () =>
              selectTab("installment-moderation", onInstallmentModerationClick),
          },
        ]
      : []),
    ...(canUseInstallmentDisputes
      ? [
          {
            tab: "installment-disputes",
            label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_DISPUTES,
            badgeCount: pendingInstallmentDisputesCount,
            onClick: () => selectTab("installment-disputes", onInstallmentDisputesClick),
          },
        ]
      : []),
  ];

  const managementItems = [
    ...(canUseCategoryTreeAdmin
      ? [
          {
            tab: "category-tree-admin",
            label: MY_PROFILE_PAGE_UI.TAB_CATEGORY_TREE_ADMIN,
            onClick: () => selectTab("category-tree-admin", onCategoryTreeAdminClick),
          },
        ]
      : []),
    ...(canUsePopularProductsAdmin
      ? [
          {
            tab: "popular-products-admin",
            label: MY_PROFILE_PAGE_UI.TAB_POPULAR_PRODUCTS_ADMIN,
            onClick: () =>
              selectTab("popular-products-admin", onPopularProductsAdminClick),
          },
        ]
      : []),
    ...(canUseAppIntroAdmin
      ? [
          {
            tab: "app-intro-admin",
            label: MY_PROFILE_PAGE_UI.TAB_APP_INTRO_ADMIN,
            onClick: () => selectTab("app-intro-admin", onAppIntroAdminClick),
          },
        ]
      : []),
    ...(canUseSiteHeaderBannerAdmin
      ? [
          {
            tab: "site-header-banner-admin",
            label: MY_PROFILE_PAGE_UI.TAB_SITE_HEADER_BANNER_ADMIN,
            onClick: () =>
              selectTab("site-header-banner-admin", onSiteHeaderBannerAdminClick),
          },
        ]
      : []),
    ...(canUseProductManageToggleDisplayAdmin
      ? [
          {
            tab: "product-manage-toggle-display-admin",
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_MANAGE_TOGGLE_DISPLAY_ADMIN,
            onClick: () =>
              selectTab(
                "product-manage-toggle-display-admin",
                onProductManageToggleDisplayAdminClick,
              ),
          },
        ]
      : []),
    ...(canUseSearchSynonymsAdmin
      ? [
          {
            tab: "search-synonyms-admin",
            label: MY_PROFILE_PAGE_UI.TAB_SEARCH_SYNONYMS_ADMIN,
            onClick: () => selectTab("search-synonyms-admin", onSearchSynonymsAdminClick),
          },
        ]
      : []),
    ...(canUseAdminOrders
      ? [
          {
            tab: "admin-orders",
            label: MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS,
            onClick: () => selectTab("admin-orders", onAdminOrdersClick),
          },
        ]
      : []),
  ];

  const managementSectionIds = new Set(PROFILE_MANAGEMENT_SECTION_ORDER);

  const orderedStaffItems = orderNavItems(staffItems, PROFILE_STAFF_SECTION_ORDER).filter(
    (item) => !managementSectionIds.has(item.tab),
  );
  const orderedManagementItems = orderNavItems(
    managementItems,
    PROFILE_MANAGEMENT_SECTION_ORDER,
  );

  if (orderedStaffItems.length > 0) {
    groups.push({
      id: "staff",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_STAFF,
      items: orderedStaffItems,
    });
  }

  if (orderedManagementItems.length > 0) {
    groups.push({
      id: "management",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_MANAGEMENT,
      items: orderedManagementItems,
    });
  }

  return groups.map((group) => ({
    ...group,
    items: group.items.map(enrichProfileNavItem),
  }));
}
