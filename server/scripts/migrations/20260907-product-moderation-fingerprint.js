import { PRODUCT_MODERATION_APPROVED } from "../../constants/productModerationConstants.js";
import { ProductModel } from "../../models/index.js";
import { buildProductModerationFingerprint } from "../../services/product/productContentFingerprint.js";

/**
 * Отпечаток одобренного содержимого для карточек, одобренных до его появления.
 *
 * Без бэкфила поле было бы пустым у всего живого каталога, и «карточка
 * вернулась той же самой» не отличалось бы от «карточку правили после
 * одобрения»: пустой отпечаток означает «неизвестно», а неизвестное всегда
 * трактуется в пользу повторной проверки.
 *
 * Пишем пачками и без обновления `updatedAt`: это служебная метка, а не правка
 * карточки, и сдвигать по ней сортировки каталога незачем.
 */
const BATCH_SIZE = 500;

export const up = async () => {
  const cursor = ProductModel.find({
    productModerationStatus: PRODUCT_MODERATION_APPROVED,
    $or: [
      { productModerationApprovedHash: { $exists: false } },
      { productModerationApprovedHash: "" },
    ],
  })
    .select(
      "_id productName productDescription productImageUrls productPreviewVideoUrl productCategoryId productCharacteristics",
    )
    .lean()
    .cursor();

  /** @type {import('mongoose').AnyBulkWriteOperation[]} */
  let operations = [];
  let updated = 0;

  const flush = async () => {
    if (operations.length === 0) return;
    await ProductModel.bulkWrite(operations, {
      ordered: false,
      timestamps: false,
    });
    updated += operations.length;
    operations = [];
  };

  for await (const product of cursor) {
    operations.push({
      updateOne: {
        filter: { _id: product._id },
        update: {
          $set: {
            productModerationApprovedHash:
              buildProductModerationFingerprint(product),
          },
        },
      },
    });
    if (operations.length >= BATCH_SIZE) await flush();
  }

  await flush();

  return { updated };
};
