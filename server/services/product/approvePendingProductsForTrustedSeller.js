import {
  PRODUCT_MODERATION_APPROVED,
  PRODUCT_MODERATION_PENDING,
} from "../../constants/productModerationConstants.js";
import { ProductModel } from "../../models/index.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import { invalidateCatalogProductsCache } from "./catalogProductsResponseCache.js";
import { buildProductModerationFingerprint } from "./productContentFingerprint.js";
import { computeProductDiscountPercent } from "./productDiscount.js";

const BATCH_SIZE = 200;

const FINGERPRINT_SELECT = [
  "_id",
  "productName",
  "productDescription",
  "productImageUrls",
  "productPreviewVideoUrl",
  "productCategoryId",
  "productCharacteristics",
  "productStockQuantity",
  "productOldPrice",
  "productPrice",
].join(" ");

/**
 * Одобряет висящие `pending` карточки продавца без пушей подписчикам.
 *
 * Нужен при выдаче доверия и в миграции для тех, кому флаг уже поставили,
 * а очередь ещё не разобрали.
 *
 * @param {{ sellerId: string }} input
 * @returns {Promise<{ approved: number }>}
 */
export async function approvePendingProductsForTrustedSeller({ sellerId }) {
  const cursor = ProductModel.find({
    productSeller: sellerId,
    productModerationStatus: PRODUCT_MODERATION_PENDING,
  })
    .select(FINGERPRINT_SELECT)
    .lean()
    .cursor();

  /** @type {import("mongoose").AnyBulkWriteOperation[]} */
  let operations = [];
  let approved = 0;

  const flush = async () => {
    if (operations.length === 0) return;
    await ProductModel.bulkWrite(operations, { ordered: false });
    approved += operations.length;
    operations = [];
  };

  for await (const product of cursor) {
    const stock = Math.max(0, Math.floor(Number(product.productStockQuantity) || 0));
    operations.push({
      updateOne: {
        filter: {
          _id: product._id,
          productModerationStatus: PRODUCT_MODERATION_PENDING,
        },
        update: {
          $set: {
            productModerationStatus: PRODUCT_MODERATION_APPROVED,
            productModerationComment: "",
            productStockQuantity: stock,
            productIsAvailable: stock > 0,
            productLastApprovedDiscountPercent: computeProductDiscountPercent(
              product.productOldPrice,
              product.productPrice,
            ),
            productModerationApprovedHash:
              buildProductModerationFingerprint(product),
          },
        },
      },
    });
    if (operations.length >= BATCH_SIZE) await flush();
  }

  await flush();

  if (approved > 0) {
    invalidateCatalogProductsCache();
  }

  logServerEvent("info", {
    event: "approve_pending_products_for_trusted_seller",
    sellerId: String(sellerId),
    approved,
  });

  return { approved };
}
