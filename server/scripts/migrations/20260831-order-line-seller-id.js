/**
 * Backfill `items.sellerIdAtOrder` в заказах из `products.productSeller`.
 *
 * Продавец позиции раньше нигде в заказе не хранился и выяснялся через
 * populate товара. Отправление (заказ + продавец) без этого поля не собрать,
 * а у заказов с удалёнными товарами продавец терялся совсем.
 *
 * Точечно правим только нужные элементы массива через arrayFilters — целиком
 * `items` не переписываем, чтобы не затереть параллельную смену статуса.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const orders = db.collection("orders");
  const products = db.collection("products");

  const needsBackfill = {
    items: {
      $elemMatch: {
        $or: [
          { sellerIdAtOrder: { $exists: false } },
          { sellerIdAtOrder: null },
        ],
      },
    },
  };

  const matched = await orders.countDocuments(needsBackfill);

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  /** @type {Map<string, import('mongodb').ObjectId>} */
  const sellerByProductId = new Map();
  const productCursor = products.find({}, { projection: { productSeller: 1 } });
  for await (const product of productCursor) {
    if (product?.productSeller) {
      sellerByProductId.set(String(product._id), product.productSeller);
    }
  }

  let modified = 0;
  /** Позиции с удалённым товаром — продавца взять неоткуда, считаем отдельно. */
  let orphanLines = 0;

  const orderCursor = orders.find(needsBackfill).project({ "items.productId": 1 });
  for await (const order of orderCursor) {
    const pendingProductIds = new Set();
    for (const item of order.items ?? []) {
      if (item?.productId) {
        pendingProductIds.add(String(item.productId));
      }
    }

    let touched = false;
    for (const productId of pendingProductIds) {
      const sellerId = sellerByProductId.get(productId);
      if (!sellerId) {
        orphanLines += 1;
        continue;
      }
      const result = await orders.updateOne(
        { _id: order._id },
        { $set: { "items.$[el].sellerIdAtOrder": sellerId } },
        {
          arrayFilters: [
            {
              "el.productId": findRawProductId(productId, order),
              $or: [
                { "el.sellerIdAtOrder": { $exists: false } },
                { "el.sellerIdAtOrder": null },
              ],
            },
          ],
        },
      );
      if (result.modifiedCount > 0) {
        touched = true;
      }
    }
    if (touched) {
      modified += 1;
    }
  }

  return { matched, modified, orphanLines };
}

/**
 * `arrayFilters` сравнивает ObjectId строго по типу, строка не совпадёт.
 * Берём исходное значение из документа, а не пересобираем из строки.
 *
 * @param {string} productId
 * @param {{ items?: Array<{ productId?: unknown }> }} order
 */
function findRawProductId(productId, order) {
  for (const item of order.items ?? []) {
    if (item?.productId && String(item.productId) === productId) {
      return item.productId;
    }
  }
  return null;
}
