import { MY_PROFILE_PAGE_UI } from "@/shared/config/appUiCopy";

import {
  PROFILE_SECTION_OVERVIEW,
  type ProfileSectionId,
} from "./profileSections";
import type { ProfileHubAccess } from "./useProfileHubAccess";

export type ProfileNavItem = {
  sectionId: ProfileSectionId;
  label: string;
  disabled?: boolean;
  badgeCount?: number;
  showAlert?: boolean;
  variant?: "default" | "cta";
};

export type ProfileNavGroup = {
  id: string;
  label?: string;
  items: ProfileNavItem[];
};

export const buildProfileNavGroups = (
  access: ProfileHubAccess,
  badgeCounts: Partial<Record<ProfileSectionId, number>> = {},
): ProfileNavGroup[] => {
  const badge = (sectionId: ProfileSectionId): number | undefined => {
    const count = badgeCounts[sectionId] ?? 0;
    return count > 0 ? count : undefined;
  };

  const groups: ProfileNavGroup[] = [
    {
      id: "overview",
      items: [
        {
          sectionId: PROFILE_SECTION_OVERVIEW,
          label: MY_PROFILE_PAGE_UI.TAB_OVERVIEW,
        },
      ],
    },
    {
      id: "trade",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_TRADE,
      items: [
        {
          sectionId: "my-products",
          label: MY_PROFILE_PAGE_UI.TAB_MY_PRODUCTS,
          disabled: !access.canUseMyProducts,
        },
        {
          sectionId: "my-sales",
          label: MY_PROFILE_PAGE_UI.TAB_MY_SALES,
          disabled: !access.canUseMySales,
          badgeCount: badgeCounts["my-sales"],
        },
        {
          sectionId: "my-orders",
          label: MY_PROFILE_PAGE_UI.TAB_MY_ORDERS,
          disabled: !access.canUseMyOrders,
          badgeCount: badgeCounts["my-orders"],
        },
        ...(access.canUseAuction
          ? [
              {
                sectionId: "auction" as const,
                label: MY_PROFILE_PAGE_UI.TAB_AUCTION,
                badgeCount: badgeCounts.auction,
              },
            ]
          : []),
        ...(access.canUseInstallmentPayments
          ? [
              {
                sectionId: "installment-payments" as const,
                label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_PAYMENTS,
                badgeCount: badgeCounts["installment-payments"],
              },
            ]
          : []),
        ...(access.canUseInstallmentSales
          ? [
              {
                sectionId: "installment-sales" as const,
                label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_SALES,
                badgeCount: badgeCounts["installment-sales"],
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
          sectionId: "subscriptions",
          label: MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS,
          disabled: !access.canUseSubscriptions,
        },
        {
          sectionId: "wishlist",
          label: MY_PROFILE_PAGE_UI.TAB_WISHLIST,
          disabled: !access.canUseWishlist,
        },
        ...(access.canUseDataConfirmation
          ? [
              {
                sectionId: "data-confirmation" as const,
                label: MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION,
                showAlert: !access.isUserDataConfirmed,
              },
            ]
          : []),
        ...(access.canUsePremium
          ? [
              {
                sectionId: "premium" as const,
                label: MY_PROFILE_PAGE_UI.TAB_PREMIUM,
              },
            ]
          : []),
        ...(access.canUseLoyaltyPoints
          ? [
              {
                sectionId: "loyalty-points" as const,
                label: MY_PROFILE_PAGE_UI.TAB_LOYALTY_POINTS,
              },
            ]
          : []),
        ...(access.canUseAdvertising
          ? [
              {
                sectionId: "advertising" as const,
                label: MY_PROFILE_PAGE_UI.TAB_ADVERTISING,
              },
            ]
          : []),
        ...(access.canUseEditProfile
          ? [
              {
                sectionId: "edit-profile" as const,
                label: MY_PROFILE_PAGE_UI.EDIT_PROFILE,
              },
            ]
          : []),
      ],
    },
  ];

  const staffItems: ProfileNavItem[] = [
    ...(access.canUseCreateRaffle
      ? [
          {
            sectionId: "create-raffle" as const,
            label: MY_PROFILE_PAGE_UI.TAB_CREATE_RAFFLE,
            variant: "cta" as const,
          },
        ]
      : []),
    ...(access.canUseProductModeration
      ? [
          {
            sectionId: "product-moderation" as const,
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_MODERATION,
            badgeCount: badgeCounts["product-moderation"],
          },
          {
            sectionId: "intro-ad-moderation" as const,
            label: MY_PROFILE_PAGE_UI.TAB_INTRO_AD_MODERATION,
            badgeCount: badgeCounts["intro-ad-moderation"],
          },
          {
            sectionId: "seller-personal-category-moderation" as const,
            label: MY_PROFILE_PAGE_UI.TAB_SELLER_PERSONAL_CATEGORY_MODERATION,
            badgeCount: badgeCounts["seller-personal-category-moderation"],
          },
        ]
      : []),
    ...(access.canUseProductReports
      ? [
          {
            sectionId: "product-reports" as const,
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_REPORTS,
            badgeCount: badgeCounts["product-reports"],
          },
        ]
      : []),
    ...(access.canUseProductPromotions
      ? [
          {
            sectionId: "product-promotions" as const,
            label: MY_PROFILE_PAGE_UI.TAB_PRODUCT_PROMOTIONS,
            badgeCount: badgeCounts["product-promotions"],
          },
        ]
      : []),
    ...(access.canUseRaffles
      ? [
          {
            sectionId: "raffles" as const,
            label: MY_PROFILE_PAGE_UI.TAB_RAFFLES,
            badgeCount: badgeCounts.raffles,
          },
        ]
      : []),
    ...(access.canUseDataConfirmationQueue
      ? [
          {
            sectionId: "data-confirmation-requests" as const,
            label: MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION,
            badgeCount: badgeCounts["data-confirmation-requests"],
          },
        ]
      : []),
    ...(access.canUseInstallmentModeration
      ? [
          {
            sectionId: "installment-moderation" as const,
            label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_MODERATION,
            badgeCount: badgeCounts["installment-moderation"],
          },
        ]
      : []),
    ...(access.canUseInstallmentDisputes
      ? [
          {
            sectionId: "installment-disputes" as const,
            label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_DISPUTES,
            badgeCount: badgeCounts["installment-disputes"],
          },
        ]
      : []),
    ...(access.canUseAdminOrders
      ? [
          {
            sectionId: "admin-orders" as const,
            label: MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS,
          },
        ]
      : []),
    ...(access.canUseSearchSynonymsAdmin
      ? [
          {
            sectionId: "search-synonyms-admin" as const,
            label: MY_PROFILE_PAGE_UI.TAB_SEARCH_SYNONYMS_ADMIN,
          },
        ]
      : []),
    ...(access.canUseCategoryTreeAdmin
      ? [
          {
            sectionId: "category-tree-admin" as const,
            label: MY_PROFILE_PAGE_UI.TAB_CATEGORY_TREE_ADMIN,
          },
        ]
      : []),
    ...(access.canUseAppIntroAdmin
      ? [
          {
            sectionId: "app-intro-admin" as const,
            label: MY_PROFILE_PAGE_UI.TAB_APP_INTRO_ADMIN,
          },
        ]
      : []),
    ...(access.canUsePopularProductsAdmin
      ? [
          {
            sectionId: "popular-products-admin" as const,
            label: MY_PROFILE_PAGE_UI.TAB_POPULAR_PRODUCTS_ADMIN,
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
    items: group.items.map((item) => ({
      ...item,
      badgeCount: item.badgeCount ?? badge(item.sectionId),
    })),
  }));
};
