import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type RecordProductViewResult = {
  recorded: boolean;
  uniqueViewerCount: number;
};

export const recordProductView = async (productId: string): Promise<RecordProductViewResult> => {
  try {
    const { data } = await apiClient.post(`/product/${productId}/view`);

    if (
      !data?.success ||
      data.data?.uniqueViewerCount == null ||
      Number.isNaN(Number(data.data.uniqueViewerCount))
    ) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return {
      recorded: Boolean(data.data.recorded),
      uniqueViewerCount: Number(data.data.uniqueViewerCount) || 0,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.RECORD_PRODUCT_VIEW_FALLBACK));
  }
};
