import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { PRODUCT_PROMO_CODE_UI } from "../../../shared/config/appUiCopy.js";
import {
  activateProductPromoCodeDataSchema,
  listProductPromoCodesDataSchema,
  myAppliedProductPromosDataSchema,
  replaceProductPromoCodesDataSchema,
} from "@molha/api-contract";

/**
 * @param {string} productId
 */
export async function fetchProductPromoCodes(productId) {
  try {
    const { data } = await apiClient.get(`/product/${productId}/promo-codes`);
    return parseApiContractData(data, listProductPromoCodesDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK),
    );
  }
}

/**
 * @param {string} productId
 * @param {Array<{
 *   code: string;
 *   discountPercent: number;
 *   enabled: boolean;
 *   maxActivations: number;
 * }>} promoCodes
 */
export async function replaceProductPromoCodes(productId, promoCodes) {
  try {
    const { data } = await apiClient.put(`/product/${productId}/promo-codes`, {
      promoCodes,
    });
    return parseApiContractData(data, replaceProductPromoCodesDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.SAVE_FALLBACK),
    );
  }
}

/**
 * @param {string} productId
 * @param {string} code
 */
export async function activateProductPromoCode(productId, code) {
  try {
    const { data } = await apiClient.post(
      `/product/${productId}/promo-codes/activate`,
      { code },
    );
    return parseApiContractData(data, activateProductPromoCodeDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.ACTIVATE_FALLBACK),
    );
  }
}

export async function fetchMyAppliedProductPromos() {
  try {
    const { data } = await apiClient.get("/product/promo-activations/me");
    return parseApiContractData(data, myAppliedProductPromosDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK),
    );
  }
}
