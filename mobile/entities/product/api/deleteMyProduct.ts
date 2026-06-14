import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const deleteMyProduct = async (productId: string) => {
  try {
    const { data } = await apiClient.delete(`/product/${productId}`);
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return data.data ?? {};
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.DELETE_MY_PRODUCT_FALLBACK));
  }
};
