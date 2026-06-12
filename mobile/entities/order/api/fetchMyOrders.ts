import { apiClient, parseMyOrdersData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMyOrders = async () => {
  try {
    const { data } = await apiClient.get("/order");
    return parseMyOrdersData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_ORDERS_FALLBACK));
  }
};
