type CanViewOtherUserPurchasesParams = {
  isAuthorized: boolean;
  isPremiumUser: boolean;
  canModerateProducts: boolean;
  isOtherUser: boolean;
};

export const canViewOtherUserPurchases = ({
  isAuthorized,
  isPremiumUser,
  canModerateProducts,
  isOtherUser,
}: CanViewOtherUserPurchasesParams) =>
  isOtherUser && isAuthorized && (isPremiumUser || canModerateProducts);
