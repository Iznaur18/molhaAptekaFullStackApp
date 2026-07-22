/** Поля продавца в карточке/модалке товара (без секретов). */
export const PRODUCT_SELLER_PUBLIC_FIELD_NAMES = [
  "_id",
  "userName",
  "email",
  "userPhoneNumber",
  "userAddress",
  "userAvatarUrl",
  "userAvatarFocus",
  "userRatingByVotes",
  "isPremiumUser",
  "isUserDataConfirmed",
  "createdAt",
  "totalSalesAmount",
  "followersCount",
];

export const PRODUCT_SELLER_PUBLIC_SELECT = PRODUCT_SELLER_PUBLIC_FIELD_NAMES.join(" ");
