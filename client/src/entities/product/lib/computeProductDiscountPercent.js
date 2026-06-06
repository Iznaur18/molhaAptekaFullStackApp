/**
 * @param {number | null | undefined} oldPrice
 * @param {number | null | undefined} price
 * @returns {number | null}
 */
export function computeProductDiscountPercent(oldPrice, price) {
  const old = Math.floor(Number(oldPrice));
  const current = Math.floor(Number(price));
  if (!Number.isFinite(old) || !Number.isFinite(current)) {
    return null;
  }
  if (old <= current) {
    return null;
  }
  return Math.floor((1 - current / old) * 100);
}

/**
 * @param {{
 *   productOldPrice?: number | null;
 *   productPrice?: number | null;
 *   discountPercent?: number | null;
 * }} product
 * @returns {number | null}
 */
export function resolveProductDiscountPercent(product) {
  if (product.discountPercent != null && Number.isFinite(product.discountPercent)) {
    const fromApi = Math.floor(Number(product.discountPercent));
    return fromApi > 0 ? fromApi : null;
  }
  return computeProductDiscountPercent(product.productOldPrice, product.productPrice);
}

/**
 * @param {{
 *   productOldPrice?: number | null;
 *   productPrice?: number | null;
 *   discountPercent?: number | null;
 * }} product
 */
export function hasProductCatalogDiscount(product) {
  return resolveProductDiscountPercent(product) != null;
}

import { keepDigitsOnly } from "../../../shared/lib/numericInput.js";

/**
 * @param {string} raw
 * @returns {number | null}
 */
export function parseProductPriceInput(raw) {
  const digits = keepDigitsOnly(raw);
  if (digits === "") {
    return null;
  }
  const value = Math.floor(Number(digits));
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return value;
}

/**
 * @param {number | null} oldPrice
 * @param {number | null} price
 * @returns {string | null}
 */
export function validateProductOldPricePair(oldPrice, price) {
  if (oldPrice == null) {
    return null;
  }
  if (price == null || !Number.isFinite(price) || price < 0) {
    return "Укажите текущую цену";
  }
  if (oldPrice <= price) {
    return "Старая цена должна быть больше текущей";
  }
  return null;
}
