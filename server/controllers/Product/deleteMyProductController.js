import { ProductModel } from "../../models/index.js";
import { isUserAdmin } from "../../services/access/adminUserGuard.js";
import {
  hasProductOpenSales,
  OPEN_SALES_BLOCK_MESSAGE,
} from "../../utils/productOrderLocks.js";
import { dismissPendingReportsForProduct } from "../../services/product/productReportHelpers.js";
import { rejectAllPendingOffersForProduct } from "../../utils/productPriceOfferHelpers.js";
import { ProductPriceOfferModel } from "../../models/index.js";
import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_REJECTED,
} from "../../constants/productPriceOfferConstants.js";
import {
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
} from "../../constants/productPromotionConstants.js";
import { cancelProductPromotionsForProduct } from "../../utils/productPromotionHelpers.js";
import { deleteUploadFileByUrl } from "../../services/upload/deleteUploadFileByUrl.js";
import { normalizeProductPreviewVideoUrl } from "../../utils/productPreviewVideo.js";
import { removeProductIdsFromAllWishlists } from "../Favorites/favoritesItemHelpers.js";
import { errorRes, successRes } from "../../services/http/index.js";

/** Удаление своего товара (любой статус модерации) или любого (admin). DELETE /product/:productId */
export const deleteMyProductController = async (req, res) => {
  const userId = req.userId;
  const { productId } = req.params;
  const isAdmin = await isUserAdmin(userId);

  if (await hasProductOpenSales(productId)) {
    return errorRes(res, 409, OPEN_SALES_BLOCK_MESSAGE);
  }

  const ownerFilter = isAdmin
    ? { _id: productId }
    : {
        _id: productId,
        productSeller: userId,
      };

  const deleted = await ProductModel.findOneAndDelete(ownerFilter).lean();

  if (deleted) {
    await removeProductIdsFromAllWishlists([String(productId)]);
    const previewVideoUrl = normalizeProductPreviewVideoUrl(
      deleted.productPreviewVideoUrl,
    );
    if (previewVideoUrl) {
      await deleteUploadFileByUrl(previewVideoUrl);
    }
    await dismissPendingReportsForProduct(productId);
    await rejectAllPendingOffersForProduct(productId);
    await cancelProductPromotionsForProduct({
      productId,
      statuses: [
        PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
        PRODUCT_PROMOTION_STATUS_ACTIVE,
      ],
    });
    const now = new Date();
    await ProductPriceOfferModel.updateMany(
      { productId, status: PRICE_OFFER_STATUS_ACCEPTED },
      {
        $set: {
          status: PRICE_OFFER_STATUS_REJECTED,
          reviewedAt: now,
        },
      },
    );
  }

  if (!deleted) {
    return errorRes(res, 404, "Товар не найден или нет прав на удаление");
  }

  return successRes(res, { message: "Товар удалён" });
};
