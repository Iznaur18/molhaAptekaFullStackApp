import { apiClient, parseCatalogProductsPageData } from "@/shared/api";
import { API_CLIENT_UI, CATALOG_PAGE_SIZE } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

export type CatalogProductsRequestOptions = {
  search?: string;
  productCategory?: string;
  categoryId?: string;
  sellerPersonalCategoryId?: string;
  sort?: string;
  followingOnly?: boolean;
  auctionOnly?: boolean;
  installmentOnly?: boolean;
  saleOnly?: boolean;
  rentalOnly?: boolean;
  affiliateOnly?: boolean;
  wholesaleOnly?: boolean;
  buyNFreeOnly?: boolean;
  originalOnly?: boolean;
  flashSaleOnly?: boolean;
  near?: boolean;
  priceMin?: number;
  priceMax?: number;
  delivery?: readonly string[];
  pickupOnly?: boolean;
  ratingMin?: number;
  withReviews?: boolean;
  returnOnly?: boolean;
  sellerConfirmed?: boolean;
  sellerPremium?: boolean;
  regionCode?: string;
};

export type FetchCatalogProductsPageOptions = CatalogProductsRequestOptions & {
  page?: number;
  limit?: number;
};

/** Query `GET /product` и `GET /product/facets` — один построитель, как на web. */
export const buildCatalogProductsRequestParams = ({
  search,
  productCategory,
  categoryId,
  sellerPersonalCategoryId,
  sort,
  followingOnly,
  auctionOnly,
  installmentOnly,
  saleOnly,
  rentalOnly,
  affiliateOnly,
  wholesaleOnly,
  buyNFreeOnly,
  originalOnly,
  flashSaleOnly,
  near,
  priceMin,
  priceMax,
  delivery,
  pickupOnly,
  ratingMin,
  withReviews,
  returnOnly,
  sellerConfirmed,
  sellerPremium,
  regionCode,
}: CatalogProductsRequestOptions = {}) => ({
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
  ...(rentalOnly ? { rentalOnly: "true" } : {}),
  ...(affiliateOnly ? { affiliateOnly: "true" } : {}),
  ...(wholesaleOnly ? { wholesaleOnly: "true" } : {}),
  ...(buyNFreeOnly ? { buyNFreeOnly: "true" } : {}),
  ...(originalOnly ? { originalOnly: "true" } : {}),
  ...(flashSaleOnly ? { flashSaleOnly: "true" } : {}),
  ...(near ? { near: "true" } : {}),
  ...(priceMin != null ? { priceMin } : {}),
  ...(priceMax != null ? { priceMax } : {}),
  ...(delivery?.length ? { delivery: delivery.join(",") } : {}),
  ...(pickupOnly ? { pickupOnly: "true" } : {}),
  ...(ratingMin != null ? { ratingMin } : {}),
  ...(withReviews ? { withReviews: "true" } : {}),
  ...(returnOnly ? { returnOnly: "true" } : {}),
  ...(sellerConfirmed ? { sellerConfirmed: "true" } : {}),
  ...(sellerPremium ? { sellerPremium: "true" } : {}),
  ...(regionCode?.trim() ? { regionCode: regionCode.trim() } : {}),
});

export const fetchCatalogProductsPage = async ({
  page = 1,
  limit = CATALOG_PAGE_SIZE,
  ...options
}: FetchCatalogProductsPageOptions = {}) => {
  try {
    const { data } = await apiClient.get("/product", {
      params: {
        page,
        limit,
        ...buildCatalogProductsRequestParams(options),
      },
    });
    const parsed = parseCatalogProductsPageData(data);
    return {
      products: parsed.products,
      pagination: parsed.pagination,
    };
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK),
    );
  }
};
