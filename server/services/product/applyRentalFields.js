import {
  PRODUCT_RENTAL_CONFIG_REQUIRED_MESSAGE,
  PRODUCT_RENTAL_PRICE_REQUIRED_MESSAGE,
  PRODUCT_RENTAL_PRICE_UNIT_DEFAULT,
  PRODUCT_RENTAL_PRICE_UNIT_VALUES,
  PRODUCT_RENTAL_UNIT_INVALID_MESSAGE,
} from "@molha/api-contract";
import { isProductRentalConfigured } from "@izibuy/shared-lib";

import { AppError } from "../../errors/AppError.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

/**
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} $set
 * @param {import("mongoose").Document | Record<string, unknown>} existing
 */
export const applyRentalFields = (body, $set, existing) => {
  const touchesEnabled = hasBodyField(body, "productRentalEnabled");
  const touchesPrice = hasBodyField(body, "productRentalPriceRub");
  const touchesUnit = hasBodyField(body, "productRentalPriceUnit");

  if (!touchesEnabled && !touchesPrice && !touchesUnit) {
    return;
  }

  if (touchesPrice) {
    const price = Math.floor(Number(body.productRentalPriceRub));
    if (!Number.isFinite(price) || price < 1) {
      throw new AppError(400, PRODUCT_RENTAL_PRICE_REQUIRED_MESSAGE);
    }
    $set.productRentalPriceRub = price;
  }

  if (touchesUnit) {
    const unit = String(body.productRentalPriceUnit ?? "").trim();
    if (!PRODUCT_RENTAL_PRICE_UNIT_VALUES.includes(unit)) {
      throw new AppError(400, PRODUCT_RENTAL_UNIT_INVALID_MESSAGE);
    }
    $set.productRentalPriceUnit = unit;
  }

  if (touchesEnabled) {
    $set.productRentalEnabled = Boolean(body.productRentalEnabled);
  }

  const nextEnabled = hasBodyField($set, "productRentalEnabled")
    ? $set.productRentalEnabled === true
    : existing.productRentalEnabled === true;
  const nextPrice = hasBodyField($set, "productRentalPriceRub")
    ? $set.productRentalPriceRub
    : existing.productRentalPriceRub;
  const nextUnit = hasBodyField($set, "productRentalPriceUnit")
    ? $set.productRentalPriceUnit
    : existing.productRentalPriceUnit ?? PRODUCT_RENTAL_PRICE_UNIT_DEFAULT;

  const configured = isProductRentalConfigured({
    productRentalPriceRub: nextPrice,
    productRentalPriceUnit: nextUnit,
  });

  if ((touchesPrice || touchesUnit) && !configured) {
    throw new AppError(400, PRODUCT_RENTAL_CONFIG_REQUIRED_MESSAGE);
  }

  if (nextEnabled && !configured) {
    throw new AppError(400, PRODUCT_RENTAL_CONFIG_REQUIRED_MESSAGE);
  }

  if (!hasBodyField($set, "productRentalPriceUnit") && nextEnabled) {
    $set.productRentalPriceUnit = nextUnit;
  }
};
