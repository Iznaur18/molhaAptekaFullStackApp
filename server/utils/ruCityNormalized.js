import { normalizeRuCityKey } from "@molha/api-contract";

import { normalizeProductSaleCity } from "./productSaleCity.js";

/**
 * @param {unknown} cityLabel
 */
export function resolveUserAddressCityNormalized(cityLabel) {
  if (cityLabel == null || String(cityLabel).trim() === "") {
    return "";
  }
  return normalizeRuCityKey(String(cityLabel).trim());
}

/**
 * @param {unknown} saleCityLabel
 */
export function resolveProductSaleCityNormalized(saleCityLabel) {
  if (saleCityLabel == null || String(saleCityLabel).trim() === "") {
    return "";
  }
  return normalizeRuCityKey(String(saleCityLabel).trim());
}

/**
 * @param {unknown} raw
 */
export function applyProductSaleCityFields(raw) {
  const productSaleCity = normalizeProductSaleCity(raw);
  return {
    productSaleCity,
    productSaleCityNormalized: resolveProductSaleCityNormalized(productSaleCity),
  };
}
