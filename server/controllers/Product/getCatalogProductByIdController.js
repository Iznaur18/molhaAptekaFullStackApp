import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { getHiddenSellerIds } from "../../services/access/adminUserGuard.js";
import { findCatalogProductById } from "../../services/product/findCatalogProductById.js";
import { attachProductAvailablePurchaseQuantity } from "../../services/product/productStock.js";
import { errorRes, successRes } from "../../services/http/index.js";
import { userHasPurchasedProduct } from "../../services/user/userPurchasedProduct.js";

/**
 * `GET /product/:productId/catalog` — карточка товара как в каталоге.
 */
export const getCatalogProductByIdController = async (req, res) => {
  const { productId } = req.params;
  const viewerUserId = req.userId ? String(req.userId) : null;

  const product = await findCatalogProductById(productId);
  if (!product) {
    return errorRes(res, 404, "Товар не найден");
  }

  const sellerId = String(product.productSeller?._id ?? product.productSeller ?? "");
  const isSeller = viewerUserId != null && sellerId !== "" && sellerId === viewerUserId;
  const isApproved = product.productModerationStatus === PRODUCT_MODERATION_APPROVED;

  if (!isApproved && !isSeller) {
    const purchased =
      viewerUserId != null && (await userHasPurchasedProduct(viewerUserId, productId));
    if (!purchased) {
      return errorRes(res, 404, "Товар не найден");
    }
  }

  if (!isSeller && isApproved) {
    const hiddenSellerIds = await getHiddenSellerIds();
    if (hiddenSellerIds.some((id) => String(id) === sellerId)) {
      const purchased =
        viewerUserId != null &&
        (await userHasPurchasedProduct(viewerUserId, productId));
      if (!purchased) {
        return errorRes(res, 404, "Товар не найден");
      }
    }
  }

  return successRes(res, {
    product: (await attachProductAvailablePurchaseQuantity([product]))[0],
  });
};
