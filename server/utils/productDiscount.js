import {
  PRODUCT_PRICE_RUB_MAX,
  PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE,
} from "../constants/productConstants.js";
import {
  IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT,
  PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT,
  buildFollowedSellerProductDiscountMessage,
} from "../constants/productDiscountConstants.js";
import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import { UserFollowModel, UserModel } from "../models/index.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import { enrichProductWithAuctionFields } from "./productAuction.js";

/**
 * @param {number} price
 */
export const assertProductPriceRubWithinMax = (price) => {
  if (price > PRODUCT_PRICE_RUB_MAX) {
    throw new Error(PRODUCT_PRICE_RUB_MAX_ERROR_MESSAGE);
  }
};

/**
 * @param {unknown} raw
 * @returns {number}
 */
export const normalizeProductPriceRub = (raw) => {
  const price = Math.floor(Number(raw));
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Цена должна быть целым числом не меньше 0");
  }
  assertProductPriceRubWithinMax(price);
  return price;
};

/**
 * @param {unknown} raw
 * @returns {number | null}
 */
export const normalizeProductOldPriceRub = (raw) => {
  if (raw === null || raw === undefined || raw === "") {
    return null;
  }
  const price = Math.floor(Number(raw));
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Старая цена должна быть целым числом не меньше 0");
  }
  assertProductPriceRubWithinMax(price);
  return price;
};

/**
 * @param {number | null | undefined} oldPrice
 * @param {number | null | undefined} price
 * @returns {number | null}
 */
export const computeProductDiscountPercent = (oldPrice, price) => {
  const old = Math.floor(Number(oldPrice));
  const current = Math.floor(Number(price));
  if (!Number.isFinite(old) || !Number.isFinite(current)) {
    return null;
  }
  if (old <= current) {
    return null;
  }
  return Math.floor((1 - current / old) * 100);
};

/**
 * @param {number | null} oldPrice
 * @param {number} price
 */
export const assertProductOldPricePair = (oldPrice, price) => {
  if (oldPrice == null) {
    return;
  }
  if (oldPrice <= price) {
    throw new Error("Старая цена должна быть больше текущей");
  }
};

/**
 * @param {Record<string, unknown>} product
 */
export const enrichProductWithDiscountFields = (product) => {
  const productOldPrice =
    product.productOldPrice == null
      ? null
      : Math.floor(Number(product.productOldPrice));
  const productPrice = Math.floor(Number(product.productPrice));
  const normalizedOldPrice =
    Number.isFinite(productOldPrice) && productOldPrice > 0 ? productOldPrice : null;
  const normalizedPrice = Number.isFinite(productPrice) ? productPrice : 0;
  const discountPercent = computeProductDiscountPercent(
    normalizedOldPrice,
    normalizedPrice,
  );

  return {
    ...product,
    productOldPrice: normalizedOldPrice,
    productPrice: normalizedPrice,
    discountPercent,
  };
};

/**
 * @param {Record<string, unknown>} product
 */
export const enrichProductApiFields = (product) =>
  enrichProductWithDiscountFields(enrichProductWithAuctionFields(product));

export const buildProductSaleOnlyMatch = () => ({
  productOldPrice: { $type: "number", $gt: 0 },
  $expr: {
    $and: [
      { $gt: ["$productOldPrice", "$productPrice"] },
      {
        $gte: [
          {
            $floor: {
              $multiply: [
                {
                  $subtract: [
                    1,
                    {
                      $divide: ["$productPrice", "$productOldPrice"],
                    },
                  ],
                },
                100,
              ],
            },
          },
          PRODUCT_SALE_FILTER_MIN_DISCOUNT_PERCENT,
        ],
      },
    ],
  },
});

/**
 * @param {number | null | undefined} previousPercent
 * @param {number | null | undefined} nextPercent
 */
export const shouldNotifyFollowersOfProductDiscount = (
  previousPercent,
  nextPercent,
) => {
  if (nextPercent == null || nextPercent < 1) {
    return false;
  }
  const prev = previousPercent == null ? null : Math.floor(Number(previousPercent));
  const next = Math.floor(Number(nextPercent));
  return prev == null || next > prev;
};

/**
 * @param {Record<string, unknown>} product — одобренный товар в каталоге
 * @param {number | null | undefined} previousApprovedDiscountPercent
 */
export async function notifyFollowersOfSellerProductDiscount(
  product,
  previousApprovedDiscountPercent,
) {
  if (product.productModerationStatus !== PRODUCT_MODERATION_APPROVED) {
    return;
  }
  if (product.productIsAvailable === false) {
    return;
  }

  const discountPercent = computeProductDiscountPercent(
    product.productOldPrice,
    product.productPrice,
  );
  if (
    !shouldNotifyFollowersOfProductDiscount(
      previousApprovedDiscountPercent,
      discountPercent,
    )
  ) {
    return;
  }

  const sellerId = product.productSeller?._id ?? product.productSeller;
  if (!sellerId) return;

  const followerRows = await UserFollowModel.find({
    followingId: sellerId,
  })
    .select("followerId")
    .lean();

  if (followerRows.length === 0) return;

  const seller = await UserModel.findById(sellerId).select("userName").lean();
  const productId = product._id;
  const message = buildFollowedSellerProductDiscountMessage(
    seller?.userName,
    product.productName,
    discountPercent,
  );

  await Promise.all(
    followerRows.map((row) =>
      createUserInAppNotification({
        userId: row.followerId,
        kind: IN_APP_NOTIFICATION_KIND_FOLLOWED_SELLER_PRODUCT_DISCOUNT,
        message,
        productId,
        actorUserId: String(sellerId),
      }),
    ),
  );
}
