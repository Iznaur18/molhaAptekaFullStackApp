import { findCatalogProductsByIds } from "../../services/product/findCatalogProductsByIds.js";
import { attachProductSellerClosedState } from "../../services/product/attachProductSellerClosedState.js";
import { attachProductAvailablePurchaseQuantity } from "../../services/product/productStock.js";
import { successRes } from "../../services/http/index.js";

/**
 * `GET /product/catalog-by-ids?ids=…` — карточки для строк корзины.
 * Не найденные id пропускаем: UI покажет «товар недоступен».
 */
export const getCatalogProductsByIdsController = async (req, res) => {
  const ids = Array.isArray(req.query?.ids) ? req.query.ids.map(String) : [];
  const viewerUserId = req.userId ? String(req.userId) : null;

  const products = await findCatalogProductsByIds(ids);
  const withStock = await attachProductAvailablePurchaseQuantity(products);
  const withViewerState = await attachProductSellerClosedState(
    withStock,
    viewerUserId,
  );

  return successRes(res, { products: withViewerState });
};
