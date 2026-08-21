import {
  PRODUCT_BUY_N_FREE_CONFIG_REQUIRED_MESSAGE,
  PRODUCT_BUY_N_FREE_THRESHOLD_MAX,
  PRODUCT_BUY_N_FREE_THRESHOLD_MIN,
  PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE,
} from "@molha/api-contract";
import { isProductBuyNFreeConfigured } from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";
import ProductBuyNFreeProgressModel from "../../models/ProductBuyNFreeProgressModel.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

/**
 * @param {string} productId
 * @param {import("mongoose").ClientSession | null} [session]
 */
export const resetBuyNFreeProgressForProduct = async (productId, session = null) => {
  const filter = { productId };
  if (session) {
    await ProductBuyNFreeProgressModel.deleteMany(filter).session(session);
    return;
  }
  await ProductBuyNFreeProgressModel.deleteMany(filter);
};

/**
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} $set
 * @param {import("mongoose").Document | Record<string, unknown>} existing
 * @returns {{ shouldResetProgress: boolean }}
 */
export const applyBuyNFreeFields = (body, $set, existing) => {
  const touchesEnabled = hasBodyField(body, "productBuyNFreeEnabled");
  const touchesThreshold = hasBodyField(body, "productBuyNFreeThreshold");

  if (!touchesEnabled && !touchesThreshold) {
    return { shouldResetProgress: false };
  }

  if (touchesThreshold) {
    const threshold = Math.floor(Number(body.productBuyNFreeThreshold));
    if (
      !Number.isFinite(threshold) ||
      threshold < PRODUCT_BUY_N_FREE_THRESHOLD_MIN ||
      threshold > PRODUCT_BUY_N_FREE_THRESHOLD_MAX
    ) {
      throw new AppError(400, PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE);
    }
    $set.productBuyNFreeThreshold = threshold;
  }

  if (touchesEnabled) {
    $set.productBuyNFreeEnabled = Boolean(body.productBuyNFreeEnabled);
  }

  const nextEnabled = hasBodyField($set, "productBuyNFreeEnabled")
    ? $set.productBuyNFreeEnabled === true
    : existing.productBuyNFreeEnabled === true;
  const nextThreshold = hasBodyField($set, "productBuyNFreeThreshold")
    ? $set.productBuyNFreeThreshold
    : existing.productBuyNFreeThreshold;

  const configured = isProductBuyNFreeConfigured({
    productBuyNFreeEnabled: true,
    productBuyNFreeThreshold: nextThreshold,
  });

  if (touchesThreshold && !configured) {
    throw new AppError(400, PRODUCT_BUY_N_FREE_THRESHOLD_MESSAGE);
  }

  if (nextEnabled && !configured) {
    throw new AppError(400, PRODUCT_BUY_N_FREE_CONFIG_REQUIRED_MESSAGE);
  }

  const prevEnabled = existing.productBuyNFreeEnabled === true;
  const prevThreshold = Math.floor(Number(existing.productBuyNFreeThreshold) || 0);
  const nextThresholdNum = Math.floor(Number(nextThreshold) || 0);
  const shouldResetProgress =
    (prevEnabled && !nextEnabled) ||
    (prevEnabled && touchesThreshold && prevThreshold !== nextThresholdNum);

  return { shouldResetProgress };
};
