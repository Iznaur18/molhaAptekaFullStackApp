import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** `GET /order/sales/action-count` */
export async function fetchMySalesActionCount() {
  try {
    const { data } = await apiClient.get("/order/sales/action-count");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return Number(data.data?.count) || 0;
  } catch {
    return 0;
  }
}
