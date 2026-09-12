import { apiClient } from "../../../shared/api/index.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

import { fetchCatalogProductById } from "./fetchCatalogProductById.js";

/**
 * @param {string[]} ids
 */
async function fetchCatalogProductsByIdsFallback(ids) {
  const rows = await Promise.all(
    ids.map((id) =>
      fetchCatalogProductById(id).catch(() => /** @type {null} */ (null)),
    ),
  );
  return rows.filter(Boolean);
}

/**
 * `GET /product/catalog-by-ids?ids=…` — карточки только для id из корзины.
 * Если batch-ручки ещё нет на API (404) — fallback по одному `/catalog`.
 *
 * @param {string[]} productIds
 * @returns {Promise<import('../model/types.js').ProductFromApi[]>}
 */
export async function fetchCatalogProductsByIds(productIds) {
  const ids = [
    ...new Set(
      (Array.isArray(productIds) ? productIds : [])
        .map(String)
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
  if (ids.length === 0) {
    return [];
  }

  try {
    const { data } = await apiClient.get("/product/catalog-by-ids", {
      params: { ids: ids.join(",") },
    });

    if (!data?.success || !Array.isArray(data.data?.products)) {
      throw new Error(API_CLIENT_UI.INVALID_SERVER_RESPONSE);
    }

    return /** @type {import('../model/types.js').ProductFromApi[]} */ (
      data.data.products
    );
  } catch (e) {
    const status = e?.response?.status;
    if (status === 404 || status === 400) {
      return fetchCatalogProductsByIdsFallback(ids);
    }
    const message =
      e?.response?.data?.message ??
      e?.message ??
      API_CLIENT_UI.FETCH_CATALOG_PRODUCT_FALLBACK;
    throw new Error(message);
  }
}
