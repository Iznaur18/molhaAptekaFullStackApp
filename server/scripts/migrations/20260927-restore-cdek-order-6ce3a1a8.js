import { ObjectId } from "mongodb";

/**
 * Возвращает в «Отгружен» заказ 6CE3A1A8, закрытый по ошибке.
 *
 * 25.09.2026 покупатель нажал «Отказаться», пока посылка СДЭК ещё ехала в
 * пункт: позиция стала «Возвращён», и опрос СДЭК перестал спрашивать заказ —
 * хотя СДЭК довёз посылку и держит её в пункте до 3 октября. Теперь такую
 * кнопку у отправлений СДЭК и Яндекса убрали, а этот заказ чиним точечно:
 *
 * - позиция и заказ снова «Отгружен», отметка возврата снята — опрос СДЭК
 *   подхватит статус («Готов к выдаче») и сам поставит «Доставлен»;
 * - резерв баллов продавца под заказ, снятый возвратом, ставим обратно, если
 *   у продавца хватает свободных баллов; иначе оставляем снятым — покупатель
 *   просто не получит баллы за этот заказ, двойного списания не будет.
 *
 * Эскроу у заказа нет (оплата наличными в СДЭК), счётчик продаж при возврате
 * из «Отгружен» не менялся. Трогаем только эту позицию и только пока она
 * «Возвращён» по кнопке покупателя, а накладная СДЭК жива.
 *
 * @param {{ db: import('mongodb').Db; isApply: boolean }} ctx
 */
export async function up({ db, isApply }) {
  const orders = db.collection("orders");
  const users = db.collection("users");
  const orderId = new ObjectId("6ab52c0d653809936ce3a1a8");

  const order = await orders.findOne({ _id: orderId });
  if (!order) {
    return { skipped: "заказ не найден" };
  }

  const item = order.items?.[0];
  const shipment = (order.shipments ?? []).find(
    (row) => String(row?.sellerId) === String(item?.sellerIdAtOrder),
  );
  const refusedByBuyer =
    item?.status === "returned" &&
    String(item?.returnedBy) === String(order.userBuyerId);
  const waybillAlive =
    Boolean(shipment?.cdekWaybill?.uuid) && !shipment?.cdekWaybill?.returnUuid;

  if (!refusedByBuyer || !waybillAlive) {
    return {
      skipped: "уже исправлено или состояние не то, что ожидали",
      itemStatus: item?.status ?? null,
      waybillAlive,
    };
  }

  const reserveTotal = Math.ceil(Number(item.loyaltyPointsReservedTotal) || 0);
  const sellerId = item.sellerIdAtOrder;
  const seller = await users.findOne(
    { _id: sellerId },
    { projection: { userLoyaltyPoints: 1, userLoyaltyPointsReserved: 1 } },
  );
  const available =
    (Number(seller?.userLoyaltyPoints) || 0) -
    (Number(seller?.userLoyaltyPointsReserved) || 0);
  const restoreReserve =
    item.loyaltyPointsReserveReleased === true &&
    !item.loyaltyPointsAwarded &&
    reserveTotal > 0 &&
    available >= reserveTotal;

  const plan = {
    orderStatus: `${order.status} → shipped`,
    itemStatus: `${item.status} → shipped`,
    loyaltyReserve: restoreReserve
      ? `вернуть резерв ${reserveTotal} баллов продавца (свободно ${available})`
      : `оставить снятым (резерв ${reserveTotal}, свободно ${available})`,
  };

  if (!isApply) {
    return { dryRun: true, ...plan };
  }

  const set = {
    status: "shipped",
    "items.0.status": "shipped",
  };
  if (restoreReserve) {
    set["items.0.loyaltyPointsReserveReleased"] = false;
  }
  const updated = await orders.updateOne(
    { _id: orderId, "items.0.status": "returned" },
    {
      $set: set,
      $unset: { "items.0.returnedAt": "", "items.0.returnedBy": "" },
    },
  );

  let reserved = 0;
  if (updated.modifiedCount === 1 && restoreReserve) {
    const result = await users.updateOne(
      { _id: sellerId },
      { $inc: { userLoyaltyPointsReserved: reserveTotal } },
    );
    reserved = result.modifiedCount === 1 ? reserveTotal : 0;
  }

  return { ...plan, orderModified: updated.modifiedCount, reservedPoints: reserved };
}
