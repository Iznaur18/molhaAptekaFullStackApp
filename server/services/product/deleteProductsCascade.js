import {
  PRICE_OFFER_STATUS_ACCEPTED,
  PRICE_OFFER_STATUS_REJECTED,
} from "../../constants/productPriceOfferConstants.js";
import {
  PRODUCT_PROMOTION_STATUS_ACTIVE,
  PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
} from "../../constants/productPromotionConstants.js";
import { normalizeStoredCartItems } from "../../controllers/Cart/cartItemHelpers.js";
import { removeProductIdsFromAllWishlists } from "../../controllers/Favorites/favoritesItemHelpers.js";
import {
  CartModel,
  ProductModel,
  ProductPriceOfferModel,
  ProductQuestionModel,
  ProductViewModel,
} from "../../models/index.js";
import { normalizeProductPreviewVideoUrl } from "../../utils/productPreviewVideo.js";
import { cancelProductPromotionsForProduct } from "../../utils/productPromotionHelpers.js";
import { rejectAllPendingOffersForProduct } from "../../utils/productPriceOfferHelpers.js";
import { resetBuyNFreeProgressForProduct } from "./applyBuyNFreeFields.js";
import { getProductIdsWithOpenSales } from "./productOrderLocks.js";
import { dismissPendingReportsForProduct } from "./productReportHelpers.js";
import { deleteUploadFileByUrl } from "../upload/deleteUploadFileByUrl.js";

/**
 * @param {string[]} productIds
 * @returns {Promise<number>} сколько корзин почищено
 */
async function removeProductIdsFromAllCarts(productIds) {
  const idSet = new Set(productIds.map(String).filter(Boolean));
  if (idSet.size === 0) return 0;

  const carts = await CartModel.find({})
    .select("userId items")
    .lean();
  let updatedCarts = 0;

  for (const cart of carts) {
    const items = normalizeStoredCartItems(cart.items);
    let changed = false;

    for (const productId of idSet) {
      if (Object.prototype.hasOwnProperty.call(items, productId)) {
        delete items[productId];
        changed = true;
      }
    }

    if (!changed) continue;

    await CartModel.updateOne({ userId: cart.userId }, { $set: { items } });
    updatedCarts += 1;
  }

  return updatedCarts;
}

/**
 * Удалить товары вместе со всем, что на них ссылается.
 *
 * Товары с незакрытыми продажами не удаляются никогда: заказ ссылается на
 * `productId`, и покупатель с продавцом остались бы с битой строкой заказа.
 * Такие возвращаются в `blockedIds` — вызывающий сам решает, что с ними делать
 * (обычно достаточно снять с витрины).
 *
 * @param {Array<{ _id: unknown; productPreviewVideoUrl?: unknown }>} products
 * @returns {Promise<{ deletedIds: string[]; blockedIds: string[] }>}
 */
export async function deleteProductsCascade(products) {
  const rows = (products ?? []).filter(Boolean);
  if (rows.length === 0) return { deletedIds: [], blockedIds: [] };

  const openSalesIds = await getProductIdsWithOpenSales(
    rows.map((row) => String(row._id)),
  );
  const deletable = rows.filter((row) => !openSalesIds.has(String(row._id)));
  const deletedIds = deletable.map((row) => String(row._id));

  if (deletable.length === 0) {
    return { deletedIds: [], blockedIds: [...openSalesIds] };
  }

  for (const product of deletable) {
    const previewVideoUrl = normalizeProductPreviewVideoUrl(
      product.productPreviewVideoUrl,
    );
    if (previewVideoUrl) {
      await deleteUploadFileByUrl(previewVideoUrl);
    }
    await dismissPendingReportsForProduct(product._id);
    await rejectAllPendingOffersForProduct(product._id);
    await cancelProductPromotionsForProduct({
      productId: product._id,
      statuses: [
        PRODUCT_PROMOTION_STATUS_PENDING_STAFF,
        PRODUCT_PROMOTION_STATUS_ACTIVE,
      ],
    });
    await resetBuyNFreeProgressForProduct(product._id);
    await ProductPriceOfferModel.updateMany(
      { productId: product._id, status: PRICE_OFFER_STATUS_ACCEPTED },
      { $set: { status: PRICE_OFFER_STATUS_REJECTED, reviewedAt: new Date() } },
    );
  }

  await ProductQuestionModel.deleteMany({ productId: { $in: deletedIds } });
  await ProductViewModel.deleteMany({ productId: { $in: deletedIds } });
  await ProductModel.deleteMany({ _id: { $in: deletedIds } });
  await removeProductIdsFromAllWishlists(deletedIds);
  await removeProductIdsFromAllCarts(deletedIds);

  return { deletedIds, blockedIds: [...openSalesIds] };
}
