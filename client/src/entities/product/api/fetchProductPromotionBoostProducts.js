import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * Товары с действующим «Бустом» в регионе зрителя — обычные каталожные
 * карточки, как в подборках товаров.
 *
 * @param {{ regionCode?: string }} [params]
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchProductPromotionBoostProducts({ regionCode } = {}) {
  try {
    const { data } = await apiClient.get("/product/promotions/boost-products", {
      params: regionCode ? { regionCode } : undefined,
    });
    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.products;
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(
        e,
        API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_BOOST_PRODUCTS_FALLBACK,
      ),
    );
  }
}
