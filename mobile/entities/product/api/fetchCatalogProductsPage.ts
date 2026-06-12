import { apiClient, parseCatalogProductsPageData } from "@/shared/api";
import { API_CLIENT_UI, CATALOG_PAGE_SIZE } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FetchCatalogProductsPageOptions = {
  page?: number;
  limit?: number;
  search?: string;
  productCategory?: string;
  categoryId?: string;
};

export const fetchCatalogProductsPage = async ({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  search,
  productCategory,
  categoryId,
}: FetchCatalogProductsPageOptions = {}) => {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(productCategory?.trim() ? { productCategory: productCategory.trim() } : {}),
        ...(categoryId?.trim() ? { categoryId: categoryId.trim() } : {}),
      },
    });
    const parsed = parseCatalogProductsPageData(data);
    return {
      products: parsed.products,
      pagination: parsed.pagination,
    };
  } catch (error) {
    throw new Error(formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK));
  }
};
