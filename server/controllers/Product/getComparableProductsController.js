import { findComparableProducts } from "../../services/product/findComparableProducts.js";
import { successRes } from "../../services/http/index.js";

/**
 * GET /product/:productId/compare — товары для блока «Сравнение» в деталях.
 */
export async function getComparableProductsController(req, res) {
  const productId = String(req.params.productId ?? "");
  const result = await findComparableProducts(productId);
  return successRes(res, { products: result.products });
}
