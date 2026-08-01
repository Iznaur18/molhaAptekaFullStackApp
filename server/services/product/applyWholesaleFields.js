import {
  PRODUCT_WHOLESALE_CONFIG_REQUIRED_MESSAGE,
  PRODUCT_WHOLESALE_MIN_QTY_MAX,
  PRODUCT_WHOLESALE_MIN_QTY_MIN,
  PRODUCT_WHOLESALE_MIN_QTY_MESSAGE,
  PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE,
} from "@molha/api-contract";
import { isProductWholesaleConfigured } from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

/**
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} $set
 * @param {import("mongoose").Document | Record<string, unknown>} existing
 */
export const applyWholesaleFields = (body, $set, existing) => {
  const touchesEnabled = hasBodyField(body, "productWholesaleEnabled");
  const touchesMinQty = hasBodyField(body, "productWholesaleMinQty");
  const touchesPrice = hasBodyField(body, "productWholesalePrice");

  if (!touchesEnabled && !touchesMinQty && !touchesPrice) {
    const retailPrice = hasBodyField($set, "productPrice")
      ? Number($set.productPrice)
      : Number(existing.productPrice);
    if (
      existing.productWholesaleEnabled === true &&
      hasBodyField($set, "productPrice") &&
      !isProductWholesaleConfigured({
        productPrice: retailPrice,
        productWholesaleMinQty: existing.productWholesaleMinQty,
        productWholesalePrice: existing.productWholesalePrice,
      })
    ) {
      throw new AppError(400, PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE);
    }
    return;
  }

  if (touchesMinQty) {
    const minQty = Math.floor(Number(body.productWholesaleMinQty));
    if (
      !Number.isFinite(minQty) ||
      minQty < PRODUCT_WHOLESALE_MIN_QTY_MIN ||
      minQty > PRODUCT_WHOLESALE_MIN_QTY_MAX
    ) {
      throw new AppError(400, PRODUCT_WHOLESALE_MIN_QTY_MESSAGE);
    }
    $set.productWholesaleMinQty = minQty;
  }

  if (touchesPrice) {
    const wholesalePrice = Math.floor(Number(body.productWholesalePrice));
    if (!Number.isFinite(wholesalePrice) || wholesalePrice < 1) {
      throw new AppError(400, "Оптовая цена должна быть больше 0");
    }
    $set.productWholesalePrice = wholesalePrice;
  }

  if (touchesEnabled) {
    $set.productWholesaleEnabled = Boolean(body.productWholesaleEnabled);
  }

  const nextEnabled = hasBodyField($set, "productWholesaleEnabled")
    ? $set.productWholesaleEnabled === true
    : existing.productWholesaleEnabled === true;
  const nextMinQty = hasBodyField($set, "productWholesaleMinQty")
    ? $set.productWholesaleMinQty
    : existing.productWholesaleMinQty;
  const nextWholesalePrice = hasBodyField($set, "productWholesalePrice")
    ? $set.productWholesalePrice
    : existing.productWholesalePrice;
  const nextRetailPrice = hasBodyField($set, "productPrice")
    ? Number($set.productPrice)
    : Number(existing.productPrice);

  const configured = isProductWholesaleConfigured({
    productPrice: nextRetailPrice,
    productWholesaleMinQty: nextMinQty,
    productWholesalePrice: nextWholesalePrice,
  });

  if ((touchesMinQty || touchesPrice) && !configured) {
    if (
      nextMinQty != null &&
      Math.floor(Number(nextMinQty)) < PRODUCT_WHOLESALE_MIN_QTY_MIN
    ) {
      throw new AppError(400, PRODUCT_WHOLESALE_MIN_QTY_MESSAGE);
    }
    throw new AppError(400, PRODUCT_WHOLESALE_PRICE_MUST_BE_LOWER_MESSAGE);
  }

  if (nextEnabled && !configured) {
    throw new AppError(400, PRODUCT_WHOLESALE_CONFIG_REQUIRED_MESSAGE);
  }
};
