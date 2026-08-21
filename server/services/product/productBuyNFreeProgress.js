import mongoose from "mongoose";
import {
  isProductBuyNFreeActive,
  resolveBuyNFreePaidQuantity,
} from "@izibuy/shared-lib";

import ProductBuyNFreeProgressModel from "../../models/ProductBuyNFreeProgressModel.js";
import ProductModel from "../../models/ProductModel.js";
import { withMongoSession } from "../../utils/mongoTransaction.js";

/**
 * @param {unknown} value
 */
const toObjectId = (value) => {
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  const raw = String(value ?? "").trim();
  if (!mongoose.isValidObjectId(raw)) {
    return null;
  }
  return new mongoose.Types.ObjectId(raw);
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 *   session?: import("mongoose").ClientSession | null;
 * }} input
 */
export const getBuyNFreeProgressDoc = async ({ buyerId, productId, session = null }) => {
  const buyerObjectId = toObjectId(buyerId);
  const productObjectId = toObjectId(productId);
  if (!buyerObjectId || !productObjectId) {
    return null;
  }
  const query = ProductBuyNFreeProgressModel.findOne({
    buyerId: buyerObjectId,
    productId: productObjectId,
  });
  if (session) {
    query.session(session);
  }
  return query.lean();
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 * }} input
 */
export const getBuyNFreeProgressForBuyer = async ({ buyerId, productId }) => {
  const productObjectId = toObjectId(productId);
  const product = productObjectId
    ? await ProductModel.findById(productObjectId)
        .select("productBuyNFreeEnabled productBuyNFreeThreshold")
        .lean()
    : null;

  const enabled = isProductBuyNFreeActive(product);
  const threshold = enabled
    ? Math.floor(Number(product?.productBuyNFreeThreshold) || 0)
    : null;
  const progress = await getBuyNFreeProgressDoc({ buyerId, productId });
  const completedPaidOrderCount = Math.max(
    0,
    Math.floor(Number(progress?.completedPaidOrderCount) || 0),
  );
  const freeClaimPending = progress?.freeClaimPending === true;
  const freeEligible =
    enabled &&
    threshold != null &&
    completedPaidOrderCount >= threshold &&
    !freeClaimPending;

  return {
    enabled,
    threshold,
    completedPaidOrderCount,
    freeEligible,
    freeClaimPending,
  };
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 *   threshold: number;
 *   orderId: unknown;
 *   session: import("mongoose").ClientSession;
 * }} input
 */
export const claimBuyNFreeRedemption = async ({
  buyerId,
  productId,
  threshold,
  orderId,
  session,
}) => {
  const buyerObjectId = toObjectId(buyerId);
  const productObjectId = toObjectId(productId);
  const orderObjectId = toObjectId(orderId);
  const minCount = Math.floor(Number(threshold) || 0);
  if (!buyerObjectId || !productObjectId || !orderObjectId || minCount < 2) {
    return false;
  }

  const updated = await ProductBuyNFreeProgressModel.findOneAndUpdate(
    {
      buyerId: buyerObjectId,
      productId: productObjectId,
      completedPaidOrderCount: { $gte: minCount },
      freeClaimPending: { $ne: true },
    },
    {
      $set: {
        freeClaimPending: true,
        freeClaimOrderId: orderObjectId,
      },
    },
    withMongoSession({ new: true }, session),
  );

  return updated != null;
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 *   orderId: unknown;
 *   session?: import("mongoose").ClientSession | null;
 * }} input
 */
export const releaseBuyNFreeRedemptionClaim = async ({
  buyerId,
  productId,
  orderId,
  session = null,
}) => {
  const buyerObjectId = toObjectId(buyerId);
  const productObjectId = toObjectId(productId);
  const orderObjectId = toObjectId(orderId);
  if (!buyerObjectId || !productObjectId || !orderObjectId) {
    return;
  }
  await ProductBuyNFreeProgressModel.updateOne(
    {
      buyerId: buyerObjectId,
      productId: productObjectId,
      freeClaimPending: true,
      freeClaimOrderId: orderObjectId,
    },
    {
      $set: {
        freeClaimPending: false,
        freeClaimOrderId: null,
      },
    },
    withMongoSession({}, session),
  );
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 *   quantity: number;
 *   freeUnits: number;
 *   session: import("mongoose").ClientSession;
 * }} input
 * @returns {Promise<{
 *   applied: boolean;
 *   action: 'increment' | 'reset' | null;
 *   countBefore: number;
 * }>}
 */
export const applyBuyNFreeProgressOnConfirm = async ({
  buyerId,
  productId,
  quantity,
  freeUnits,
  session,
}) => {
  const buyerObjectId = toObjectId(buyerId);
  const productObjectId = toObjectId(productId);
  if (!buyerObjectId || !productObjectId) {
    return { applied: false, action: null, countBefore: 0 };
  }

  const paidQty = resolveBuyNFreePaidQuantity(quantity, freeUnits);
  const freeQty = Math.min(
    Math.max(0, Math.floor(Number(freeUnits) || 0)),
    Math.max(0, Math.floor(Number(quantity) || 0)),
  );

  const existing = await ProductBuyNFreeProgressModel.findOne({
    buyerId: buyerObjectId,
    productId: productObjectId,
  })
    .session(session)
    .lean();
  const countBefore = Math.max(
    0,
    Math.floor(Number(existing?.completedPaidOrderCount) || 0),
  );

  if (freeQty > 0) {
    await ProductBuyNFreeProgressModel.findOneAndUpdate(
      {
        buyerId: buyerObjectId,
        productId: productObjectId,
      },
      {
        $set: {
          completedPaidOrderCount: 0,
          freeClaimPending: false,
          freeClaimOrderId: null,
        },
        $setOnInsert: {
          buyerId: buyerObjectId,
          productId: productObjectId,
        },
      },
      withMongoSession({ upsert: true, new: true }, session),
    );
    return { applied: true, action: "reset", countBefore };
  }

  if (paidQty <= 0) {
    return { applied: false, action: null, countBefore };
  }

  await ProductBuyNFreeProgressModel.findOneAndUpdate(
    {
      buyerId: buyerObjectId,
      productId: productObjectId,
    },
    {
      $inc: { completedPaidOrderCount: 1 },
      $setOnInsert: {
        buyerId: buyerObjectId,
        productId: productObjectId,
        freeClaimPending: false,
        freeClaimOrderId: null,
      },
    },
    withMongoSession({ upsert: true, new: true }, session),
  );
  return { applied: true, action: "increment", countBefore };
};

/**
 * @param {{
 *   buyerId: unknown;
 *   productId: unknown;
 *   action: 'increment' | 'reset' | null | undefined;
 *   countBefore: number;
 *   session?: import("mongoose").ClientSession | null;
 * }} input
 */
export const rollbackBuyNFreeProgressOnCancel = async ({
  buyerId,
  productId,
  action,
  countBefore,
  session = null,
}) => {
  const buyerObjectId = toObjectId(buyerId);
  const productObjectId = toObjectId(productId);
  if (!buyerObjectId || !productObjectId) {
    return;
  }
  if (action !== "increment" && action !== "reset") {
    return;
  }

  const restoreCount = Math.max(0, Math.floor(Number(countBefore) || 0));
  await ProductBuyNFreeProgressModel.findOneAndUpdate(
    {
      buyerId: buyerObjectId,
      productId: productObjectId,
    },
    {
      $set: {
        completedPaidOrderCount: restoreCount,
        freeClaimPending: false,
        freeClaimOrderId: null,
      },
      $setOnInsert: {
        buyerId: buyerObjectId,
        productId: productObjectId,
      },
    },
    withMongoSession({ upsert: true }, session),
  );
};
