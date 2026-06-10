import { MY_PROFILE_PAGE_UI } from "../../../shared/config/appUiCopy.js";
import { enrichProfileNavItem } from "./profileNavItemMeta.js";
import { PROFILE_TAB_OVERVIEW } from "./profileTabs.js";

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
  canUseRaffles,
  canUseDataConfirmationQueue,
  canUseInstallmentModeration,
  canUseInstallmentDisputes,
  canUseAdminOrders,
  canUseSearchSynonymsAdmin,
  canUseCategoryTreeAdmin,
  canUseAppIntroAdmin,
  canUseSubscriptions,
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
  onRafflesClick,
  onDataConfirmationQueueClick,
  onInstallmentModerationClick,
  onInstallmentDisputesClick,
  onAdminOrdersClick,
  onSearchSynonymsAdminClick,
  onCategoryTreeAdminClick,
  onAppIntroAdminClick,
  onSubscriptionsClick,
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
      items: [
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
      ],
    },
    {
      id: "account",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_ACCOUNT,
      items: [
        {
          tab: "subscriptions",
          label: MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS,
          disabled: !canUseSubscriptions,
          onClick: () => selectTab("subscriptions", onSubscriptionsClick),
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
      ],
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
          {
            tab: "seller-personal-category-moderation",
            label: MY_PROFILE_PAGE_UI.TAB_SELLER_PERSONAL_CATEGORY_MODERATION,
            badgeCount: pendingSellerPersonalCategoryModerationCount,
            onClick: () =>
              selectTab(
                "seller-personal-category-moderation",
                onSellerPersonalCategoryModerationClick,
              ),
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
    ...(canUseAdminOrders
      ? [
          {
            tab: "admin-orders",
            label: MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS,
            onClick: () => selectTab("admin-orders", onAdminOrdersClick),
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
    ...(canUseCategoryTreeAdmin
      ? [
          {
            tab: "category-tree-admin",
            label: MY_PROFILE_PAGE_UI.TAB_CATEGORY_TREE_ADMIN,
            onClick: () => selectTab("category-tree-admin", onCategoryTreeAdminClick),
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
  ];

  if (staffItems.length > 0) {
    groups.push({
      id: "staff",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_STAFF,
      items: staffItems,
    });
  }

  return groups.map((group) => ({
    ...group,
    items: group.items.map(enrichProfileNavItem),
  }));
}
