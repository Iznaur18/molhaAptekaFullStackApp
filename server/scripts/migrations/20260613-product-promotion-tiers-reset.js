import { ProductModel, ProductPromotionModel } from "../../models/index.js";
import {
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_EXPIRED,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
} from "../../constants/productPromotionConstants.js";

/** Сброс legacy-продвижений перед tier-моделью v2. */
export const up = async ({ isApply = true } = {}) => {
  const productFilter = {
    $or: [
      { catalogPromotionActivatedAt: { $ne: null } },
      { catalogPromotionExpiresAt: { $ne: null } },
      { catalogPromotionTier: { $ne: null } },
    ],
  };

  const promotionFilter = {
    status: {
      $in: [PRODUCT_PROMOTION_STATUS_ACTIVE, PRODUCT_PROMOTION_STATUS_PENDING_STAFF],
    },
  };

  const [productsMatched, promotionsMatched] = await Promise.all([
    ProductModel.countDocuments(productFilter),
    ProductPromotionModel.countDocuments(promotionFilter),
  ]);

  if (!isApply) {
    return { productsMatched, promotionsMatched, applied: false };
  }

  const [productResult, promotionResult] = await Promise.all([
    ProductModel.updateMany(productFilter, {
      $set: {
        catalogPromotionTier: null,
        catalogPromotionActivatedAt: null,
        catalogPromotionExpiresAt: null,
      },
    }),
    ProductPromotionModel.updateMany(promotionFilter, {
      $set: { status: PRODUCT_PROMOTION_STATUS_EXPIRED },
    }),
  ]);

  await ProductModel.createIndexes();

  return {
    productsMatched,
    promotionsMatched,
    productsModified: productResult.modifiedCount,
    promotionsModified: promotionResult.modifiedCount,
    applied: true,
  };
};
