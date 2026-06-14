import {
  isStaffSectionAllowed,
  isStaffSectionId,
  USER_ROLE_USER,
  type StaffSectionId,
} from "@izibuy/shared-lib";

import { useUserAccess } from "@/entities/access/model/useUserAccess";

export type ProfileHubAccess = {
  isProfileReady: boolean;
  isRegularUser: boolean;
  isUserDataConfirmed: boolean;
  canUseMyProducts: boolean;
  canUseMySales: boolean;
  canUseMyOrders: boolean;
  canUseAuction: boolean;
  canUseInstallmentPayments: boolean;
  canUseInstallmentSales: boolean;
  canUseSubscriptions: boolean;
  canUseWishlist: boolean;
  canUseDataConfirmation: boolean;
  canUsePremium: boolean;
  canUseLoyaltyPoints: boolean;
  canUseAdvertising: boolean;
  canUseEditProfile: boolean;
  canUseCreateRaffle: boolean;
  canUseProductModeration: boolean;
  canUseIntroAdModeration: boolean;
  canUseSellerPersonalCategoryModeration: boolean;
  canUseProductReports: boolean;
  canUseProductPromotions: boolean;
  canUseRaffles: boolean;
  canUseDataConfirmationQueue: boolean;
  canUseInstallmentModeration: boolean;
  canUseInstallmentDisputes: boolean;
  canUseAdminOrders: boolean;
  canUseSearchSynonymsAdmin: boolean;
  canUseCategoryTreeAdmin: boolean;
  canUseAppIntroAdmin: boolean;
  canUsePopularProductsAdmin: boolean;
};

export const useProfileHubAccess = (): ProfileHubAccess => {
  const { isAuthorized, role, isAdmin, canModerate, isUserDataConfirmed } = useUserAccess();
  const isProfileReady = isAuthorized;
  const isRegularUser = role === USER_ROLE_USER;

  return {
    isProfileReady,
    isRegularUser,
    isUserDataConfirmed,
    canUseMyProducts: isProfileReady,
    canUseMySales: isProfileReady,
    canUseMyOrders: isProfileReady,
    canUseAuction: isProfileReady,
    canUseInstallmentPayments: isProfileReady,
    canUseInstallmentSales: isProfileReady,
    canUseSubscriptions: isProfileReady,
    canUseWishlist: isProfileReady,
    canUseDataConfirmation: isProfileReady,
    canUsePremium: isProfileReady,
    canUseLoyaltyPoints: isProfileReady,
    canUseAdvertising: isProfileReady,
    canUseEditProfile: isProfileReady,
    canUseCreateRaffle: isProfileReady && isUserDataConfirmed,
    canUseProductModeration: isProfileReady && canModerate,
    canUseIntroAdModeration: isProfileReady && canModerate,
    canUseSellerPersonalCategoryModeration: isProfileReady && canModerate,
    canUseProductReports: isProfileReady && canModerate,
    canUseProductPromotions: isProfileReady && canModerate,
    canUseRaffles: isProfileReady && canModerate,
    canUseDataConfirmationQueue: isProfileReady && canModerate,
    canUseInstallmentModeration: isProfileReady && canModerate,
    canUseInstallmentDisputes: isProfileReady && canModerate,
    canUseAdminOrders: isProfileReady && isAdmin,
    canUseSearchSynonymsAdmin: isProfileReady && isAdmin,
    canUseCategoryTreeAdmin: isProfileReady && isAdmin,
    canUseAppIntroAdmin: isProfileReady && isAdmin,
    canUsePopularProductsAdmin: isProfileReady && isAdmin,
  };
};

const STAFF_SECTION_ALIASES: Partial<Record<string, StaffSectionId>> = {
  raffles: "staff-raffles",
};

export const resolveStaffSectionId = (sectionId: string): StaffSectionId | null => {
  const mapped = STAFF_SECTION_ALIASES[sectionId] ?? sectionId;
  return isStaffSectionId(mapped) ? mapped : null;
};

export const canAccessProfileSection = (
  sectionId: string,
  access: ReturnType<typeof useUserAccess>,
  hubAccess: ProfileHubAccess,
): boolean => {
  if (!hubAccess.isProfileReady) {
    return false;
  }

  const staffSectionId = resolveStaffSectionId(sectionId);
  if (staffSectionId) {
    return isStaffSectionAllowed(staffSectionId, {
      isAdmin: access.isAdmin,
      canModerate: access.canModerate,
    });
  }

  const flags: Record<string, boolean> = {
    overview: true,
    "my-products": hubAccess.canUseMyProducts,
    "my-sales": hubAccess.canUseMySales,
    "my-orders": hubAccess.canUseMyOrders,
    auction: hubAccess.canUseAuction,
    subscriptions: hubAccess.canUseSubscriptions,
    wishlist: hubAccess.canUseWishlist,
    "data-confirmation": hubAccess.canUseDataConfirmation,
    premium: hubAccess.canUsePremium,
    "loyalty-points": hubAccess.canUseLoyaltyPoints,
    advertising: hubAccess.canUseAdvertising,
    "edit-profile": hubAccess.canUseEditProfile,
    "create-raffle": hubAccess.canUseCreateRaffle,
    "installment-payments": hubAccess.canUseInstallmentPayments,
    "installment-sales": hubAccess.canUseInstallmentSales,
  };

  return flags[sectionId] ?? false;
};
