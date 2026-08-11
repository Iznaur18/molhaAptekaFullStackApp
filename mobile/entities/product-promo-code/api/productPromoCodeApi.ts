import {
  activateProductPromoCodeDataSchema,
  listProductPromoCodesDataSchema,
  myAppliedProductPromosDataSchema,
  replaceProductPromoCodesDataSchema,
} from "@molha/api-contract";

import { apiClient, parseApiContractData } from "@/shared/api";
import { PRODUCT_PROMO_CODE_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchProductPromoCodes = async (productId: string) => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/promo-codes`);
    return parseApiContractData(data, listProductPromoCodesDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK),
    );
  }
};

export const replaceProductPromoCodes = async (
  productId: string,
  promoCodes: Array<{
    code: string;
    discountPercent: number;
    enabled: boolean;
    maxActivations: number;
  }>,
) => {
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
};

export const activateProductPromoCode = async (productId: string, code: string) => {
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
};

export const fetchMyAppliedProductPromos = async () => {
  try {
    const { data } = await apiClient.get("/product/promo-activations/me");
    return parseApiContractData(data, myAppliedProductPromosDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, PRODUCT_PROMO_CODE_UI.FETCH_FALLBACK),
    );
  }
};
