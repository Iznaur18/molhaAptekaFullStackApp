import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { PRODUCTS_FETCH_PAGE_LIMIT } from "../model/productConstants.js";

/**
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchAllProducts() {
  const limit = PRODUCTS_FETCH_PAGE_LIMIT;
  let page = 1;
  /** @type {import('../model/types.js').ProductFromApi[]} */
  const all = [];

  while (true) {
    const { data } = await apiClient.get("/product", {
      params: { page, limit },
    });

    if (!data?.success || !data.data) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    const { products = [], pagination } = data.data;
    all.push(...products);

    const totalPages = pagination?.totalPages ?? 1;
    if (page >= totalPages) break;
    page += 1;
  }

  return all;
}
