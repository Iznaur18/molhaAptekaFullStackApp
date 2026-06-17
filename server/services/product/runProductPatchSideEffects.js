import { ProductModel } from "../../models/index.js";
import { PRODUCT_SELLER_PUBLIC_SELECT } from "../../constants/productSellerPublicFields.js";
import {
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
} from "../../constants/productPromotionConstants.js";
import { attachProductSellerSnapshot } from "./attachProductSellerSnapshots.js";
import { rejectAllPendingOffersForProduct } from "./productPriceOfferHelpers.js";
import { notifySellerAuctionToggledByAdmin } from "./productAuction.js";
import { cancelProductPromotionsForProduct } from "./productPromotionHelpers.js";
import { syncProductCatalogAfterStockChange } from "./productStock.js";

/**
 * @param {{
 *   userId: string;
 *   productId: string;
 *   product: Record<string, unknown>;
 *   $set: Record<string, unknown>;
 *   isAdmin: boolean;
 *   auctionEnabledChanged: boolean;
 *   nextAuctionEnabled: boolean;
 * }} input
 */
export async function runProductPatchSideEffects({
  userId,
  productId,
  product,
  $set,
  isAdmin,
  auctionEnabledChanged,
  nextAuctionEnabled,
}) {
  if (product.productIsAvailable === false) {
    await rejectAllPendingOffersForProduct(productId, { notifyBuyers: true });
    await cancelProductPromotionsForProduct({
      productId,
      statuses: [
        PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
        PRODUCT_PROMOTION_STATUS_ACTIVE,
      ],
    });
  }

  if (auctionEnabledChanged && !nextAuctionEnabled) {
    await rejectAllPendingOffersForProduct(productId, { notifyBuyers: true });
  }

  if (auctionEnabledChanged && isAdmin) {
    const sellerId = product.productSeller?._id ?? product.productSeller;
    if (sellerId != null) {
      await notifySellerAuctionToggledByAdmin({
        productId,
        sellerUserId: sellerId,
        actorUserId: userId,
        enabled: nextAuctionEnabled,
      });
    }
  }

  if (Object.prototype.hasOwnProperty.call($set, "productStockQuantity")) {
    await syncProductCatalogAfterStockChange(productId);
  }
}

/**
 * @param {string} productId
 */
export async function loadProductWithSellerSnapshot(productId) {
  const product = await ProductModel.findById(productId)
    .populate("productSeller", PRODUCT_SELLER_PUBLIC_SELECT)
    .lean();

  return attachProductSellerSnapshot(product);
}
