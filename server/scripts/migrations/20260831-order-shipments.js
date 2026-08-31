/**
 * Backfill `orders.shipments` — отправлений по продавцам.
 *
 * До этого способ получения был один на весь заказ. Разносим его по
 * продавцам как есть: у старых заказов он и правда был общий, менять
 * задним числом нечего.
 *
 * Идёт строго после `20260831-order-line-seller-id`: группировать без
 * `items.sellerIdAtOrder` не по чему.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const orders = db.collection("orders");

  const needsBackfill = {
    $or: [{ shipments: { $exists: false } }, { shipments: { $size: 0 } }],
  };

  const matched = await orders.countDocuments(needsBackfill);

  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  let modified = 0;
  /** Заказы, где ни у одной позиции нет продавца — отправлений не собрать. */
  let skippedWithoutSeller = 0;

  const cursor = orders
    .find(needsBackfill)
    .project({ "items.sellerIdAtOrder": 1, fulfillmentMethod: 1 });

  for await (const order of cursor) {
    const fulfillmentMethod =
      order.fulfillmentMethod === "delivery" ? "delivery" : "pickup";

    /** @type {Map<string, unknown>} */
    const sellerIds = new Map();
    for (const item of order.items ?? []) {
      if (item?.sellerIdAtOrder) {
        sellerIds.set(String(item.sellerIdAtOrder), item.sellerIdAtOrder);
      }
    }

    if (sellerIds.size === 0) {
      skippedWithoutSeller += 1;
      continue;
    }

    const shipments = [...sellerIds.values()].map((sellerId) => ({
      sellerId,
      fulfillmentMethod,
    }));

    const result = await orders.updateOne(
      { _id: order._id, ...needsBackfill },
      { $set: { shipments } },
    );
    modified += result.modifiedCount;
  }

  return { matched, modified, skippedWithoutSeller };
}
