import { apiClient, parseCatalogProductsPageData } from "@/shared/api";
import { API_CLIENT_UI, CATALOG_PAGE_SIZE } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type FetchCatalogProductsPageOptions = {
  page?: number;
  limit?: number;
  search?: string;
  productCategory?: string;
  categoryId?: string;
  sellerPersonalCategoryId?: string;
  sort?: string;
  followingOnly?: boolean;
  auctionOnly?: boolean;
  installmentOnly?: boolean;
  saleOnly?: boolean;
  regionCode?: string;
};

export const fetchCatalogProductsPage = async ({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  search,
  productCategory,
  categoryId,
  sellerPersonalCategoryId,
  sort,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  regionCode,
}: FetchCatalogProductsPageOptions = {}) => {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...(search?.trim() ? { search: search.trim() } : {}),
        ...(productCategory?.trim() ? { productCategory: productCategory.trim() } : {}),
        ...(categoryId?.trim() ? { categoryId: categoryId.trim() } : {}),
        ...(sellerPersonalCategoryId?.trim()
          ? { sellerPersonalCategoryId: sellerPersonalCategoryId.trim() }
          : {}),
        ...(sort ? { sort } : {}),
        ...(followingOnly ? { followingOnly: "true" } : {}),
        ...(auctionOnly ? { auctionOnly: "true" } : {}),
        ...(installmentOnly ? { installmentOnly: "true" } : {}),
        ...(saleOnly ? { saleOnly: "true" } : {}),
        ...(regionCode?.trim() ? { regionCode: regionCode.trim() } : {}),
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
