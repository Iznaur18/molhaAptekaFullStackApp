import { catalogProductFacetsDataSchema } from "@molha/api-contract";
import type { z } from "zod";

import { apiClient, parseApiContractData } from "@/shared/api";
import { API_CLIENT_UI } from "@/shared/config";
import { formatApiErrorMessage } from "@/shared/lib";

import {
  buildCatalogProductsRequestParams,
  type CatalogProductsRequestOptions,
} from "./fetchCatalogProductsPage";

export type CatalogProductFacets = z.infer<typeof catalogProductFacetsDataSchema>;

/** `GET /product/facets`: сколько товаров даст выдача и каждый вариант фильтра. */
export const fetchCatalogProductFacets = async (
  options: CatalogProductsRequestOptions,
): Promise<CatalogProductFacets> => {
  try {
    const { data } = await apiClient.get("/product/facets", {
      params: buildCatalogProductsRequestParams(options),
    });
    return parseApiContractData(data, catalogProductFacetsDataSchema);
  } catch (error) {
    throw new Error(
      formatApiErrorMessage(error, API_CLIENT_UI.FETCH_PRODUCTS_FALLBACK),
    );
  }
};
