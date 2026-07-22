import {
  PRODUCT_LISTING_ORIGIN_INVALID_MESSAGE,
  PRODUCT_LISTING_ORIGIN_REQUIRED_MESSAGE,
  PRODUCT_LISTING_ORIGIN_VALUES,
} from "../../constants/productListingOriginConstants.js";
import { AppError } from "../../errors/AppError.js";

/**
 * @param {unknown} raw
 * @param {{ required?: boolean }} [options]
 * @returns {string | undefined}
 */
export const normalizeProductListingOrigin = (raw, { required = false } = {}) => {
  if (raw == null || raw === "") {
    if (required) {
      throw new AppError(400, PRODUCT_LISTING_ORIGIN_REQUIRED_MESSAGE);
    }
    return undefined;
  }

  const value = String(raw).trim();
  if (!PRODUCT_LISTING_ORIGIN_VALUES.includes(value)) {
    throw new AppError(400, PRODUCT_LISTING_ORIGIN_INVALID_MESSAGE);
  }

  return value;
};
