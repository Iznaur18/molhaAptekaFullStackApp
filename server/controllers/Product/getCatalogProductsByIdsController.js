import { findCatalogProductsByIds } from "../../services/product/findCatalogProductsByIds.js";
import { attachProductSellerClosedState } from "../../services/product/attachProductSellerClosedState.js";
import { attachProductAvailablePurchaseQuantity } from "../../services/product/productStock.js";
import { successRes } from "../../services/http/index.js";

/**
 * @param {unknown} raw
 * @returns {string[]}
 */
function readProductIdsQuery(raw) {
  if (Array.isArray(raw)) {
    return raw
      .flatMap((row) => String(row ?? "").split(","))
      .map((row) => row.trim())
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(",")
      .map((row) => row.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * `GET /product/catalog-by-ids?ids=…` — карточки для строк корзины.
 * Не найденные id пропускаем: UI покажет «товар недоступен».
 */
export const getCatalogProductsByIdsController = async (req, res) => {
  // Не полагаемся только на Array.isArray после validateQueryZod:
  // Express иногда оставляет ids строкой «a,b,c» — тогда [] и «все недоступны».
  const ids = readProductIdsQuery(req.query?.ids);
  const viewerUserId = req.userId ? String(req.userId) : null;

  const products = await findCatalogProductsByIds(ids);
  const withStock = await attachProductAvailablePurchaseQuantity(products);
  const withViewerState = await attachProductSellerClosedState(
    withStock,
    viewerUserId,
  );

  return successRes(res, { products: withViewerState });
};
