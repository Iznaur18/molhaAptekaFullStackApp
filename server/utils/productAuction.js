import { PRODUCT_MODERATION_APPROVED } from "../constants/productModerationConstants.js";
import {
  IN_APP_NOTIFICATION_KIND_AUCTION_TOGGLED_BY_ADMIN,
  IN_APP_NOTIFICATION_MESSAGE_AUCTION_DISABLED_BY_ADMIN,
  IN_APP_NOTIFICATION_MESSAGE_AUCTION_ENABLED_BY_ADMIN,
} from "../constants/productAuctionConstants.js";
import { ProductModel } from "../models/index.js";
import { createUserInAppNotification } from "./userInAppNotifications.js";
import { rejectAllPendingOffersForProduct } from "./productPriceOfferHelpers.js";

/**
 * @param {Record<string, unknown>} product
 */
export const computeAuctionActive = (product) =>
  product.productAuctionEnabled === true &&
  product.productModerationStatus === PRODUCT_MODERATION_APPROVED &&
  product.productIsAvailable !== false;

/**
 * @param {Record<string, unknown>} product
 */
export const enrichProductWithAuctionFields = (product) => {
  const productAuctionEnabled = product.productAuctionEnabled === true;
  const productAuctionCompletedOnce = product.productAuctionCompletedOnce === true;

  return {
    ...product,
    productAuctionEnabled,
    productAuctionCompletedOnce,
    auctionActive: computeAuctionActive({
      ...product,
      productAuctionEnabled,
    }),
  };
};

/**
 * @param {Record<string, unknown>} product
 */
export const assertAuctionAcceptsBids = (product) => {
  if (product.productAuctionEnabled !== true) {
    throw new Error("Аукцион на этом товаре не проводится");
  }
  if (!computeAuctionActive(product)) {
    throw new Error("Аукцион сейчас не принимает ставки");
  }
};

/**
 * @param {import('mongoose').Types.ObjectId | string} productId
 * @param {{ markCompletedOnce?: boolean }} [options]
 */
export const closeProductAuction = async (
  productId,
  { markCompletedOnce = false } = {},
) => {
  const $set = { productAuctionEnabled: false };
  if (markCompletedOnce) {
    $set.productAuctionCompletedOnce = true;
  }

  await ProductModel.findByIdAndUpdate(productId, { $set });
  await rejectAllPendingOffersForProduct(productId, { notifyBuyers: true });
};

/**
 * @param {{
 *   productId: import('mongoose').Types.ObjectId | string;
 *   sellerUserId: import('mongoose').Types.ObjectId | string;
 *   actorUserId: import('mongoose').Types.ObjectId | string;
 *   enabled: boolean;
 * }} params
 */
export const notifySellerAuctionToggledByAdmin = async ({
  productId,
  sellerUserId,
  actorUserId,
  enabled,
}) => {
  if (String(sellerUserId) === String(actorUserId)) {
    return;
  }

  await createUserInAppNotification({
    userId: sellerUserId,
    kind: IN_APP_NOTIFICATION_KIND_AUCTION_TOGGLED_BY_ADMIN,
    message: enabled
      ? IN_APP_NOTIFICATION_MESSAGE_AUCTION_ENABLED_BY_ADMIN
      : IN_APP_NOTIFICATION_MESSAGE_AUCTION_DISABLED_BY_ADMIN,
    productId,
  });
};
