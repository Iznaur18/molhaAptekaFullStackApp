import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { AppError } from "../../errors/AppError.js";
import { getHiddenSellerIds } from "../access/adminUserGuard.js";
import { isUserBlockedBy } from "../user/userBlockHelpers.js";
import { userHasPurchasedProduct } from "../user/userPurchasedProduct.js";
import { attachProductSellerClosedState } from "./attachProductSellerClosedState.js";
import { findCatalogProductById } from "./findCatalogProductById.js";
import { attachProductAvailablePurchaseQuantity } from "./productStock.js";

/**
 * @param {{ productId: string; viewerUserId?: string | null }} args
 */
export async function getCatalogProductByIdForViewer({
  productId,
  viewerUserId = null,
}) {
  const product = await findCatalogProductById(productId);
  if (!product) {
    throw new AppError(404, "Товар не найден");
  }

  const sellerId = String(product.productSeller?._id ?? product.productSeller ?? "");
  const isSeller = viewerUserId != null && sellerId !== "" && sellerId === viewerUserId;
  const isApproved = product.productModerationStatus === PRODUCT_MODERATION_APPROVED;

  if (!isApproved && !isSeller) {
    const purchased =
      viewerUserId != null && (await userHasPurchasedProduct(viewerUserId, productId));
    if (!purchased) {
      throw new AppError(404, "Товар не найден");
    }
  }

  if (!isSeller && isApproved) {
    const hiddenSellerIds = await getHiddenSellerIds();
    if (hiddenSellerIds.some((id) => String(id) === sellerId)) {
      const purchased =
        viewerUserId != null &&
        (await userHasPurchasedProduct(viewerUserId, productId));
      if (!purchased) {
        throw new AppError(404, "Товар не найден");
      }
    }
  }

  const productWithStock = (await attachProductAvailablePurchaseQuantity([product]))[0];
  const [productWithViewerState] = await attachProductSellerClosedState(
    [productWithStock],
    viewerUserId,
  );
  let isBlockedBySeller = false;
  if (viewerUserId && sellerId && sellerId !== viewerUserId) {
    isBlockedBySeller = await isUserBlockedBy(sellerId, viewerUserId);
  }

  return {
    product: {
      ...productWithViewerState,
      isBlockedBySeller,
    },
  };
}
