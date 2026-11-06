import {
  POINTS_SALE_AUTO_RELEASE_DAYS,
  PRODUCT_POINTS_SALE_INSUFFICIENT_MESSAGE,
  splitPointsSaleForPlatform,
} from "@molha/api-contract";

import {
  POINTS_PAYMENT_RELEASE_BATCH_SIZE,
  POINTS_PAYMENT_STATE_HELD,
  POINTS_PAYMENT_STATE_REFUNDED,
  POINTS_PAYMENT_STATE_RELEASED,
} from "../../constants/loyaltyPointsConstants.js";
import { ORDER_STATUS_DELIVERED } from "../../constants/orderConstants.js";
import { AppError } from "../../errors/AppError.js";
import { OrderModel } from "../../models/index.js";
import { runInTransaction } from "../../utils/mongoTransaction.js";
import { logServerEvent } from "../../utils/logServerEvent.js";
import {
  chargeReservedLoyaltyPoints,
  releaseLoyaltyPointsReservation,
  reserveLoyaltyPoints,
} from "../loyalty/loyaltyPointsReserve.js";
import {
  creditLoyaltyPoints,
  InsufficientLoyaltyPointsError,
} from "../loyalty/loyaltyPointsSpend.js";
import { logMoneyEvent } from "../loyalty/logMoneyEvent.js";

/**
 * Оплата товара за баллы — эскроу в баллах, по позициям.
 *
 * Баллы покупателя при заказе не списываются, а уходят в его резерв
 * (`userLoyaltyPointsReserved`): потратить их на что-то другое он уже не
 * может, но и продавец их ещё не получил. Дальше у позиции три исхода, как у
 * рублёвого эскроу:
 * - подтверждение получения или 7 дней после вручения → баллы уходят
 *   продавцу за вычетом комиссии площадки (`released`);
 * - отмена или возврат до этого → резерв снимается, баллы снова свободны
 *   у покупателя (`refunded`);
 * - возврат после выплаты продавцу автоматически не откатывается — это спор.
 *
 * Состояние живёт на самой позиции, а не в отдельном леджере: переходы
 * делаются внутри тех же транзакций, что меняют статус позиции, и проверка
 * `state === held` на перечитанном документе защищает от двойной проводки.
 */

/**
 * @param {{ pointsPrice: number | null; quantity: number }} params
 */
export const buildOrderLinePointsSnapshot = ({ pointsPrice, quantity }) => {
  const price = Math.max(0, Math.floor(Number(pointsPrice) || 0));
  const qty = Math.max(0, Math.floor(Number(quantity) || 0));
  const total = price * qty;
  return {
    pointsPriceAtOrder: price,
    pointsPaidTotal: total,
    pointsPaymentState: total > 0 ? POINTS_PAYMENT_STATE_HELD : null,
    pointsCommissionTotal: 0,
    pointsSettledAt: null,
  };
};

/**
 * Резерв баллов покупателя под новый заказ. Вызывается в транзакции заказа.
 *
 * @param {{ buyerId: string; total: number; session: import("mongoose").ClientSession | null }} params
 */
export const holdPointsForNewOrder = async ({ buyerId, total, session }) => {
  const amount = Math.floor(Number(total) || 0);
  if (amount <= 0) {
    return;
  }
  try {
    await reserveLoyaltyPoints({ userId: buyerId, amount, session });
  } catch (error) {
    if (error instanceof InsufficientLoyaltyPointsError) {
      throw new AppError(
        400,
        `${PRODUCT_POINTS_SALE_INSUFFICIENT_MESSAGE}: нужно ${error.required}, доступно ${error.available}`,
      );
    }
    throw error;
  }
};

/** @param {any} item */
const isPointsHeld = (item) =>
  item?.pointsPaymentState === POINTS_PAYMENT_STATE_HELD &&
  Math.floor(Number(item?.pointsPaidTotal) || 0) > 0;

/**
 * Вернуть баллы позиции покупателю (отмена, возврат до выплаты).
 * Меняет позицию на месте — документ сохраняет вызывающий в той же транзакции.
 * Повторный вызов ничего не делает.
 *
 * @param {{ item: any; buyerId: unknown; session: import("mongoose").ClientSession | null }} params
 * @returns {Promise<number>} сколько баллов вернулось
 */
export const refundPointsPaymentForItem = async ({ item, buyerId, session }) => {
  if (!isPointsHeld(item)) {
    return 0;
  }
  const amount = Math.floor(Number(item.pointsPaidTotal));
  await releaseLoyaltyPointsReservation({
    userId: String(buyerId),
    amount,
    session,
  });
  item.pointsPaymentState = POINTS_PAYMENT_STATE_REFUNDED;
  item.pointsSettledAt = new Date();
  logMoneyEvent("info", "points_sale_refund", {
    userId: String(buyerId),
    amount,
    currency: "LP",
  });
  return amount;
};

/**
 * Позиции заказа, по которым надо вернуть баллы при отмене: удобная обёртка
 * для путей, где отменяется сразу несколько позиций.
 *
 * @param {{ items: any[]; buyerId: unknown; session: import("mongoose").ClientSession | null }} params
 */
export const refundPointsPaymentForItems = async ({ items, buyerId, session }) => {
  let refunded = 0;
  for (const item of Array.isArray(items) ? items : []) {
    refunded += await refundPointsPaymentForItem({ item, buyerId, session });
  }
  return refunded;
};

/**
 * Отдать баллы позиции продавцу: списать резерв покупателя и начислить
 * продавцу его долю. Комиссия площадки просто не начисляется никому —
 * баллы площадки не копятся на чьём-то счёте.
 *
 * @param {{ item: any; buyerId: unknown; sellerId: unknown; session: import("mongoose").ClientSession | null; reason: "confirmed" | "timeout" }} params
 * @returns {Promise<number>} сколько баллов получил продавец
 */
export const settlePointsPaymentForItem = async ({
  item,
  buyerId,
  sellerId,
  session,
  reason,
}) => {
  if (!isPointsHeld(item)) {
    return 0;
  }
  if (!sellerId) {
    throw new AppError(400, "Продавец позиции не найден");
  }
  const split = splitPointsSaleForPlatform(item.pointsPaidTotal);
  await chargeReservedLoyaltyPoints({
    userId: String(buyerId),
    amount: split.total,
    session,
  });
  if (split.seller > 0) {
    await creditLoyaltyPoints({
      userId: String(sellerId),
      amount: split.seller,
      session,
    });
  }
  item.pointsPaymentState = POINTS_PAYMENT_STATE_RELEASED;
  item.pointsCommissionTotal = split.commission;
  item.pointsSettledAt = new Date();
  logMoneyEvent("info", "points_sale_release", {
    userId: String(sellerId),
    buyerId: String(buyerId),
    amount: split.total,
    sellerAmount: split.seller,
    commission: split.commission,
    currency: "LP",
    reason,
  });
  return split.seller;
};

/** @param {any} item */
const resolveItemSellerId = (item) =>
  String(
    item?.sellerIdAtOrder ??
      item?.productId?.productSeller?._id ??
      item?.productId?.productSeller ??
      "",
  );

/**
 * Крон: позиции за баллы, вручённые больше 7 дней назад и не подтверждённые
 * покупателем, — баллы уходят продавцу. Покупатель получил товар и просто не
 * нажал «Подтвердить»; без таймера продавец не получил бы ничего.
 *
 * Каждый заказ — своя транзакция: сбой по одному не должен стопорить остальные.
 *
 * @param {{ now?: Date }} [options]
 */
export async function processPointsPaymentReleaseCronTasks({ now = new Date() } = {}) {
  const cutoff = new Date(
    now.getTime() - POINTS_SALE_AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000,
  );
  const dueFilter = {
    pointsPaymentState: POINTS_PAYMENT_STATE_HELD,
    status: ORDER_STATUS_DELIVERED,
    deliveredAt: { $lte: cutoff },
  };
  const due = await OrderModel.find({
    paidWithLoyaltyPoints: true,
    items: { $elemMatch: dueFilter },
  })
    .select("_id")
    .limit(POINTS_PAYMENT_RELEASE_BATCH_SIZE)
    .lean();

  let released = 0;
  let failed = 0;

  for (const row of due) {
    try {
      released += await runInTransaction(async (session) => {
        const order = await OrderModel.findById(row._id).session(session);
        if (!order) {
          return 0;
        }
        let count = 0;
        for (const item of order.items) {
          const isDue =
            isPointsHeld(item) &&
            item.status === ORDER_STATUS_DELIVERED &&
            item.deliveredAt instanceof Date &&
            item.deliveredAt <= cutoff;
          if (!isDue) {
            continue;
          }
          await settlePointsPaymentForItem({
            item,
            buyerId: order.userBuyerId,
            sellerId: resolveItemSellerId(item),
            session,
            reason: "timeout",
          });
          count += 1;
        }
        if (count > 0) {
          await order.save({ session });
        }
        return count;
      });
    } catch (error) {
      failed += 1;
      logServerEvent("error", {
        event: "points_sale_auto_release_failed",
        orderId: String(row._id),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { released, failed };
}
