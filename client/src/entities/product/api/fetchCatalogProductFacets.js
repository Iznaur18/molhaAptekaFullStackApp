import { catalogProductFacetsDataSchema } from "@molha/api-contract";
import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parseApiContractData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";
import { buildCatalogProductsRequestParams } from "./fetchCatalogProductsPage.js";

/**
 * `GET /product/facets`: сколько товаров даст выдача и каждый вариант фильтра.
 *
 * @param {import('./fetchCatalogProductsPage.js').CatalogProductsRequestOptions} options
 * @returns {Promise<import('zod').infer<typeof catalogProductFacetsDataSchema>>}
 */
export async function fetchCatalogProductFacets(options) {
  try {
    const { data } = await apiClient.get("/product/facets", {
      params: buildCatalogProductsRequestParams(options),
    });
    return parseApiContractData(data, catalogProductFacetsDataSchema);
  } catch (e) {
    throw new Error(formatApiErrorMessage(e, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK));
  }
}
