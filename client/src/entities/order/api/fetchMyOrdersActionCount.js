import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/** `GET /order/action-count` */
export async function fetchMyOrdersActionCount() {
  try {
    const { data } = await apiClient.get("/order/action-count");
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return Number(data.data?.count) || 0;
  } catch {
    return 0;
  }
}
