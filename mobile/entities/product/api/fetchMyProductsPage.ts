import { apiClient, parseCatalogProductsPageData } from "@/shared/api";
import { API_CLIENT_UI, CATALOG_PAGE_SIZE } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FetchMyProductsPageOptions = {
  page?: number;
  limit?: number;
  search?: string;
  productCategory?: string;
  sort?: string;
  moderationStatus?: "" | "pending" | "rejected";
};

export const fetchMyProductsPage = async ({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  search,
  productCategory,
  sort,
  moderationStatus,
}: FetchMyProductsPageOptions = {}) => {
  try {
    const { data } = await apiClient.get("/product/my", {
      params: {
        page,
        limit,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(productCategory?.trim() ? { productCategory: productCategory.trim() } : {}),
        ...(sort ? { sort } : {}),
        ...(moderationStatus ? { moderationStatus } : {}),
      },
    });
    return parseCatalogProductsPageData(data);
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_MY_PRODUCTS_FALLBACK));
  }
};
