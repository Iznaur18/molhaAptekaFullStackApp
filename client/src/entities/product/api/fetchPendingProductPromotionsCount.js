import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

export async function fetchPendingProductPromotionsCount() {
  try {
    const { data } = await apiClient.get("/product/promotions/pending/count");
    if (!data?.success || typeof data?.data?.totalPending !== "number") {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data.totalPending;
  } catch (e) {
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_PRODUCT_PROMOTIONS_COUNT_FALLBACK;
    throw new Error(message);
  }
}
