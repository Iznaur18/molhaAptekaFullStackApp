/**
 * Поля продавца в карточке/каталоге товара (без ПДн-контактов).
 * email / userPhoneNumber / userAddress — только профиль (self/staff) или заказ.
 */
export const PRODUCT_SELLER_PUBLIC_FIELD_NAMES = [
  "_id",
  "userName",
  "userAvatarUrl",
  "userAvatarFocus",
  "userRatingByVotes",
  "isPremiumUser",
  "isUserDataConfirmed",
  "createdAt",
  "totalSalesAmount",
  "followersCount",
  // Только статус: ИНН и комментарий модератора наружу не отдаём.
  "sellerSafeDeal.moderationStatus",
  // Покупателю на чекауте показываем лишь те оплаты, что принимает продавец.
  // Приходит вместе с карточкой товара — отдельный запрос за этим не нужен.
  "sellerPaymentMethods",
];

export const PRODUCT_SELLER_PUBLIC_SELECT = PRODUCT_SELLER_PUBLIC_FIELD_NAMES.join(" ");
