import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @returns {Promise<Array<{
 *   code: string;
 *   title: string;
 *   durationHours: number;
 *   priceRub: number;
 *   pricePoints: number;
 * }>>}
 */
export async function fetchProductPromotionTariffs() {
  try {
    const { data } = await apiClient.get("/product/promotions/tariffs");
    if (!data?.success || !Array.isArray(data?.data?.tariffs)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.tariffs.map((tariff) => ({
      ...tariff,
      pricePoints: Number(tariff.pricePoints),
    }));
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_PROMOTION_TARIFFS_FALLBACK;
    throw new Error(message);
  }
}
