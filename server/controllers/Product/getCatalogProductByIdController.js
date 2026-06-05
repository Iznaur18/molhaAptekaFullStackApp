import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { getHiddenSellerIds } from "../../utils/adminUserGuard.js";
import { findCatalogProductById } from "../../utils/findCatalogProductById.js";
import { errorRes, successRes } from "../../utils/index.js";
import { userHasPurchasedProduct } from "../../utils/userPurchasedProduct.js";

/**
 * `GET /product/:productId/catalog` — карточка товара как в каталоге.
 */
export const getCatalogProductByIdController = async (req, res) => {
  try {
    const { productId } = req.params;
    const viewerUserId = req.userId ? String(req.userId) : null;

    const product = await findCatalogProductById(productId);
    if (!product) {
      return errorRes(res, 404, "Товар не найден");
    }

    const sellerId = String(product.productSeller?._id ?? product.productSeller ?? "");
    const isSeller =
      viewerUserId != null && sellerId !== "" && sellerId === viewerUserId;
    const isApproved = product.productModerationStatus === PRODUCT_MODERATION_APPROVED;

    if (!isApproved && !isSeller) {
      const purchased =
        viewerUserId != null &&
        (await userHasPurchasedProduct(viewerUserId, productId));
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

    return successRes(res, { product });
  } catch (error) {
    console.error("getCatalogProductByIdController error:", error);
    return errorRes(res, 500, "Ошибка при загрузке товара");
  }
};
