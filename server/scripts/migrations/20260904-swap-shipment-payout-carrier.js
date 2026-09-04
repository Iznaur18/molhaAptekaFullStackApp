import { PRODUCT_DELIVERY_CARRIERS } from "@molha/api-contract";

/**
 * Чинит перепутанные `sellerPayoutRequisites` ↔ `deliveryCarrier` на
 * отправлениях.
 *
 * В `createOrder` аргументы `buildStoredShipments` шли в порядке
 * `…, carrier, payout` вместо `…, payout, carrier`. В реквизиты попадал код
 * перевозчика (`seller` / `gitorg_courier` / `lobo`), а настоящие реквизиты —
 * в `deliveryCarrier`.
 *
 * Меняем местами только когда payout выглядит как код перевозчика, а carrier —
 * нет (или пустой). Иначе чужие данные не трогаем.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const orders = db.collection("orders");
  const carrierSet = new Set(PRODUCT_DELIVERY_CARRIERS);

  const filter = {
    shipments: {
      $elemMatch: {
        sellerPayoutRequisites: { $in: [...carrierSet] },
      },
    },
  };

  const matched = await orders.countDocuments(filter);
  if (!isApply) {
    return { matched, wouldMigrate: matched };
  }

  let modified = 0;
  let swapped = 0;

  const cursor = orders.find(filter).project({ shipments: 1 });
  for await (const order of cursor) {
    let dirty = false;
    const shipments = (order.shipments ?? []).map((row) => {
      if (!row || typeof row !== "object") return row;
      const payout = String(row.sellerPayoutRequisites ?? "").trim();
      const carrier = String(row.deliveryCarrier ?? "").trim();
      if (!carrierSet.has(payout)) return row;
      if (carrierSet.has(carrier)) return row;

      dirty = true;
      swapped += 1;
      return {
        ...row,
        sellerPayoutRequisites: carrier,
        deliveryCarrier: payout,
      };
    });

    if (!dirty) continue;
    const result = await orders.updateOne(
      { _id: order._id },
      { $set: { shipments } },
    );
    modified += result.modifiedCount;
  }

  return { matched, modified, swapped };
}
