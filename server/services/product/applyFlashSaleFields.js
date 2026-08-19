import {
  PRODUCT_FLASH_SALE_AUCTION_BLOCKED_MESSAGE,
  PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES,
  PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES,
  PRODUCT_FLASH_SALE_DURATION_RANGE_MESSAGE,
  PRODUCT_FLASH_SALE_DURATION_REQUIRED_MESSAGE,
  PRODUCT_FLASH_SALE_MANUAL_DISCOUNT_BLOCKED_MESSAGE,
  PRODUCT_FLASH_SALE_MAX_DISCOUNT_MESSAGE,
  PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT,
  PRODUCT_FLASH_SALE_PRICE_REQUIRED_MESSAGE,
  PRODUCT_FLASH_SALE_PRICE_TOO_HIGH_MESSAGE,
  resolveProductFlashSaleDurationMinutes,
} from "@molha/api-contract";

import { AppError } from "../../errors/AppError.js";
import { computeProductDiscountPercent } from "./productDiscount.js";
import { resolveFlashSaleRestoreBasePrice } from "./productFlashSaleExpiry.js";

const hasBodyField = (body, field) => Object.prototype.hasOwnProperty.call(body, field);

const resolveFlashSaleBasePriceForWrite = (existing) => {
  if (existing.productFlashSaleEnabled === true) {
    const fromActive = resolveFlashSaleRestoreBasePrice(existing);
    if (fromActive != null) {
      return fromActive;
    }
  }

  const fromPrice = Math.floor(Number(existing.productPrice));
  return Number.isFinite(fromPrice) && fromPrice > 0 ? fromPrice : null;
};

const hasManualCatalogDiscount = (existing) => {
  if (existing.productFlashSaleEnabled === true) {
    return false;
  }
  const oldPrice = Math.floor(Number(existing.productOldPrice));
  const price = Math.floor(Number(existing.productPrice));
  if (!Number.isFinite(oldPrice) || oldPrice <= 0) {
    return false;
  }
  return oldPrice > price;
};

/**
 * @param {Record<string, unknown>} body
 * @param {Record<string, unknown>} $set
 * @param {Record<string, unknown>} $unset
 * @param {import("mongoose").Document | Record<string, unknown>} existing
 */
export const applyFlashSaleFields = (body, $set, $unset, existing) => {
  const touchesEnabled = hasBodyField(body, "productFlashSaleEnabled");
  const touchesPrice = hasBodyField(body, "productFlashSalePrice");
  const touchesDurationValue = hasBodyField(body, "productFlashSaleDurationValue");
  const touchesDurationUnit = hasBodyField(body, "productFlashSaleDurationUnit");

  if (
    !touchesEnabled &&
    !touchesPrice &&
    !touchesDurationValue &&
    !touchesDurationUnit
  ) {
    return { flashSaleEnabledChanged: false, flashSaleNowEnabled: false };
  }

  const wantsEnable = touchesEnabled
    ? body.productFlashSaleEnabled === true
    : existing.productFlashSaleEnabled === true;

  if (wantsEnable) {
    if (existing.productAuctionEnabled === true) {
      throw new AppError(400, PRODUCT_FLASH_SALE_AUCTION_BLOCKED_MESSAGE);
    }
    if (hasManualCatalogDiscount(existing)) {
      throw new AppError(400, PRODUCT_FLASH_SALE_MANUAL_DISCOUNT_BLOCKED_MESSAGE);
    }
  }

  if (wantsEnable) {
    const basePrice = resolveFlashSaleBasePriceForWrite(existing);
    if (basePrice == null) {
      throw new AppError(400, "У товара должна быть цена больше 0");
    }

    const salePriceRaw = touchesPrice ? body.productFlashSalePrice : existing.productPrice;
    const salePrice = Math.floor(Number(salePriceRaw));
    if (!Number.isFinite(salePrice) || salePrice < 1) {
      throw new AppError(400, PRODUCT_FLASH_SALE_PRICE_REQUIRED_MESSAGE);
    }
    if (salePrice >= basePrice) {
      throw new AppError(400, PRODUCT_FLASH_SALE_PRICE_TOO_HIGH_MESSAGE);
    }

    const discountPercent = computeProductDiscountPercent(basePrice, salePrice);
    if (discountPercent == null || discountPercent > PRODUCT_FLASH_SALE_MAX_DISCOUNT_PERCENT) {
      throw new AppError(400, PRODUCT_FLASH_SALE_MAX_DISCOUNT_MESSAGE);
    }

    const durationValue = touchesDurationValue ? body.productFlashSaleDurationValue : null;
    const durationUnit = touchesDurationUnit ? body.productFlashSaleDurationUnit : "minutes";
    if (durationValue == null) {
      throw new AppError(400, PRODUCT_FLASH_SALE_DURATION_REQUIRED_MESSAGE);
    }
    const durationMinutes = resolveProductFlashSaleDurationMinutes(
      durationValue,
      durationUnit,
    );
    if (durationMinutes == null) {
      throw new AppError(400, PRODUCT_FLASH_SALE_DURATION_REQUIRED_MESSAGE);
    }
    if (
      durationMinutes < PRODUCT_FLASH_SALE_DURATION_MIN_MINUTES ||
      durationMinutes > PRODUCT_FLASH_SALE_DURATION_MAX_MINUTES
    ) {
      throw new AppError(400, PRODUCT_FLASH_SALE_DURATION_RANGE_MESSAGE);
    }

    $set.productFlashSaleEnabled = true;
    $set.productFlashSaleBasePrice = basePrice;
    $set.productFlashSaleEndsAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    $set.productFlashSaleDurationMinutes = durationMinutes;
    $set.productOldPrice = basePrice;
    $set.productPrice = salePrice;
  } else if (touchesEnabled && body.productFlashSaleEnabled === false) {
    const basePrice = resolveFlashSaleRestoreBasePrice(existing);
    if (basePrice != null) {
      $set.productPrice = basePrice;
    }
    $set.productFlashSaleEnabled = false;
    $set.productOldPrice = null;
    $unset.productFlashSaleEndsAt = "";
    $unset.productFlashSaleBasePrice = "";
    $unset.productFlashSaleDurationMinutes = "";
  }

  return {
    flashSaleEnabledChanged:
      touchesEnabled &&
      Boolean(existing.productFlashSaleEnabled) !== Boolean(body.productFlashSaleEnabled),
    flashSaleNowEnabled: wantsEnable && touchesEnabled && body.productFlashSaleEnabled === true,
  };
};

export {
  disableExpiredProductFlashSale,
  expireProductFlashSales,
} from "./productFlashSaleExpiry.js";
