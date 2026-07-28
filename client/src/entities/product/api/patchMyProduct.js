import { formatApiErrorMessage } from "@izibuy/shared-lib";

import { apiClient } from "../../../shared/api/index.js";
import { parsePatchMyProductData } from "../../../shared/api/parseApiContract.js";
import { API_CLIENT_UI } from "../../../shared/config/appUiCopy.js";

/**
 * @param {unknown} payload
 * @returns {import('../model/types.js').ProductFromApi | null}
 */
function readRawPatchedProduct(payload) {
  if (
    payload == null ||
    typeof payload !== "object" ||
    /** @type {{ success?: unknown }} */ (payload).success !== true
  ) {
    return null;
  }
  const data = /** @type {{ data?: unknown }} */ (payload).data;
  if (data == null || typeof data !== "object") {
    return null;
  }
  const product = /** @type {{ product?: unknown }} */ (data).product;
  if (product == null || typeof product !== "object") {
    return null;
  }
  const id = /** @type {{ _id?: unknown }} */ (product)._id;
  if (id == null || String(id).trim() === "") {
    return null;
  }
  return /** @type {import('../model/types.js').ProductFromApi} */ (product);
}

/**
 * `PATCH /product/:productId` — частичное обновление своего товара (Bearer).
 *
 * @param {string} productId
 * @param {Record<string, unknown>} body
 * @returns {Promise<import('../model/types.js').ProductFromApi>}
 */
export async function patchMyProduct(productId, body) {
  try {
    const { data } = await apiClient.patch(`/product/${productId}`, body);
    try {
      const parsed = parsePatchMyProductData(data);
      return parsed.product;
    } catch (parseError) {
      const rawProduct = readRawPatchedProduct(data);
      if (rawProduct) {
        if (import.meta.env.DEV) {
          const detail =
            parseError instanceof Error && parseError.cause
              ? String(parseError.cause)
              : parseError instanceof Error
                ? parseError.message
                : String(parseError);
          console.warn("[patchMyProduct] schema mismatch, using raw product", detail);
        }
        return rawProduct;
      }
      throw parseError;
    }
  } catch (e) {
    throw new Error(
      formatApiErrorMessage(e, API_CLIENT_UI.PATCH_MY_PRODUCT_FALLBACK),
    );
  }
}
