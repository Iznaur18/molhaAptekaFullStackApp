import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const submitProductReport = async (productId: string, reportText: string) => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/report`, {
      reportText,
    });

    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.SUBMIT_PRODUCT_REPORT_FALLBACK),
    );
  }
};
