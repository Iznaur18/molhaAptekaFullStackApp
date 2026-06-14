import { apiClient, parseMySalesData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FetchMySalesOptions = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

export const fetchMySales = async ({
  page = 1,
  limit = 20,
  status,
  search,
}: FetchMySalesOptions = {}) => {
  try {
    const { data } = await apiClient.get("/order/sales", {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(search?.trim() ? { search: search.trim() } : {}),
      },
    });
    return parseMySalesData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_SALES_FALLBACK));
  }
};
