import { MY_PROFILE_PAGE_UI } from "@/shared/config/appUiCopy";
import {
  PROFILE_ACCOUNT_SECTION_ORDER,
  PROFILE_MANAGEMENT_SECTION_ORDER,
  PROFILE_SERVICES_SECTION_ORDER,
  PROFILE_STAFF_SECTION_ORDER,
  PROFILE_TRADE_SECTION_ORDER,
} from "@izibuy/shared-lib";

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

const resolveProfileStaffNavItem = (
  sectionId: ProfileSectionId,
  access: ProfileHubAccess,
  badgeCounts: Partial<Record<ProfileSectionId, number>>,
): ProfileNavItem | null => {
  if (sectionId === "product-moderation" && access.canUseProductModeration) {
    return {
      sectionId,
      label: "Товар (модерация)",
      badgeCount: badgeCounts["product-moderation"],
    };
  }
  if (sectionId === "intro-ad-moderation" && access.canUseProductModeration) {
    return {
      sectionId,
      label: "Реклама (модерация)",
      badgeCount: badgeCounts["intro-ad-moderation"],
    };
  }
  if (sectionId === "product-reports" && access.canUseProductReports) {
    return {
      sectionId,
      label: "Жалоба (модерация)",
      badgeCount: badgeCounts["product-reports"],
    };
  }
  if (sectionId === "data-confirmation-requests" && access.canUseDataConfirmationQueue) {
    return {
      sectionId,
      label: "Подтверждение (модерация)",
      badgeCount: badgeCounts["data-confirmation-requests"],
    };
  }
  if (sectionId === "installment-disputes" && access.canUseInstallmentDisputes) {
    return {
      sectionId,
      label: "Споры (модерация)",
      badgeCount: badgeCounts["installment-disputes"],
    };
  }
  if (sectionId === "admin-orders" && access.canUseAdminOrders) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_ADMIN_ORDERS,
    };
  }
  if (sectionId === "search-synonyms-admin" && access.canUseSearchSynonymsAdmin) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_SEARCH_SYNONYMS_ADMIN,
    };
  }
  if (sectionId === "category-tree-admin" && access.canUseCategoryTreeAdmin) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_CATEGORY_TREE_ADMIN,
    };
  }
  if (sectionId === "app-intro-admin" && access.canUseAppIntroAdmin) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_APP_INTRO_ADMIN,
    };
  }
  if (sectionId === "site-header-banner-admin" && access.canUseSiteHeaderBannerAdmin) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_SITE_HEADER_BANNER_ADMIN,
    };
  }
  if (sectionId === "popular-products-admin" && access.canUsePopularProductsAdmin) {
    return {
      sectionId,
      label: MY_PROFILE_PAGE_UI.TAB_POPULAR_PRODUCTS_ADMIN,
    };
  }

  return null;
};

const resolveProfileNavItems = (
  sectionOrder: readonly ProfileSectionId[],
  access: ProfileHubAccess,
  badgeCounts: Partial<Record<ProfileSectionId, number>>,
): ProfileNavItem[] =>
  sectionOrder.flatMap((sectionId) => {
    const item = resolveProfileStaffNavItem(sectionId, access, badgeCounts);
    return item ? [item] : [];
  });

export const buildProfileNavGroups = (
  access: ProfileHubAccess,
  badgeCounts: Partial<Record<ProfileSectionId, number>> = {},
): ProfileNavGroup[] => {
  const badge = (sectionId: ProfileSectionId): number | undefined => {
    const count = badgeCounts[sectionId] ?? 0;
    return count > 0 ? count : undefined;
  };

  const tradeItems: ProfileNavItem[] = PROFILE_TRADE_SECTION_ORDER.flatMap((sectionId): ProfileNavItem[] => {
    if (sectionId === "my-products") {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_MY_PRODUCTS,
          disabled: !access.canUseMyProducts,
        },
      ];
    }
    if (sectionId === "my-sales") {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_MY_SALES,
          disabled: !access.canUseMySales,
          badgeCount: badgeCounts[sectionId],
        },
      ];
    }
    if (sectionId === "my-orders") {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_MY_ORDERS,
          disabled: !access.canUseMyOrders,
          badgeCount: badgeCounts[sectionId],
        },
      ];
    }
    if (sectionId === "auction" && access.canUseAuction) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_AUCTION,
          badgeCount: badgeCounts.auction,
        },
      ];
    }
    if (sectionId === "installment-payments" && access.canUseInstallmentPayments) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_PAYMENTS,
          badgeCount: badgeCounts["installment-payments"],
        },
      ];
    }
    if (sectionId === "installment-sales" && access.canUseInstallmentSales) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_INSTALLMENT_SALES,
          badgeCount: badgeCounts["installment-sales"],
        },
      ];
    }
    return [];
  });

  const accountItems: ProfileNavItem[] = PROFILE_ACCOUNT_SECTION_ORDER.flatMap((sectionId): ProfileNavItem[] => {
    if (sectionId === "subscriptions") {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_SUBSCRIPTIONS,
          disabled: !access.canUseSubscriptions,
        },
      ];
    }
    if (sectionId === "wishlist") {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_WISHLIST,
          disabled: !access.canUseWishlist,
        },
      ];
    }
    if (sectionId === "data-confirmation" && access.canUseDataConfirmation) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_DATA_CONFIRMATION,
          showAlert: !access.isUserDataConfirmed,
        },
      ];
    }
    if (sectionId === "premium" && access.canUsePremium) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_PREMIUM,
        },
      ];
    }
    if (sectionId === "loyalty-points" && access.canUseLoyaltyPoints) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_LOYALTY_POINTS,
        },
      ];
    }
    if (sectionId === "partner-program" && access.canUsePartnerProgram) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_PARTNER_PROGRAM,
        },
      ];
    }
    if (sectionId === "advertising" && access.canUseAdvertising) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.TAB_ADVERTISING,
        },
      ];
    }
    if (sectionId === "edit-profile" && access.canUseEditProfile) {
      return [
        {
          sectionId,
          label: MY_PROFILE_PAGE_UI.EDIT_PROFILE,
        },
      ];
    }
    return [];
  });

  const managementSectionIds = new Set<ProfileSectionId>(PROFILE_MANAGEMENT_SECTION_ORDER);

  const staffItems = resolveProfileNavItems(PROFILE_STAFF_SECTION_ORDER, access, badgeCounts).filter(
    (item) => !managementSectionIds.has(item.sectionId),
  );
  const managementItems = resolveProfileNavItems(
    PROFILE_MANAGEMENT_SECTION_ORDER,
    access,
    badgeCounts,
  );

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
      items: tradeItems,
    },
    {
      id: "account",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_ACCOUNT,
      items: accountItems,
    },
  ];

  const servicesItems: ProfileNavItem[] = PROFILE_SERVICES_SECTION_ORDER.flatMap(
    (sectionId): ProfileNavItem[] => {
      // Пункты сервисов на mobile появятся по мере экранов; порядок уже общий.
      void sectionId;
      return [];
    },
  );

  if (servicesItems.length > 0) {
    groups.push({
      id: "services",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_SERVICES,
      items: servicesItems,
    });
  }

  if (staffItems.length > 0) {
    groups.push({
      id: "staff",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_STAFF,
      items: staffItems,
    });
  }

  if (managementItems.length > 0) {
    groups.push({
      id: "management",
      label: MY_PROFILE_PAGE_UI.NAV_SECTION_MANAGEMENT,
      items: managementItems,
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
