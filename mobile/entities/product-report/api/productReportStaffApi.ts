import { apiClient } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type ProductReportGroup = {
  product: Record<string, unknown> & {
    _id: string;
    productName?: string;
    productSeller?: string | { _id?: string; userName?: string } | null;
  };
  reportCount: number;
  reports: Array<{
    _id: string;
    reportText?: string;
    createdAt?: string;
    reporter?: { _id?: string; userName?: string } | null;
  }>;
};

export const fetchPendingProductReports = async () => {
  try {
    const { data } = await apiClient.get("/product/reports/pending");
    if (!data?.success || !Array.isArray(data.data?.groups)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
    return {
      groups: data.data.groups as ProductReportGroup[],
      totalReports: Number(data.data.totalReports) || 0,
      totalGroups: Number(data.data.totalGroups) || 0,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCT_REPORTS_FALLBACK),
    );
  }
};

export const resolveProductReports = async (
  productId: string,
  body: { resolution: string; staffNote: string },
) => {
  try {
    const { data } = await apiClient.patch(
      `/product/reports/product/${productId}/resolve`,
      body,
    );
    if (!data?.success) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.RESOLVE_PRODUCT_REPORTS_FALLBACK),
    );
  }
};
