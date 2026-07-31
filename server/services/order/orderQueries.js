/** Поля популяции для отображения позиций заказа на клиенте. */
export const ORDER_ITEMS_POPULATE = {
  path: "items.productId",
  select:
    "productName productPrice productImageUrls productImageUrl productSeller productAuctionEnabled",
  populate: { path: "productSeller", select: "userName _id userPhoneNumber" },
};

/** Кто привёл покупателя по партнёрской ссылке объявления. */
export const ORDER_AFFILIATE_REFERRER_POPULATE = {
  path: "items.affiliateReferrerUserId",
  select: "userName _id",
};

/** Поля покупателя в `populate('userBuyerId', ...)`. */
export const ORDER_BUYER_PUBLIC_FIELDS = "userName email _id userPhoneNumber";
