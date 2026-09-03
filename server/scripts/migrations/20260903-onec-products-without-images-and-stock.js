import { OneCPendingProductModel, ProductModel } from "../../models/index.js";
import { deleteProductsCascade } from "../../services/product/deleteProductsCascade.js";
import { productsWithoutImagesFilter } from "../../services/product/productImagePresence.js";

/** За раз удаляем пачкой, чтобы не держать весь каталог продавца в памяти. */
const BATCH_SIZE = 200;

/**
 * Правило приёмки 1С «нет картинок И нет остатка» задним числом.
 *
 * Такие карточки уже лежат на сайте с прошлых выгрузок: их нельзя ни показать
 * (нечего показывать), ни купить (нечего продавать). Удаляем со всеми связями;
 * если товар успел попасть в незакрытый заказ — оставляем и просто снимаем
 * с витрины, иначе строка заказа осталась бы битой.
 *
 * Описание удалённых не сохраняем: ближайшая полная выгрузка 1С сама положит
 * их в отстойник (`OneCPendingProduct`), а с остатком — вернёт на сайт.
 *
 * @param {{ isApply?: boolean }} [context]
 */
export const up = async ({ isApply = false } = {}) => {
  const filter = {
    productFromOneC: true,
    $and: [
      productsWithoutImagesFilter,
      {
        $or: [
          { productStockQuantity: { $lte: 0 } },
          { productStockQuantity: null },
          { productStockQuantity: { $exists: false } },
        ],
      },
    ],
  };

  const candidates = await ProductModel.countDocuments(filter);
  if (!isApply) {
    return { candidates, deleted: 0, blockedByOrders: 0, dryRun: true };
  }

  await OneCPendingProductModel.createIndexes();

  let deleted = 0;
  const blocked = new Set();

  // Курсор здесь не годится: удаление меняет выборку под ним. Читаем пачками,
  // исключая уже заблокированные, пока свежие кандидаты не кончатся.
  for (;;) {
    const batch = await ProductModel.find({
      ...filter,
      ...(blocked.size > 0 ? { _id: { $nin: [...blocked] } } : {}),
    })
      .select("_id productPreviewVideoUrl")
      .limit(BATCH_SIZE)
      .lean();

    if (batch.length === 0) break;

    const { deletedIds, blockedIds } = await deleteProductsCascade(batch);
    deleted += deletedIds.length;
    for (const id of blockedIds) blocked.add(String(id));

    if (blockedIds.length > 0) {
      await ProductModel.updateMany(
        { _id: { $in: blockedIds } },
        {
          $set: {
            productIsAvailable: false,
            productOutOfStock: true,
            productStockQuantity: 0,
          },
        },
      );
    }
  }

  return { candidates, deleted, blockedByOrders: blocked.size };
};
