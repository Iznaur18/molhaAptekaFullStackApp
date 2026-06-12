import { apiClient, parseProductReportStatusData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export const fetchMyProductReportStatus = async (productId: string) => {
  try {
    const { data } = await apiClient.get(`/product/${productId}/report/me`);
    return parseProductReportStatusData(data);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_REPORT_STATUS_FALLBACK),
    );
  }
};
